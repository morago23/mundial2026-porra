import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  deleteDoc,
  query,
  where,
  serverTimestamp,
  Timestamp,
  orderBy,
  collectionGroup,
  arrayUnion,
  arrayRemove,
  increment,
} from "firebase/firestore";
import { db } from "./config";
import { nanoid } from "nanoid";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface PorraSettings {
  enableFantasy: boolean;
  enablePredictor: boolean;
}

export interface Porra {
  id: string;
  name: string;
  createdBy: string; // uid
  createdByName: string;
  createdByPhoto: string;
  createdAt: Timestamp;
  memberCount: number;
  settings?: PorraSettings;
  // Real awards (admin sets these at end of tournament)
  awards?: {
    mvp?: string;
    pichichi?: string;
    guanteOro?: string;
    mejorJoven?: string;
  };
}

export interface MatchPrediction {
  homeScore: number | null;
  awayScore: number | null;
}

export interface UserPredictions {
  userId: string;
  userName: string;
  userPhoto: string;
  predictions: Record<string, MatchPrediction>;
  updatedAt: Timestamp;
}

export interface Apuesta {
  id: string; // uid of the user
  porraId: string;
  userName: string;
  userPhoto: string;
  teams: string[]; // 10 team codes
  totalValue: number;
  mvp: string;
  pichichi: string;
  guanteOro: string;
  mejorJoven: string;
  createdAt: Timestamp;
}

// ─── Porras ──────────────────────────────────────────────────────────────────

export async function createPorra(
  name: string,
  userId: string,
  userName: string,
  userPhoto: string,
  firstBet: Omit<Apuesta, "id" | "porraId" | "userName" | "userPhoto" | "createdAt"> | null,
  settings: PorraSettings = { enableFantasy: true, enablePredictor: true }
): Promise<string> {
  const id = nanoid(10);

  const porraRef = doc(db, "porras", id);
  await setDoc(porraRef, {
    id,
    name,
    createdBy: userId,
    createdByName: userName,
    createdByPhoto: userPhoto,
    createdAt: serverTimestamp(),
    memberCount: 1,
    settings,
    awards: {},
  });

  // Save the creator's bet if provided
  if (firstBet && settings.enableFantasy) {
    const betRef = doc(db, "porras", id, "apuestas", userId);
    await setDoc(betRef, {
      id: userId,
      porraId: id,
      userName,
      userPhoto,
      ...firstBet,
      createdAt: serverTimestamp(),
    });
  }

  // Track the league in the user's document
  await setDoc(doc(db, "users", userId), {
    leagues: arrayUnion(id)
  }, { merge: true });

  return id;
}

export async function getPorra(id: string): Promise<Porra | null> {
  const snap = await getDoc(doc(db, "porras", id));
  if (!snap.exists()) return null;
  return snap.data() as Porra;
}

export async function updatePorraSettings(id: string, settings: PorraSettings): Promise<void> {
  await setDoc(doc(db, "porras", id), { settings }, { merge: true });
}

export async function getMyPorras(userId: string): Promise<Porra[]> {
  const q = query(
    collection(db, "porras"),
    where("createdBy", "==", userId),
    orderBy("createdAt", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => d.data() as Porra);
}

// ─── Apuestas ─────────────────────────────────────────────────────────────────

export async function getApuesta(porraId: string, userId: string): Promise<Apuesta | null> {
  const snap = await getDoc(doc(db, "porras", porraId, "apuestas", userId));
  if (!snap.exists()) return null;
  return snap.data() as Apuesta;
}

export async function hasApuesta(porraId: string, userId: string): Promise<boolean> {
  const snap = await getDoc(doc(db, "porras", porraId, "apuestas", userId));
  return snap.exists();
}

export async function saveApuesta(
  porraId: string,
  userId: string,
  userName: string,
  userPhoto: string,
  bet: Omit<Apuesta, "id" | "porraId" | "userName" | "userPhoto" | "createdAt">
): Promise<void> {
  // Check if already exists — immutable!
  const existing = await hasApuesta(porraId, userId);
  if (existing) throw new Error("Ya has hecho tu apuesta. No se puede cambiar.");

  const betRef = doc(db, "porras", porraId, "apuestas", userId);
  await setDoc(betRef, {
    id: userId,
    porraId,
    userName,
    userPhoto,
    ...bet,
    createdAt: serverTimestamp(),
  });

  // Track the league in the user's document
  await setDoc(doc(db, "users", userId), {
    leagues: arrayUnion(porraId)
  }, { merge: true });

  // Increment member count atomically
  const porraRef = doc(db, "porras", porraId);
  await setDoc(porraRef, { memberCount: increment(1) }, { merge: true });
}

export async function getApuestas(porraId: string): Promise<Apuesta[]> {
  const snap = await getDocs(
    query(collection(db, "porras", porraId, "apuestas"), orderBy("createdAt", "asc"))
  );
  return snap.docs.map((d) => d.data() as Apuesta);
}

export async function getUserLeagues(userId: string): Promise<{ porra: Porra; apuesta: Apuesta }[]> {
  // Strategy 1: Read from users/{userId}.leagues array (fast path)
  try {
    const userSnap = await getDoc(doc(db, "users", userId));
    if (userSnap.exists() && Array.isArray(userSnap.data().leagues) && userSnap.data().leagues.length > 0) {
      const leagueIds: string[] = userSnap.data().leagues;
      const result: { porra: Porra; apuesta: Apuesta }[] = [];
      
      for (const pid of leagueIds) {
        try {
          const [apSnap, pSnap] = await Promise.all([
            getDoc(doc(db, "porras", pid, "apuestas", userId)),
            getDoc(doc(db, "porras", pid)),
          ]);
          if (apSnap.exists() && pSnap.exists()) {
            result.push({ porra: pSnap.data() as Porra, apuesta: apSnap.data() as Apuesta });
          }
        } catch {
          // Skip leagues that fail individually
        }
      }
      
      result.sort((a, b) => b.apuesta.createdAt.toMillis() - a.apuesta.createdAt.toMillis());
      return result;
    }
  } catch {
    // Fall through to Strategy 2
  }

  // Strategy 2: collectionGroup query across all 'apuestas' subcollections
  try {
    const q = query(collectionGroup(db, "apuestas"), where("id", "==", userId));
    const snap = await getDocs(q);
    
    if (snap.empty) return [];
    
    const apuestas = snap.docs.map((d) => d.data() as Apuesta);
    const porraIds = Array.from(new Set(apuestas.map((a) => a.porraId)));
    
    const porrasSnaps = await Promise.all(porraIds.map((pid) => getDoc(doc(db, "porras", pid))));
    const porrasMap = new Map<string, Porra>();
    porrasSnaps.forEach((ps) => { if (ps.exists()) porrasMap.set(ps.id, ps.data() as Porra); });

    const result: { porra: Porra; apuesta: Apuesta }[] = [];
    for (const apuesta of apuestas) {
      const porra = porrasMap.get(apuesta.porraId);
      if (porra) result.push({ porra, apuesta });
    }
    
    result.sort((a, b) => b.apuesta.createdAt.toMillis() - a.apuesta.createdAt.toMillis());
    
    // Auto-heal: write the found leagues to the user document for future fast lookups
    if (result.length > 0) {
      const leagueIds = result.map((r) => r.porra.id);
      setDoc(doc(db, "users", userId), { leagues: leagueIds }, { merge: true }).catch(() => {});
    }
    
    return result;
  } catch {
    // Fall through to Strategy 3
  }

  // Strategy 3: Brute-force scan all porras (last resort)
  try {
    const allPorras = await getDocs(collection(db, "porras"));
    const result: { porra: Porra; apuesta: Apuesta }[] = [];
    
    await Promise.all(
      allPorras.docs.map(async (pDoc) => {
        try {
          const apSnap = await getDoc(doc(db, "porras", pDoc.id, "apuestas", userId));
          if (apSnap.exists()) {
            result.push({ porra: pDoc.data() as Porra, apuesta: apSnap.data() as Apuesta });
          }
        } catch { /* skip */ }
      })
    );
    
    result.sort((a, b) => b.apuesta.createdAt.toMillis() - a.apuesta.createdAt.toMillis());
    
    // Auto-heal
    if (result.length > 0) {
      const leagueIds = result.map((r) => r.porra.id);
      setDoc(doc(db, "users", userId), { leagues: leagueIds }, { merge: true }).catch(() => {});
    }
    
    return result;
  } catch (err) {
    console.error("getUserLeagues: all strategies failed", err);
    return [];
  }
}

// ─── Admin Functions ──────────────────────────────────────────────────────────

/** Creator removes a user from the league */
export async function removeUserFromLeague(porraId: string, targetUserId: string, requesterId: string): Promise<void> {
  const porraSnap = await getDoc(doc(db, "porras", porraId));
  if (!porraSnap.exists()) throw new Error("Liga no encontrada");
  if (porraSnap.data().createdBy !== requesterId) throw new Error("Solo el creador puede eliminar jugadores");

  await deleteDoc(doc(db, "porras", porraId, "apuestas", targetUserId));

  // Remove from user's leagues index
  await setDoc(doc(db, "users", targetUserId), { leagues: arrayRemove(porraId) }, { merge: true }).catch(() => {});

  // Decrement member count atomically
  await setDoc(doc(db, "porras", porraId), { memberCount: increment(-1) }, { merge: true });
}

/** User leaves a league voluntarily */
export async function leaveLeague(porraId: string, userId: string): Promise<void> {
  // Try to remove from apuestas
  await deleteDoc(doc(db, "porras", porraId, "apuestas", userId));
  
  // Try to remove from predicciones
  await deleteDoc(doc(db, "porras", porraId, "predicciones", userId));

  // Remove tracking from user doc
  await setDoc(doc(db, "users", userId), {
    leagues: arrayRemove(porraId)
  }, { merge: true });

  // Decrement member count safely
  await setDoc(doc(db, "porras", porraId), {
    memberCount: increment(-1)
  }, { merge: true });
}

/** Creator deletes the entire league and all bets */
export async function deletePorra(porraId: string, requesterId: string): Promise<void> {
  const porraSnap = await getDoc(doc(db, "porras", porraId));
  if (!porraSnap.exists()) throw new Error("Liga no encontrada");
  if (porraSnap.data().createdBy !== requesterId) throw new Error("Solo el creador puede borrar la liga");

  // Delete all apuestas
  const apuestasSnap = await getDocs(collection(db, "porras", porraId, "apuestas"));
  await Promise.all(
    apuestasSnap.docs.map(async (d) => {
      // Remove from user index
      await setDoc(doc(db, "users", d.id), { leagues: arrayRemove(porraId) }, { merge: true }).catch(() => {});
      await deleteDoc(d.ref);
    })
  );

  // Delete the porra document
  await deleteDoc(doc(db, "porras", porraId));
}

// ─── Predicciones (Quiniela) ──────────────────────────────────────────────────

export async function saveMatchPredictions(
  porraId: string,
  userId: string,
  userName: string,
  userPhoto: string,
  predictions: Record<string, MatchPrediction>
): Promise<void> {
  const ref = doc(db, "porras", porraId, "predicciones", userId);
  await setDoc(ref, {
    userId,
    userName,
    userPhoto,
    predictions,
    updatedAt: serverTimestamp(),
  }, { merge: true });
}

export async function getUserPredictions(porraId: string, userId: string): Promise<UserPredictions | null> {
  const snap = await getDoc(doc(db, "porras", porraId, "predicciones", userId));
  if (!snap.exists()) return null;
  return snap.data() as UserPredictions;
}

export async function getAllPredictions(porraId: string): Promise<UserPredictions[]> {
  const snap = await getDocs(collection(db, "porras", porraId, "predicciones"));
  return snap.docs.map(d => d.data() as UserPredictions);
}

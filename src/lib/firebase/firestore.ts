import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  query,
  where,
  serverTimestamp,
  Timestamp,
  orderBy,
  collectionGroup,
  arrayUnion,
} from "firebase/firestore";
import { db } from "./config";
import { nanoid } from "nanoid";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface Porra {
  id: string;
  name: string;
  createdBy: string; // uid
  createdByName: string;
  createdByPhoto: string;
  createdAt: Timestamp;
  memberCount: number;
  // Real awards (admin sets these at end of tournament)
  awards?: {
    mvp?: string;
    pichichi?: string;
    guanteOro?: string;
    mejorJoven?: string;
  };
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
  firstBet: Omit<Apuesta, "id" | "porraId" | "userName" | "userPhoto" | "createdAt">
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
    awards: {},
  });

  // Save the creator's bet
  const betRef = doc(db, "porras", id, "apuestas", userId);
  await setDoc(betRef, {
    id: userId,
    porraId: id,
    userName,
    userPhoto,
    ...firstBet,
    createdAt: serverTimestamp(),
  });

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

  // Increment member count
  const porraRef = doc(db, "porras", porraId);
  const porraSnap = await getDoc(porraRef);
  if (porraSnap.exists()) {
    const current = porraSnap.data().memberCount ?? 0;
    await setDoc(porraRef, { memberCount: current + 1 }, { merge: true });
  }
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


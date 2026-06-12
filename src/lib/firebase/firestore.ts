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

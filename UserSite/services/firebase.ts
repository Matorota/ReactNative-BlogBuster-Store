import { db } from "../FirebaseConfig";
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  onSnapshot,
  orderBy,
  limit,
} from "firebase/firestore";
import { Product, ShoppingCart, CartItem, User, Order } from "../types";

export const productsCollection = collection(db, "products");
export const cartsCollection = collection(db, "carts");
export const usersCollection = collection(db, "users");
export const ordersCollection = collection(db, "orders");

// User functions
export const createUser = async (userData: Omit<User, "id" | "createdAt">) => {
  const user: Omit<User, "id"> = {
    ...userData,
    createdAt: new Date(),
  };
  const docRef = await addDoc(usersCollection, user);
  return docRef.id;
};

export const getUserByEmail = async (email: string): Promise<User | null> => {
  const q = query(usersCollection, where("email", "==", email.toLowerCase()));
  const snapshot = await getDocs(q);
  if (snapshot.empty) return null;
  const doc = snapshot.docs[0];
  const data = doc.data();
  return {
    id: doc.id,
    ...data,
    createdAt: data.createdAt?.toDate
      ? data.createdAt.toDate()
      : data.createdAt,
    dateOfBirth: data.dateOfBirth?.toDate
      ? data.dateOfBirth.toDate()
      : data.dateOfBirth,
  } as User;
};

export const getUser = async (id: string): Promise<User | null> => {
  const docRef = doc(db, "users", id);
  const snapshot = await getDoc(docRef);
  if (!snapshot.exists()) return null;
  return { id: snapshot.id, ...snapshot.data() } as User;
};

// Product functions
export const addProduct = async (product: Omit<Product, "id">) => {
  const docRef = await addDoc(productsCollection, product);
  return docRef.id;
};

export const updateProduct = async (id: string, product: Partial<Product>) => {
  const docRef = doc(db, "products", id);
  await updateDoc(docRef, product as any);
};

export const deleteProduct = async (id: string) => {
  const docRef = doc(db, "products", id);
  await deleteDoc(docRef);
};

export const getProductByBarcode = async (
  barcode: string
): Promise<Product | null> => {
  const q = query(productsCollection, where("barcode", "==", barcode));
  const snapshot = await getDocs(q);
  if (snapshot.empty) return null;
  const doc = snapshot.docs[0];
  return { id: doc.id, ...doc.data() } as Product;
};

export const getAllProducts = async (): Promise<Product[]> => {
  const snapshot = await getDocs(productsCollection);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as Product);
};

// Cart functions
export const createCart = async (userId: string) => {
  const cart: Omit<ShoppingCart, "id"> = {
    userId,
    items: [],
    totalPrice: 0,
    createdAt: new Date(),
    status: "active",
  };
  const docRef = await addDoc(cartsCollection, cart);
  return docRef.id;
};

export const updateCart = async (id: string, cart: Partial<ShoppingCart>) => {
  const docRef = doc(db, "carts", id);
  await updateDoc(docRef, cart as any);
};

export const getCart = async (id: string): Promise<ShoppingCart | null> => {
  const docRef = doc(db, "carts", id);
  const snapshot = await getDoc(docRef);
  if (!snapshot.exists()) return null;
  return { id: snapshot.id, ...snapshot.data() } as ShoppingCart;
};

export const listenToCart = (
  cartId: string,
  callback: (cart: ShoppingCart | null) => void
) => {
  const docRef = doc(db, "carts", cartId);
  return onSnapshot(docRef, (snapshot) => {
    if (snapshot.exists()) {
      callback({ id: snapshot.id, ...snapshot.data() } as ShoppingCart);
    } else {
      callback(null);
    }
  });
};

export const getActiveCartsForUser = async (
  userId: string
): Promise<ShoppingCart[]> => {
  const q = query(
    cartsCollection,
    where("userId", "==", userId),
    where("status", "==", "active")
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(
    (doc) => ({ id: doc.id, ...doc.data() }) as ShoppingCart
  );
};

export const listenToCarts = (callback: (carts: ShoppingCart[]) => void) => {
  return onSnapshot(cartsCollection, (snapshot) => {
    const carts = snapshot.docs.map(
      (doc) => ({ id: doc.id, ...doc.data() }) as ShoppingCart
    );
    callback(carts);
  });
};

// Order functions
export const createOrder = async (
  orderData: Omit<Order, "id" | "createdAt">
) => {
  const order: Omit<Order, "id"> = {
    ...orderData,
    createdAt: new Date(),
  };
  const docRef = await addDoc(ordersCollection, order);
  return docRef.id;
};

export const getUserOrders = async (userId: string): Promise<Order[]> => {
  try {
    const q = query(
      ordersCollection,
      where("userId", "==", userId),
      orderBy("createdAt", "desc")
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate
          ? data.createdAt.toDate()
          : data.createdAt,
        completedAt: data.completedAt?.toDate
          ? data.completedAt.toDate()
          : data.completedAt,
      } as Order;
    });
  } catch (error) {
    console.error("Error fetching orders:", error);
    throw error;
  }
};

export const updateOrder = async (id: string, order: Partial<Order>) => {
  const docRef = doc(db, "orders", id);
  await updateDoc(docRef, order as any);
};

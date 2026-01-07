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
} from "firebase/firestore";
import { Product, ShoppingCart, CartItem } from "../types";

export const productsCollection = collection(db, "products");
export const cartsCollection = collection(db, "carts");
export const ordersCollection = collection(db, "orders");

export const addProduct = async (product: Omit<Product, "id">) => {
  const docRef = await addDoc(productsCollection, product);
  return docRef.id;
};

export const updateProduct = async (id: string, product: Partial<Product>) => {
  const docRef = doc(db, "products", id);
  await updateDoc(docRef, product as any);
};

export const reduceProductStock = async (
  productId: string,
  quantity: number
) => {
  const docRef = doc(db, "products", productId);
  const snapshot = await getDoc(docRef);
  if (snapshot.exists()) {
    const product = snapshot.data() as Product;
    if (product.stock !== undefined) {
      const newStock = Math.max(0, product.stock - quantity);
      await updateDoc(docRef, { stock: newStock });
    }
  }
};

export const deleteProduct = async (id: string) => {
  const docRef = doc(db, "products", id);
  await deleteDoc(docRef);
};

export const getProductByQRCode = async (
  qrCode: string
): Promise<Product | null> => {
  const q = query(productsCollection, where("qrCode", "==", qrCode));
  const snapshot = await getDocs(q);
  if (snapshot.empty) return null;
  const doc = snapshot.docs[0];
  return { id: doc.id, ...doc.data() } as Product;
};

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

export const getAllProducts = async (): Promise<Product[]> => {
  const snapshot = await getDocs(productsCollection);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as Product);
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

export const createOrder = async (cart: ShoppingCart) => {
  const order = {
    userId: cart.userId,
    items: cart.items,
    totalPrice: cart.totalPrice,
    status: "completed",
    createdAt: new Date(),
    completedAt: new Date(),
  };
  const docRef = await addDoc(ordersCollection, order);
  return docRef.id;
};

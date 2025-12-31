import { addProduct } from "./services/firebase";

export const seedProducts = async () => {
  const products = [
    { name: "Coca Cola", price: 2.5, barcode: "5449000000996" },
    { name: "Beer", price: 3.99, barcode: "5410228881476", ageRestriction: 18 },
    {
      name: "Whiskey",
      price: 24.99,
      barcode: "5000267014159",
      ageRestriction: 21,
    },
    { name: "Chips", price: 1.99, barcode: "8710398780089" },
    { name: "Bread", price: 2.49, barcode: "8712566445219" },
    { name: "Milk", price: 1.89, barcode: "8718452393053" },
    { name: "Water", price: 0.99, barcode: "8710398521453" },
    {
      name: "Wine",
      price: 12.99,
      barcode: "3259130004441",
      ageRestriction: 18,
    },
  ];

  for (const product of products) {
    try {
      await addProduct(product);
      console.log(`Added: ${product.name}`);
    } catch (error) {
      console.error(`Failed to add ${product.name}:`, error);
    }
  }
};

const Product = require("./Product");
const { getDatabase } = require("../database");

const COLLECTION_NAME = "carts";

class Cart {
  static async getCart() {
    const db = getDatabase();

    try {
      const cart = await db.collection(COLLECTION_NAME).findOne({});
      if (!cart) {
        await db.collection(COLLECTION_NAME).insertOne({ items: [] });
        return { items: [] };
      }
      return cart;
    } catch (error) {
      console.error("Error in getCart():", error.message);
      return { items: [] };
    }
  }

  static async add(product) {
    const db = getDatabase();

    try {
      if (!product || !product.name) {
        throw new Error("Invalid product object");
      }

      const cart = await this.getCart();

      if (!Array.isArray(cart.items)) {
        cart.items = [];
      }

      const existingItem = cart.items.find(
        (item) => item.product.name === product.name
      );

      if (existingItem) {
        existingItem.quantity += 1;
      } else {
        cart.items.push({ product, quantity: 1 });
      }

      await db
        .collection(COLLECTION_NAME)
        .updateOne({}, { $set: { items: cart.items } }, { upsert: true });
    } catch (error) {
      console.error("Error in add():", error.message);
    }
  }

  static async getItems() {
    try {
      const cart = await this.getCart();
      return cart.items || [];
    } catch (error) {
      console.error("Error in getItems():", error.message);
      return [];
    }
  }

  static async getProductsQuantity() {
    try {
      const cart = await this.getCart();
      return (cart.items || []).reduce(
        (total, item) => total + item.quantity,
        0
      );
    } catch (error) {
      console.error("Error in getProductsQuantity():", error.message);
      return 0;
    }
  }

  static async getTotalPrice() {
    try {
      const cart = await this.getCart();
      return (cart.items || []).reduce(
        (total, item) => total + item.product.price * item.quantity,
        0
      );
    } catch (error) {
      console.error("Error in getTotalPrice():", error.message);
      return 0;
    }
  }

  static async clearCart() {
    const db = getDatabase();

    try {
      await db
        .collection(COLLECTION_NAME)
        .updateOne({}, { $set: { items: [] } }, { upsert: true });
    } catch (error) {
      console.error("Error in clearCart():", error.message);
    }
  }

  static async deleteProductByName(productName) {
    const db = getDatabase();

    try {
      const cart = await this.getCart();
      const filteredItems = (cart.items || []).filter(
        (item) => item.product.name !== productName
      );

      await db
        .collection(COLLECTION_NAME)
        .updateOne({}, { $set: { items: filteredItems } }, { upsert: true });
    } catch (error) {
      console.error("Error in deleteProductByName():", error.message);
    }
  }
}

module.exports = Cart;

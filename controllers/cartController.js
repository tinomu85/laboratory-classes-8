const Product = require("../models/Product");
const Cart = require("../models/Cart");
const { STATUS_CODE } = require("../constants/statusCode");

exports.getProductsCount = async () => {
  return await Cart.getProductsQuantity();
};

exports.addProductToCart = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ error: "No product name provided" });
    }

    const product = await Product.findByName(name);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    await Cart.add(product);
    res.sendStatus(200);
  } catch (error) {
    console.error("addProductToCart error:", error.message);
    res
      .status(STATUS_CODE.INTERNAL_SERVER_ERROR)
      .json({ error: error.message });
  }
};

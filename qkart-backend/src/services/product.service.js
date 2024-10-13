const { Product } = require("../models");

const getProductById = async (id) => {
  return Product.findById(id);
};

const searchProducts = async (value) => {
  return Product.find({ name: { $regex: value, $options: "i" } });
};

const getProducts = async () => {
  return Product.find({});
};

module.exports = {
  getProductById,
  getProducts,
  searchProducts,
};

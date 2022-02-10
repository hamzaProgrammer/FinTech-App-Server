const express = require('express');
const router = express.Router();
const {
   addNewProduct,
   updateProduct,
   deleteProduct,
   getAllProducts,
   getSingleProduct,
   getAllProductsCount
} = require('../controllers/ProductsController')


// Add Product
router.post('/api/product/addNew', addNewProduct)

// updating Product Account
router.put('/api/product/updateProduct/:id', updateProduct);

// Delete Product
router.delete('/api/product/deleteProduct/:id', deleteProduct)

// get all Products
router.get('/api/product/getAllProducts', getAllProducts)

// get all Prosucts Cont
router.get('/api/product/getAll/count', getAllProductsCount)

// get single Product
router.get('/api/product/getSingleProduct/:id', getSingleProduct)


module.exports = router;
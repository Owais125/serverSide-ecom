import express from 'express'
import { isAdmin, requireSignIn } from './../middlewears/authMiddleWear.js';
import { braintreePaymentController, braintreeTokenController, createProductController, deleteProductController, getFiltertController, getProductController, getSingleProductController, productCategoryController, productCountController, productListController, productPhotoController, relatedProductController, searchController, updateProductController } from '../controllers/productController.js';
import formidable from "express-formidable";

const router = express.Router()

router.post('/create-product',requireSignIn,isAdmin,formidable(),createProductController)
// get Product
router.get('/get-product',getProductController)
// get Single Product
router.get('/product/:slug',getSingleProductController)
// get photo
router.get('/product-photo/:pid',productPhotoController)
// delete product
router.delete('/delete-product/:pid',deleteProductController)
// Update Product
router.put('/update-product/:pid',requireSignIn,isAdmin,formidable(),updateProductController)
// filter Product
router.post('/product-filters',getFiltertController)
// product count
router.get('/product-count',productCountController)
// product per page
router.get('/product-list/:page',productListController)
// search product
router.get('/search/:keyword',searchController)
// similar product
router.get('/related-product/:pid/:cid',relatedProductController)
// categoey wise product
router.get('/product-category/:slug',productCategoryController)
// paymnet routes
// token
router.get('/braintree/token',braintreeTokenController)
// payment
router.post('/braintree/payment',requireSignIn,braintreePaymentController)

export default router
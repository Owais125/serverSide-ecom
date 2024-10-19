import slugify from "slugify";
import productModel from "../models/productModel.js";
import categoryModele from "../models/categoryModel.js";
import fs from "fs";
import braintree from "braintree";
import orderModel from "../models/orderModel.js";
import dotenv from 'dotenv'

dotenv.config()

// paynment getway
var gateway = new braintree.BraintreeGateway({
  environment: braintree.Environment.Sandbox,
  merchantId: process.env.BRAINTREE_MERCHANR_ID,
  publicKey: process.env.BRAINTREE_PUBLIC_KEY,
  privateKey: process.env.BRAINTREE_PRIVATE_KEY,
});

export const createProductController = async (req, res) => {
  try {
    const { name, slug, description, price, category, quantity, shipping } =
      req.fields;
    const { photo } = req.files;
    // validation
    switch (true) {
      case !name:
        return res.status(500).send({ error: "Name is Required" });
      case !description:
        return res.status(500).send({ error: "Description is Required" });
      case !price:
        return res.status(500).send({ error: "Price is Required" });
      case !category:
        return res.status(500).send({ error: "Category is Required" });
      case !quantity:
        return res.status(500).send({ error: "Quantity is Required" });
      case photo && photo.size > 10000000:
        return res
          .status(500)
          .send({ error: "Photo is Required and should be less than 1mb" });
    }

    const products = new productModel({ ...req.fields, slug: slugify(name) });
    if (photo) {
      products.photo.data = fs.readFileSync(photo.path);
      products.photo.contentType = photo.type;
    }
    await products.save();
    res.status(201).send({
      success: true,
      message: "Product Create SuccessFully",
      products,
    });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .send({ success: false, error, message: "Error in creating product" });
  }
};
export const getProductController = async (req, res) => {
  try {
    const products = await productModel
      .find({})
      .select("-photo")
      .populate("category")
      .limit(12)
      .sort({ createdAt: -1 });
    res.status(200).send({
      success: true,
      countTotal: products.length,
      message: "All products",
      products,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      error: error.message,
      message: "Error in getting products",
    });
  }
};
export const getSingleProductController = async (req, res) => {
  try {
    const product = await productModel
      .findOne({ slug: req.params.slug })
      .select("-photo")
      .populate("category");
    res
      .status(200)
      .send({ success: true, message: "Single Product Fetched", product });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      error: error.message,
      message: "Error While getting single product",
    });
  }
};
export const productPhotoController = async (req, res) => {
  try {
    const product = await productModel.findById(req.params.pid).select("photo");
    if (product.photo.data) {
      res.set("Content-type", product.photo.contentType);
      return res.status(200).send(product.photo.data);
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      error: error.message,
      message: "Error While getting photo",
    });
  }
};
export const deleteProductController = async (req, res) => {
  try {
    await productModel.findByIdAndDelete(req.params.pid).select("-photo");
    res
      .status(200)
      .send({ success: true, message: " Product Delete SuccessFully" });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .send({ success: false, error, message: "Error While deleting product" });
  }
};
export const updateProductController = async (req, res) => {
  try {
    const { name, slug, description, price, category, quantity, shipping } =
      req.fields;
    const { photo } = req.files;
    // validation
    switch (true) {
      case !name:
        return res.status(500).send({ error: "Name is Required" });
      case !description:
        return res.status(500).send({ error: "Description is Required" });
      case !price:
        return res.status(500).send({ error: "Price is Required" });
      case !category:
        return res.status(500).send({ error: "Category is Required" });
      case !quantity:
        return res.status(500).send({ error: "Quantity is Required" });
      case photo && photo.size > 10000000:
        return res
          .status(500)
          .send({ error: "Photo is Required and should be less than 1mb" });
    }

    const products = await productModel.findByIdAndUpdate(
      req.params.pid,
      { ...req.fields, slug: slugify(name) },
      { new: true }
    );
    if (photo) {
      products.photo.data = fs.readFileSync(photo.path);
      products.photo.contentType = photo.type;
    }
    await products.save();
    res.status(201).send({
      success: true,
      message: "Product Updated SuccessFully",
      products,
    });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .send({ success: false, error, message: "Error in update product" });
  }
};

// export const getFiltertController = async (req, res) => {
//   try {
//     const {checked,radio} = req.body
//     let args = {}
//     if (checked.length > 0) args.category = checked
//     if (checked.length > 0) args.price = {$gte:radio[0],$lte:radio[1]}
//     const products = await productModel.find(args)
//     res.status(200).send({ success: true, products });

//   } catch (error) {
//     console.log(error)
//     res
//     .status(400)
//     .send({ success: false, error, message: "Error while filtring products" });
//   }
// }

export const getFiltertController = async (req, res) => {
  try {
    const { checked, radio } = req.body;
    let args = {};

    // Filter by category if categories are checked
    if (checked.length > 0) {
      args.category = { $in: checked }; // Using $in to match any selected category
    }

    // Filter by price if price range (radio) is selected
    if (radio.length > 0) {
      args.price = { $gte: radio[0], $lte: radio[1] }; // Apply price range
    }

    const products = await productModel.find(args).select("-photo");
    res.status(200).send({ success: true, products });
  } catch (error) {
    console.log(error);
    res.status(400).send({
      success: false,
      error,
      message: "Error while filtering products",
    });
  }
};

export const productCountController = async (req, res) => {
  try {
    const total = await productModel.find({}).estimatedDocumentCount();
    res.status(200).send({ success: true, total });
  } catch (error) {
    console.log(error);
    res
      .status(400)
      .send({ success: false, error, message: "Error product count" });
  }
};
export const productListController = async (req, res) => {
  try {
    const perPage = 5;
    const page = req.params.page ? req.params.page : 1;
    const products = await productModel
      .find({})
      .select("-photo")
      .skip((page - 1) * perPage)
      .limit(perPage)
      .sort({ createdAt: -1 });

    res.status(200).send({ success: true, products });
  } catch (error) {
    console.log(error);
    res
      .status(400)
      .send({ success: false, error, message: "Error in per page ctrl" });
  }
};

export const searchController = async (req, res) => {
  try {
    const { keyword } = req.params;
    const results = await productModel
      .find({
        $or: [
          { name: { $regex: keyword, $options: "i" } },
          { description: { $regex: keyword, $options: "i" } },
        ],
      })
      .select("-photo");
    res.json(results);
  } catch (error) {
    console.log(error);
    res
      .status(400)
      .send({ success: false, error, message: "Error in Search product api" });
  }
};
export const relatedProductController = async (req, res) => {
  try {
    const { pid, cid } = req.params;
    const products = await productModel
      .find({
        category: cid,
        _id: { $ne: pid },
      })
      .populate("category")
      .select("-photo")
      .limit(3);
    res.status(200).send({ success: true, products });
  } catch (error) {
    console.log(error);
    res.status(400).send({
      success: false,
      error,
      message: "Error while getting related product ",
    });
  }
};

export const productCategoryController = async (req, res) => {
  try {
    const category = await categoryModele.findOne({ slug: req.params.slug });
    const products = await productModel.find({ category }).populate("category");
    res.status(200).send({ success: true, products, category });
  } catch (error) {
    res.status(400).send({
      success: false,
      error,
      message: "Error while getting  product ",
    });
  }
};

// payment gateway api
// token
export const braintreeTokenController = async (req, res) => {
  try {
    gateway.clientToken.generate({}, function (err, response) {
      if (err) {
        res.status(500).send(err);
      } else {
        res.send(response);
      }
    });
  } catch (error) {
    console.log(error);
  }
};
// payment
// export const braintreePaymentController = async (req, res) => {
//   try {
//     const { cart, nonce } = req.body;
//     let total = 0;
//     cart.map((i) => {
//       total += i.price;
//     });
//     let newTranscation = gateway.transaction.sale(
//       {
//         amount: total,
//         paymentMethodNonce: nonce,
//         options: {
//           submitForSettlement: true,
//         },
//       },
//       function (err, result) {
//         if (result) {
//           const order = new orderModel({
//             products: cart,
//             payment: result,
//             buyer: req.user._id, 
//           }).save();
//           req.json({ ok: true });
//         } else {
//           res.status(500).send(err);
//         }
//       }
//     );
//   } catch (error) {
//     console.log(error);
//   }
// };

export const braintreePaymentController = async (req, res) => {
  try {
    const { cart, nonce } = req.body;
    
    // Calculate total amount
    let total = 0;
    cart.forEach((item) => {
      total += item.price;
    });
    
    // Braintree transaction
    gateway.transaction.sale(
      {
        amount: total,  // Total amount to charge
        paymentMethodNonce: nonce,  // Payment nonce from client
        options: {
          submitForSettlement: true,  // Submit for settlement automatically
        },
      },
      async (err, result) => {
        if (result) {
          // Save the order in the database
          const order = await new orderModel({
            products: cart,
            payment: result,
            buyer: req.user._id,  // Assuming req.user._id contains the buyer's ID
          }).save();
          
          // Send success response
          res.json({ ok: true });
        } else {
          // Handle transaction error
          res.status(500).send(err);
        }
      }
    );
  } catch (error) {
    console.log(error,"in payment");
    res.status(500).send("Something went wrong during the payment process.");
  }
};


import categoryModel from "../models/categoryModel.js";
import slugify from "slugify";

export const createCategoryController = async (req, res) => {
    try {
        const {name} = req.body
        if (!name) {
            return res.status(401).send({message:"Name is required"})
        }
        const existingCategory = await categoryModel.findOne({name})
        if (existingCategory) {
            return res.status(200).send({success:true,message:"Category Already Exist"})
        }
        const category = await new categoryModel({name , slug:slugify(name)}).save()
        res.status(201).send({success:true,message:'new Category Created',category})
    } catch (error) {
        console.log(error);
        res
      .status(500)
      .send({ success: false, error, message: "Error in Category" });
    }
};

export const updateCategoryController = async (req, res) => {
    try {
        const {name} = req.body
        const {id} = req.params
        const category =  await categoryModel.findByIdAndUpdate(id,{name,slug:slugify(name)},{new:true})
        res.status(200).send({success:true,message:' Category Update SuccessFully ',category})
        
    } catch (error) {
        console.log(error);
        res
        .status(500)
        .send({ success: false, error, message: "Error While in updating Category" });
    }
}
export const categoryController = async (req, res) => {
    try {
        const category = await categoryModel.find({})
        res.status(200).send({success:true,message:'All Category List ',category})
    } catch (error) {
        console.log(error);
        res
        .status(500)
        .send({ success: false, error, message: "Error While getting all Category" }); 
    }
}
export const singleCategoryController = async (req, res) => {
    try {
        const category = await categoryModel.findOne({slug:req.params.slug})
        res.status(200).send({success:true,message:'Get Single Category SuccessFully',category})
        
    } catch (error) {
        console.log(error);
        res
        .status(500)
        .send({ success: false, error, message: "Error While getting Single Category" }); 
    }
}
export const deleteCategoryController = async (req, res) => {
    try {
        const {id} = req.params
        await categoryModel.findByIdAndDelete(id)
        res.status(200).send({success:true,message:'Category Delete SuccessFully'})
    } catch (error) {
        console.log(error);
        res
        .status(500)
        .send({ success: false, error, message: "Error While deleting Category" }); 
    }
}
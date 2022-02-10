const Agencies = require('../models/AgencySchema')
const Products = require('../models/ProductSchema')
const Subscriptions = require('../models/SubscriptionSchema')
const mongoose = require("mongoose")


// Adding  Product and also pushing it to agency products array
const addNewProduct = async (req, res) => {
    const { code, name , duration , status , agency } = req.body;
    if (!code || !name || !duration || !status) {
        return res.json({
            message: "Please fill All required credentials"
        });
    } else {
        const check = await Products.find({
            code: code
        })
        if (check.length > 0) {
            return res.json({
                message: '*** Product Code Already Taken ***'
            })
        } else {
            // checking agency provided exists
            const agnecyCheck = await Agencies.find({_id: agency })
            if (agnecyCheck.length > 0 ) {
                let codeLength = code.toString().length;
                if (codeLength <= 5){
                    const newProduct = new Products({
                        ...req.body,
                    })
                    try {
                        const addedProduct = await newProduct.save();

                        // pushing newly added product Id into agency products array
                        const updatedAgency = await Agencies.findByIdAndUpdate(agency, { $push : { "products" : addedProduct._id }}, {new: true })

                        res.status(201).json({
                            addedProduct,
                            updatedAgency,
                            message: '*** Product SuccessFully Added ***'
                        })
                    } catch (error) {
                        console.log("Error in addNewProduct and error is : ", error)
                    }
                } else{
                    return res.json({
                        message: '*** Product Code Must be of max. 5 Digits Only ***'
                    })
                }
            }else{
                return res.json({
                    message: '*** This Agency Does Not Exists ***'
                })
            }
        }
    }
}

// uodate Product
const updateProduct = async (req, res) => {
    const {
        id
    } = req.params

    if (!id) {
        return res.status(201).json({
            message: '*** Id is Required for Updation ****'
        })
    } else {
        const isExistProd = await Products.findById(id)
        if (!isExistProd) {
            return res.status(201).json({
                message: '*** Product Id is Incorrect ****'
            })
        } else {
            let updatedAgency, newAgencyId;
            try {
                if(req.body.agency){
                    if (req.body.agency[0]){
                        newAgencyId = req.body.agency[0]._id;
                    }else{
                        newAgencyId = req.body.agency._id;
                    } 
                    if (newAgencyId !== isExistProd.agency){
                        // removing product from prevoise agency
                        await Agencies.find({_id: isExistProd.agency })
                        await Agencies.findByIdAndUpdate(isExistProd.agency, { $pull : { "products" : id }}, {new: true })

                        // now pushing into new agency product array
                        await Agencies.find({_id: newAgencyId })
                        updatedAgency = await Agencies.findByIdAndUpdate(newAgencyId, { $push : { "products" : id }}, {new: true });

                        req.body.agency = newAgencyId;
                    }
                }

                const updatedUser = await Products.findByIdAndUpdate(id, {
                    $set: req.body
                }, {
                    new: true
                })
                res.status(201).json({
                    updatedUser,
                    updatedAgency,
                    message: '*** Product Updated SuccessFully ***'
                })

            } catch (error) {
                console.log("Error in updateProduct and error is : ", error)
                return res.status(201).json({
                    message: '!!! Opps An Error Occured !!!',
                    error
                })
            }
        }
    }
}

// delete my product
const deleteProduct = async (req, res) => {
    const {
        id
    } = req.params;

    try {

        const isExistSubs = await Subscriptions.findOne({prodName : id});
        let count = 0;
        if (isExistSubs.length > 0){
            const cDate = new Date();
             isExistSubs.cashRegister.map((x, i) => {
                 if (x.dateOfCollection >= cDate) {
                     if (count > 0) {
                         count += 1;
                     }
                 }
             })
             if (count > 0){
                 return res.json({
                     message: '*** Sorry! Product can not be Deleted as it is associated in any Subscription and that subscription has some Remaning Balance. ****',
                 });
             }
        }

        if (count === 0 ){
            const deletedProduct = await Products.findByIdAndDelete(id);
            // removing product from  agency's products array
            await Agencies.find({_id: deletedProduct.agency })
            await Agencies.findByIdAndUpdate(deletedProduct.agency, { $pull : { "products" : id }}, {new: true })
            if (!deletedProduct) {
                return res.json({
                    message: '*** Product Not Found ****',
                });
            } else {
                return res.json({
                    deletedProduct,
                    message: '*** Product SuccessFully Deleted ****',
                });
            }
        }
    } catch (error) {
        console.log("Error in deleteProduct and error is : ", error)
    }
}

// get all Products
const getAllProducts = async (req, res) => {
    try {
        const allProducts = await Products.aggregate([
        {
            $lookup:
            {
                from: 'fintechagencies',
                localField: 'agency',
                foreignField: '_id',
                as: 'agency'
            },
        },
        {
            $lookup:
            {
                from: 'fintechoperators',
                localField: 'Operator',
                foreignField: '_id',
                as: 'Operator'
            },
        },

    ])
        if (!allProducts) {
            return res.json({
                message: '*** No Products Found ****',
            });
        } else {
            return res.json({
                allProducts,
                message: '*** Got Result ****',
            });
        }
    } catch (error) {
        console.log("Error in getAllProducts and error is : ", error)
    }
}

// get Single Product
const getSingleProduct = async (req, res) => {
    const {id} = req.params;
    console.log("Id : ", id)
    try {
        const singleProduct = await Products.aggregate([
            {
                $match: {
                    _id: mongoose.Types.ObjectId(id)
                }
            },
            {
                $lookup: {
                    from: 'fintechagencies',
                    localField: 'agency',
                    foreignField: '_id',
                    as: 'agency'
                },
            },
            {
                $lookup:
                {
                    from: 'fintechoperators',
                    localField: 'Operator',
                    foreignField: '_id',
                    as: 'Operator'
                },
            },

        ]);

        if (!singleProduct) {
            return res.json({
                message: '*** No Product Found ****',
            });
        } else {
            return res.json({
                singleProduct,
                message: '*** Got Result ****',
            });
        }
    } catch (error) {
        console.log("Error in getSingleProduct and error is : ", error)
    }
}


// get all Products Count
const getAllProductsCount = async (req, res) => {
    try {
        const count = await Products.find({}).count();
        if (!count) {
            return res.json({
                message: '*** No Products Found ****',
            });
        } else {
            return res.json({
                count,
                message: '*** Got Result ****',
            });
        }
    } catch (error) {
        console.log("Error in getAllProductsCount and error is : ", error)
    }
}


module.exports = {
    addNewProduct,
    updateProduct,
    deleteProduct,
    getAllProducts,
    getSingleProduct,
    getAllProductsCount
}
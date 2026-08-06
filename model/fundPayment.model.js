const mongoose = require("mongoose");

const fundPaymentSchema = new mongoose.Schema(
{
    fund:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Fund",
        required:true
    },

    member:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },

    chapter:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Chapter",
        required:true
    },

    status:{
        type:String,
        enum:["Paid","Unpaid"],
        default:"Unpaid"
    },

    paidAt:{
        type:Date,
        default:null
    },

    updatedBy:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        default:null
    }

},
{
    timestamps:true
});

fundPaymentSchema.index(
{
    fund:1,
    member:1
},
{
    unique:true
});

module.exports = mongoose.model("FundPayment", fundPaymentSchema);
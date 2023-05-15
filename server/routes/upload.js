const router = require('express').Router();
const {Doc} = require("../models/doc");

router.post("/",async(req,res) => {
try{
    const doc = await Doc.findOne({filename:req.body.filename});
    if(doc!==null){
    if(doc.filename == req.body.filename && doc.creatorid == req.body.creatorid){
        console.log("no");
        res.status(200).send({status:200,message: "You already have a pdf by this name, kindly choose a different name"});
    }
    }
    else{
    await new Doc({...req.body}).save();
    res.status(201).send({status:201, message: "Uploaded successfully" });
    }
}
catch(e){
    res.status(500).send({message:"Internal server error"});
}
})

module.exports = router;
const router = require('express').Router();
const {Doc} = require("../models/doc");

router.post("/",async(req,res) => {
try{
    await new Doc({...req.body}).save();
    res.status(201).send({ message: "Uploaded successfully" });
}
catch(e){
    res.status(500).send({message:"Internal server error"});
}
})

module.exports = router;
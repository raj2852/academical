const router = require('express').Router();
const {Doc} = require("../models/doc");

router.post('/', async(req,res) => {
    try{
    const id = req.header("pdfId");
    await Doc.findByIdAndDelete(id);
    res.status(200).send({message:"pdf deleted"});
    }catch(e){
        res.status(500).send({message:"Internal server error"});
    }
});

module.exports = router;
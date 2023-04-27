const router = require('express').Router();
const { Doc } = require("../models/doc");

router.get("/",async(req,res) => {
    try{
        const alldocs = await Doc.find();
        res.status(200).send({alldocs});
    }catch(e){
        res.status(500).send({message: "Internal server error"});
    }
});

module.exports = router;


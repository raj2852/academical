const router = require("express").Router();
const {Doc} = require("../models/doc");

router.post("/", async(req,res) => {
    try{
        const id = req.header("pdfid");
        const docu = await Doc.findOne({_id:id});
        if(docu!==null){
            const content = docu.content;
            res.status(200).send({message:"Pdf found",data:content});
        }
        else{
            res.status(404).send({message:"Pdf not found"});
        }
    }
    catch(e){
        console.log(e);
        res.status(500).send({message:"Internal server error"});
    }
})

module.exports = router;
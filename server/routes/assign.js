const router = require("express").Router();
const {Doc} = require("../models/doc");
const {User} = require("../models/user");

router.post("/", async(req,res) => {
    try{
        const id = req.header("pdfId");
        const aud = JSON.parse(req.header("aud"));
        //console.log(req.header("aud"));
        await Doc.findByIdAndUpdate(id,{assignedto:aud});
        
        const docname = await Doc.findOne({_id:id});
        //console.log(docname.filename);
        await aud.forEach(async(element) => {
           const userid = element.id;
           //console.log(userid)
           const user = await User.findOne({_id:userid});
           if(user!==null){
           //console.log(user); 
           const body = {filename:docname.filename,category: docname.category,creator: docname.creator, fileid: docname._id};
           //console.log(user.pdfs);
           const pdf = user.pdfs.concat(body);
           //console.log(typeof(body));
           await User.findByIdAndUpdate(userid,{pdfs:pdf});
           }
        });
        res.status(200).send({message: "assignedto section is updated"});
    }catch(e){
        console.log(e);
        res.status(500).send({message:"Internal server error"});
    }
});

module.exports = router;
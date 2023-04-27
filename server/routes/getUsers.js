const router = require('express').Router();
const { User } = require("../models/user");

router.get("/",async(req,res)=> {
    try{
        const allusers = await User.find();
        //console.log(allusers);
        res.status(200).send({allusers});
    }
    catch(e){
        res.status(500).send({message:"internal server error"});
    }
})

module.exports = router;
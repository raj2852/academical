const router = require('express').Router();
const {User} = require("../models/user");

router.post("/",async(req,res)=> {
    try{
        let id = req.header("UserId");
        console.log(id);
        const deluser = await User.findByIdAndDelete(id);
        console.log(deluser);
        res.status(200).send({message:"user deleted from database"});
    }catch(e){
        res.status(500).send({message: "internal server error"});
    }
})

module.exports = router;
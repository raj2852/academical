const router = require('express').Router();
const { User } = require("../models/user");
const jwt = require("jsonwebtoken");

router.post("/",async(req,res)=> {
    try{
        let token = req.header("Authorization");
        
        if(!token){
            return res.status(403).send({message:"Access denied"})
        }
        if(token.startsWith("Bearer ")){
            token = token.slice(7,token.length).trimLeft();
        }
        //console.log(token);
        const verifyUser = jwt.verify(token, process.env.JWTPRIVATEKEY);
          const user = await User.findOne({_id:verifyUser._id});
          //console.log(user);
          res.status(200).send({role:user.role,name:user.firstName,id:user._id});
    }
    catch(e){
        res.status(500).send({message: "Internal server error"});
    }
})

module.exports = router;

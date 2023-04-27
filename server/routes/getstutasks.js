const router = require('express').Router();
const {User} = require("../models/user");

router.get("/", async(req,res) => {
try{
    const id = req.header("userid");
    const user = await User.findOne({_id:id});
    const tasks = user.pdfs;
    res.status(200).send({tasks});
}catch(e){
    res.status(500).send({message:"Internal server error"});
}
})
module.exports = router;
const router = require("express").Router();
const { User } = require("../models/user");
const bcrypt = require("bcrypt");

router.post("/", async (req, res) => {
	try {
		if(req.body.password.length<8){
			return res
			.status(409)
			.send({message: "Password must be atleast 8 characters long"});
		}

		const user = await User.findOne({ email: req.body.email });
		if (user){
			return res
				.status(409)
				.send({ message: "User with given email already Exist!" });
		}
		else{
		const salt = await bcrypt.genSalt(Number(process.env.SALT));
		const hashPassword = await bcrypt.hash(req.body.password, salt);

		const user = await new User({ ...req.body, password: hashPassword }).save();
		const token = user.generateAuthToken();
		res.cookie('token', token, {
            expires: null,
            secure: false,
            httpOnly: true
        });
		res.status(201).send({data:token, message: "User created successfully" });
		}
	} catch (error) {
		res.status(500).send({ message: "Internal Server Error" });
	}
});

module.exports = router;

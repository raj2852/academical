import { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import styles from "./styles.module.css";

const Signup = () => {
	const [data, setData] = useState({
		firstName: "",
		role: "",
		email: "",
		password: "",
	});
	const [error, setError] = useState("");
	const navigate = useNavigate();

	const handleChange = ({ currentTarget: input }) => {
		setData({ ...data, [input.name]: input.value });
		[input.id].style.borderColor = "rgb(0,139,139)"
	};	

	const handleSubmit = async (e) => {
		e.preventDefault();
		try {
			const url = "http://localhost:8080/api/users";
			const { data: res } = await axios.post(url, data);
			localStorage.setItem("token", res.data);
			window.location = "/";
		} catch (error) {
			if (
				error.response &&
				error.response.status >= 400 &&
				error.response.status <= 500
			) {
				setError(error.response.data.message);
			}
		}
	};

	return (
		<>
		<div className={styles.header}>
        		<text className={styles.logo}>Academical</text>
							
			</div>
		<div className={styles.signup_container}>
			<div className={styles.signup_form_container}>
				<div className={styles.left}>
					<h1>Already have an account? Sign in</h1>
					<Link to="/login">
						<button type="button" class="btn btn-secondary" style={{backgroundColor:"#fff",color:"green"}}>
							Sign in
						</button>
					</Link>
				</div>
				<div className={styles.right}>
					<form className={styles.form_container} onSubmit={handleSubmit}>
						<h1>Signup as a Teacher/ Student/ Admin</h1>
						<input
							type="text"
							placeholder="Name"
							name="firstName"
							onChange={handleChange}
							value={data.firstName}
							required
							className={styles.input}
						/>
						<label style={{alignSelf:"start",marginLeft:"17%", color:"#5c5c5c"}}>Select Role : 
						<br/>
						<div style={{display:"inline",alignItems:"center",alignSelf:"center"}}>
						<input
						type="radio"
						name="role"
						onChange={handleChange}
						value={"Student"}
						required
						/>
						Student
						<br/>
						<input
						type="radio"
						name="role"
						onChange={handleChange}
						value={"Teacher"}
						required/>
						Teacher
						<br/>
						<input
						type="radio"
						name="role"
						onChange={handleChange}
						value={"Admin"}
						required/>
						Admin
						</div>
						</label>
						
						<input
							type="email"
							placeholder="Email"
							name="email"
							onChange={handleChange}
							value={data.email}
							required
							className={styles.input}
						/>
						<input
							type="password"
							placeholder="Password atleast 8 characters long"
							name="password"
							onChange={handleChange}
							value={data.password}
							required
							className={styles.input}
						/>
						{error && <div className={styles.error_msg}>{error}</div>}
						<button type="submit" class="btn btn-primary">
							Sign Up
						</button>
					</form>
				</div>
			</div>
		</div>
		</>
	);
};

export default Signup;

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
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		try {
			const url = "http://localhost:8080/api/users";
			const { data: res } = await axios.post(url, data);
			navigate("/login");
			console.log(res.message);
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
        		<text className={styles.logo}>Ebook System</text>
      		</div>
		<div className={styles.signup_container}>
			<div className={styles.signup_form_container}>
				<div className={styles.left}>
					<h1>Already have an account? Sign in</h1>
					<Link to="/login">
						<button type="button" className={styles.white_btn}>
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
						{/* <input
							type="text"
							placeholder="Role"
							name="role"
							onChange={handleChange}
							value={data.role}
							required
							className={styles.input}
						/> */}
						<label style={{alignSelf:"start",marginLeft:"20%"}}>Role</label>
						<label>
						<input
						type="radio"
						name="role"
						onChange={handleChange}
						value={"Student"}
						required
						/>
						Student</label>
						<label>
						<input
						type="radio"
						name="role"
						onChange={handleChange}
						value={"Teacher"}
						required/>
						Teacher</label>
						<label>
						<input
						type="radio"
						name="role"
						onChange={handleChange}
						value={"Admin"}
						required/>
						Admin</label>
						
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
							placeholder="Password"
							name="password"
							onChange={handleChange}
							value={data.password}
							required
							className={styles.input}
						/>
						{error && <div className={styles.error_msg}>{error}</div>}
						<button type="submit" className={styles.green_btn}>
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

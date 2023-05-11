import { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import styles from "./styles.module.css";
import bglogo from "../../images/bglogo.png";

const Login = () => {
	const [data, setData] = useState({ email: "", password: "" });
	const [error, setError] = useState("");

	const handleChange = ({ currentTarget: input }) => {
		setData({ ...data, [input.name]: input.value });
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		try {
			const url = "http://localhost:8080/api/auth";
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
				<a href="#form"><button type="button" class="btn btn-outline-primary">Get started</button></a>
				
			</div>
			<div style={{backgroundColor: "#f5f5f5", display:"flex",flexDirection:"row",textAlign:"justify", padding:15, color:"rgb(71, 20, 167)",justifyContent:"space-around",paddingTop:40}}>
			<text style={{fontWeight:600,fontSize:26,width:"45%"}}>Online, fully-managable and maintainable academics management system to always keep a bird's eye view into the education and task management system of your organization. Academical's suite provides you a complete platform to manage teachers, students and admins with proper demarcation of authorization and responsibility.</text>
			<img src={bglogo} style={{margin:10,height:"40%",width:"30%"}}/>
			</div>
			
			
		<div className={styles.login_container} id="form">
		
			
			<div className={styles.login_form_container}>
				<div className={styles.left}>
					<form className={styles.form_container} onSubmit={handleSubmit}>
						<h1>Login to Your Account</h1>
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
						<button type="submit" class="btn btn-primary">
							Sign In
						</button>
					</form>
				</div>
				<div className={styles.right}>
					<h1>Don't have an account yet? Sign up</h1>
					<Link to="/signup">
						<button type="button" class="btn btn-secondary" style={{backgroundColor:"#fff",color:"green"}}>
							Sign Up
						</button>
					</Link>
				</div>
			</div>
		</div>
		</>
	);
};

export default Login;

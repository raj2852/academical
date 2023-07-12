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
      window.location = "/dashboard";
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
        <a href="#form">
          <button type="button" class="btn btn-outline-primary">
            Get started
          </button>
        </a>
      </div>
      <div className="container" style={{marginTop:10}}>
        <div className="row">
        <div className="col-lg-6 col-md-12 col-sm-12">
          <text className={styles.introtext}>
            Online, fully-managable and maintainable academics management system
            to always keep a bird's eye view into the education and task
            management system of your organization. Academical's suite provides
            you a complete platform to manage teachers, students and admins with
            proper demarcation of authorization and responsibility.
          </text>
        </div>
        <div className="col-lg-6 col-md-12 col-sm-12">
          <img src={bglogo} className={styles.bglogo}/>
        </div>
        </div>
      </div>

      <div className={styles.login_container} id="form">
        <div className={styles.login_form_container}>
          <div className={styles.left}>
            <form className={styles.form_container} onSubmit={handleSubmit}>
              <h1>Login to Your Account</h1>
              <div>
                <label for="exampleInputEmail1">Email address</label>
                <input
                  type="email"
                  class="form-control"
                  id="exampleInputEmail1"
                  aria-describedby="emailHelp"
                  placeholder="Enter email"
                  name="email"
                  onChange={handleChange}
                  value={data.email}
                  required
                />
              </div>
              <div class="form-group">
                <label for="exampleInputPassword1">Password</label>
                <input
                  type="password"
                  class="form-control"
                  id="exampleInputPassword1"
                  placeholder="Password"
                  name="password"
                  onChange={handleChange}
                  value={data.password}
                  required
                />
              </div>
              {error && <div className={styles.error_msg}>{error}</div>}
              <button
                type="submit"
                class="btn btn-primary"
                style={{ margin: 15 }}
              >
                Sign In
              </button>
            </form>
          </div>
          <div className={styles.right}>
            <h1>Don't have an account yet? Sign up</h1>
            <Link to="/signup">
              <button
                type="button"
                class="btn btn-secondary"
                style={{ backgroundColor: "#fff", color: "green" }}
              >
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

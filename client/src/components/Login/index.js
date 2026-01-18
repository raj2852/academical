import { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import styles from "./styles.module.css";
import bglogo from "../../images/bglogo.png";

const Login = () => {
  const [data, setData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = ({ currentTarget: input }) => {
    setData({ ...data, [input.name]: input.value });
  };

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const url = "https://academical-fh52.onrender.com/api/auth";
      const { data: res } = await axios.post(url, data);
      localStorage.setItem("token", res.data);
      navigate("/dashboard");
    } catch (error) {
      if (
        error.response &&
        error.response.status >= 400 &&
        error.response.status <= 500
      ) {
        setError(error.response.data.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.wrapper}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.logo}>Academical</div>
        <a href="#form" className={styles.getStartedBtn}>
          Get started
        </a>
      </header>

      {/* Hero Section */}
      <section className={styles.heroSection}>
        <div className={styles.heroContent}>
          <div className={styles.heroText}>
            <h2>Welcome to Academical</h2>
            <p>
              Academical is a purpose-built platform designed to support the everyday needs of educators and learners. It streamlines classroom management by helping teachers assign tasks, monitor progress, and stay organized, while giving students a clear view of their responsibilities and achievements.
            </p>
            <p style={{ fontSize: "14px", color: "#666" }}>
              With a secure, easy-to-use interface, Academical fosters collaboration, accountability, and academic growth — making it a reliable companion for schools, coaching centers, and learning communities.
            </p>
          </div>
          <div className={styles.heroImage}>
            <img src={bglogo} alt="Academical" />
          </div>
        </div>
      </section>

      {/* Login Section */}
      <section className={styles.loginSection} id="form">
        <div className={styles.loginContainer}>
          {/* Left Side - Form */}
          <div className={styles.loginLeft}>
            <div className={styles.formWrapper}>
              <h1 className={styles.formTitle}>Login to Your Account</h1>
              
              {error && (
                <div className={styles.errorAlert}>
                  <span className={styles.errorIcon}>⚠</span>
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className={styles.form}>
                <div className={styles.formGroup}>
                  <label htmlFor="email" className={styles.label}>
                    Email Address
                  </label>
                  <div className={styles.inputWrapper}>
                    <span className={styles.inputIcon}>✉</span>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      placeholder="Enter your email"
                      onChange={handleChange}
                      value={data.email}
                      className={styles.input}
                      required
                    />
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="password" className={styles.label}>
                    Password
                  </label>
                  <div className={styles.inputWrapper}>
                    <span className={styles.inputIcon}>🔒</span>
                    <input
                      type="password"
                      id="password"
                      name="password"
                      placeholder="Enter your password"
                      onChange={handleChange}
                      value={data.password}
                      className={styles.input}
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className={styles.submitBtn}
                  disabled={loading}
                >
                  {loading ? "Signing In..." : "Sign In"}
                </button>
              </form>
            </div>
          </div>

          {/* Right Side - Sign Up */}
          <div className={styles.loginRight}>
            <div className={styles.signupCard}>
              <h2>New Here?</h2>
              <p>Join thousands of educators and students already using Academical to achieve academic excellence.</p>
              <Link to="/signup" className={styles.signupBtn}>
                Create Account
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Login;

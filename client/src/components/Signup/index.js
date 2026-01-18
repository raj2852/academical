import { Component } from "react";
import axios from "axios";
import { Link, Navigate } from "react-router-dom";
import styles from "./styles.module.css";

class Signup extends Component {
  constructor(props) {
    super(props);
    this.state = {
      firstName: "",
      role: "Student",
      email: "",
      password: "",
      confirmpassword: "",
      error: "",
      redirect: false,
      loading: false
    };
  }

  handleChange = ({ currentTarget: input }) => {
    this.setState({ [input.name]: input.value });
  };

  handleSubmit = async (e) => {
    e.preventDefault();
    this.setState({ loading: true });
    
    if (this.state.password === this.state.confirmpassword) {
      try {
        const { firstName, role, email, password } = this.state;
        const url = "https://academical-fh52.onrender.com/api/users";
        const data = {
          firstName,
          role,
          email,
          password,
        };
        const { data: res } = await axios.post(url, data);
        localStorage.setItem("token", res.data);
        this.setState({ redirect: true });
      } catch (error) {
        if (
          error.response &&
          error.response.status >= 400 &&
          error.response.status <= 500
        ) {
          this.setState({ error: error.response.data.message });
        }
      }
    } else {
      this.setState({ error: "Passwords don't match" });
    }
    
    this.setState({ loading: false });
  };

  render() {
    const { firstName, role, password, email, confirmpassword, error, redirect, loading } = this.state;

    if (redirect) {
      return <Navigate to="/dashboard" replace />;
    }

    return (
      <div className={styles.wrapper}>
        {/* Header */}
        <header className={styles.header}>
          <div className={styles.logo}>Academical</div>
          <Link to="/login" className={styles.loginLink}>
            Back to Login
          </Link>
        </header>

        {/* Signup Section */}
        <section className={styles.signupSection}>
          <div className={styles.signupContainer}>
            {/* Left - Login Reminder */}
            <div className={styles.signupLeft}>
              <div className={styles.loginCard}>
                <h2>Already have an account?</h2>
                <p>Sign in to access your dashboard and manage your tasks.</p>
                <Link to="/login" className={styles.signinBtn}>
                  Sign In
                </Link>
              </div>
            </div>

            {/* Right - Form */}
            <div className={styles.signupRight}>
              <div className={styles.formWrapper}>
                <h1 className={styles.formTitle}>Create Your Account</h1>
                <p className={styles.formSubtitle}>Join Academical and start your academic journey</p>

                {error && (
                  <div className={styles.errorAlert}>
                    <span className={styles.errorIcon}>⚠</span>
                    {error}
                  </div>
                )}

                <form onSubmit={this.handleSubmit} className={styles.form}>
                  {/* Name */}
                  <div className={styles.formGroup}>
                    <label htmlFor="firstName" className={styles.label}>
                      Full Name
                    </label>
                    <div className={styles.inputWrapper}>
                      <span className={styles.inputIcon}>👤</span>
                      <input
                        type="text"
                        id="firstName"
                        className={styles.input}
                        placeholder="Enter your full name"
                        name="firstName"
                        onChange={this.handleChange}
                        value={firstName}
                        required
                      />
                    </div>
                  </div>

                  {/* Role */}
                  <div className={styles.formGroup}>
                    <label htmlFor="role" className={styles.label}>
                      Select Your Role
                    </label>
                    <div className={styles.selectWrapper}>
                      <select
                        id="role"
                        name="role"
                        className={styles.select}
                        onChange={this.handleChange}
                        value={role}
                        required
                      >
                        <option value="Student">Student</option>
                        <option value="Teacher">Teacher</option>
                        <option value="Admin">Admin</option>
                      </select>
                      <span className={styles.selectIcon}>▼</span>
                    </div>
                  </div>

                  {/* Email */}
                  <div className={styles.formGroup}>
                    <label htmlFor="email" className={styles.label}>
                      Email Address
                    </label>
                    <div className={styles.inputWrapper}>
                      <span className={styles.inputIcon}>✉</span>
                      <input
                        type="email"
                        id="email"
                        className={styles.input}
                        placeholder="Enter your email"
                        name="email"
                        onChange={this.handleChange}
                        value={email}
                        required
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div className={styles.formGroup}>
                    <label htmlFor="password" className={styles.label}>
                      Password
                    </label>
                    <div className={styles.inputWrapper}>
                      <span className={styles.inputIcon}>🔒</span>
                      <input
                        type="password"
                        id="password"
                        className={styles.input}
                        placeholder="Enter a strong password"
                        name="password"
                        onChange={this.handleChange}
                        value={password}
                        required
                      />
                    </div>
                  </div>

                  {/* Confirm Password */}
                  <div className={styles.formGroup}>
                    <label htmlFor="confirmpassword" className={styles.label}>
                      Confirm Password
                    </label>
                    <div className={styles.inputWrapper}>
                      <span className={styles.inputIcon}>🔒</span>
                      <input
                        type="password"
                        id="confirmpassword"
                        className={styles.input}
                        placeholder="Confirm your password"
                        name="confirmpassword"
                        onChange={this.handleChange}
                        value={confirmpassword}
                        required
                      />
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    className={styles.submitBtn}
                    disabled={loading}
                  >
                    {loading ? "Creating Account..." : "Sign Up"}
                  </button>
                </form>

                {/* Terms */}
                <p className={styles.termsText}>
                  By signing up, you agree to our Terms of Service and Privacy Policy.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    );
  }
}

export default Signup;

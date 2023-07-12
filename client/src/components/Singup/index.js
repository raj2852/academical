import { Component } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
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
      error: ""
    };
  }

  handleChange = ({ currentTarget: input }) => {
    this.setState({ [input.name]: input.value });
    
  };

  handleSubmit = async (e) => {
    e.preventDefault();
    if (this.state.password === this.state.confirmpassword) {
      try {
        const { firstName, role, email, password } = this.state;
        const url = "http://localhost:8080/api/users";
        const data = {
          firstName,
          role,
          email,
          password,
        };
        const { data: res } = await axios.post(url, data);
        localStorage.setItem("token", res.data);
        window.location = "/dashboard";
      } catch (error) {
        if (
          error.response &&
          error.response.status >= 400 &&
          error.response.status <= 500
        ) {
          this.setState({error: error.response.data.message});
        }
      }
    } else {
      this.setState({error: "Passwords don't match"});
    }
  };
  render() {
    const { firstName, role, password, email, confirmpassword, error } = this.state;
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
                <button
                  type="button"
                  class="btn btn-secondary"
                  style={{ backgroundColor: "#fff", color: "green" }}
                >
                  Sign in
                </button>
              </Link>
            </div>
            <div className={styles.right}>
              <form
                className={styles.form_container}
                onSubmit={this.handleSubmit}
              >
                <h1>Signup as a Teacher/ Student/ Admin</h1>
                <div>
                  <label for="exampleInputEmail1">Name</label>
                  <input
                    type="text"
                    class="form-control"
                    placeholder="Enter name"
                    name="firstName"
                    onChange={this.handleChange}
                    value={firstName}
                    required
                  />
                </div>
                <label for="exampleInputEmail1">Select a role</label>
                <select
                  name="role"
                  class="form-select"
                  aria-label="Default select example"
                  onChange={this.handleChange}
                  value={role}
                  required
                >
                  <option value={"Student"}>Student</option>
                  <option value={"Teacher"}>Teacher</option>
                  <option value={"Admin"}>Admin</option>
                </select>
                <div>
                  <label for="exampleInputEmail1">Email</label>
                  <input
                    type="email"
                    class="form-control"
                    placeholder="Enter email"
                    name="email"
                    onChange={this.handleChange}
                    value={email}
                    required
                  />
                </div>
                <div>
                  <label for="exampleInputEmail1">Password</label>
                  <input
                    type="password"
                    class="form-control"
                    placeholder="Enter password"
                    name="password"
                    onChange={this.handleChange}
                    value={password}
                    required
                  />
                </div>
                <div>
                  <label for="exampleInputEmail1">Confirm Password</label>
                  <input
                    type="password"
                    class="form-control"
                    placeholder="Enter password again"
                    name="confirmpassword"
                    onChange={this.handleChange}
                    value={confirmpassword}
                    required
                  />
                </div>

                {error && <div className={styles.error_msg}>{error}</div>}
                <button
                  type="submit"
                  class="btn btn-primary"
                  style={{ marginTop:10,marginLeft: 15, marginRight: 15 }}
                >
                  Sign Up
                </button>
              </form>
              
            </div>
          </div>
        </div>
      </>
    );
  }
}

export default Signup;

import React, { Component } from "react";
import styles from "./styles.module.css";
import { PDFViewer } from "@react-pdf/renderer";
import { PDFDownloadLink } from "@react-pdf/renderer";
import Pdf from "./pdf";
import { Navigate } from "react-router-dom";

class AdminDashboard extends Component {
  constructor(props) {
    super(props);
    this.state = {
      pdfexists: true,
      content: [{ chaptername: "", chaptertext: "" }],
      currentlyassigned: [{}], //stores studentname and id of the students to whom a pdf is assigned as object
      assigninfo: false,
      assigninfomessage: "",
      refresh: false
    };
  }

  //admin functionality to remove any type of user
  deleteUser = async (id) => {
    var result = window.confirm("This will remove from database");
    if (result) {
      await fetch("https://academical-fh52.onrender.com/api/deleteUser", {
        method: "POST",
        headers: { UserId: `${id}` },
      });
      this.setState({ refresh: true });
    }
  };

  //function to read pdf
  renderpdf = async (id) => {
    try {
      const renderthis = await fetch("https://academical-fh52.onrender.com/api/renderpdf", {
        method: "POST",
        headers: { pdfid: id },
      });
      const data = await renderthis.json();
      console.log(data.data);
      if (data.message == "Pdf not found") {
        this.setState({ pdfexists: false });
      } else {
        this.setState({ pdfexists: true });
        this.setState({ content: data.data, read: true });
      }
    } catch (e) {
      console.log(e);
    }
  };

  //function to assign pdfs
  createassign = async (id) => {
    const { currentlyassigned } = this.state;
    const docid = id;
    const res = await fetch("https://academical-fh52.onrender.com/api/assign", {
      method: "POST",
      headers: {
        pdfId: docid,
        aud: JSON.stringify(currentlyassigned),
      },
    });
    if (res.status == 200) {
      this.setState({
        assigninfo: true,
        assignbg: "green",
        assigninfomessage: "Successfully assigned",
      });
      setTimeout(() => {
        this.setState({ refresh: true });
      }, 3000);
    } else {
      this.setState({
        assigninfo: true,
        assignbg: "red",
        assigninfomessage: "Could not be assigned",
      });
      setTimeout(() => {
        this.setState({ refresh: true });
      }, 1500);
    }
  };

  //function to delete any pdf
  deletepdf = async (id) => {
    var result = window.confirm("This will remove from database");
    if (result) {
      await fetch("https://academical-fh52.onrender.com/api/deletepdf", {
        method: "POST",
        headers: { pdfId: `${id}` },
      });
      this.setState({ refresh: true });
    }
  };

  render() {
    const { assigninfo, assigninfomessage, currentlyassigned, content, refresh } = this.state;
    const { userRecords, allpdfs, students } = this.props;
    if (refresh) { window.location.href = "/dashboard"; }
    return (
      <div className={styles.body}>
        <p className={styles.teacheader}>List of all users</p>
        {userRecords.length > 0 ? (
          <>
            <table class="table table-bordered">
              <thead>
                <tr>
                  <th scope="col" style={{ color: "#5c5c5c" }}>
                    Name
                  </th>
                  <th scope="col" style={{ color: "#5c5c5c" }}>
                    Role
                  </th>
                  <th scope="col" style={{ color: "#5c5c5c" }}>
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {userRecords.map((userRecord) => (
                  <tr>
                    <td style={{ color: "#5c5c5c" }}>{userRecord.firstName}</td>
                    <td style={{ color: "#5c5c5c" }}>{userRecord.role}</td>
                    <td>
                      <button
                        type="button"
                        class="btn btn-danger"
                        style={{
                          color: "#fff",
                        }}
                        onClick={() => this.deleteUser(userRecord._id)}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          fill="currentColor"
                          class="bi bi-trash3-fill"
                          viewBox="0 0 16 16"
                        >
                          <path d="M11 1.5v1h3.5a.5.5 0 0 1 0 1h-.538l-.853 10.66A2 2 0 0 1 11.115 16h-6.23a2 2 0 0 1-1.994-1.84L2.038 3.5H1.5a.5.5 0 0 1 0-1H5v-1A1.5 1.5 0 0 1 6.5 0h3A1.5 1.5 0 0 1 11 1.5Zm-5 0v1h4v-1a.5.5 0 0 0-.5-.5h-3a.5.5 0 0 0-.5.5ZM4.5 5.029l.5 8.5a.5.5 0 1 0 .998-.06l-.5-8.5a.5.5 0 1 0-.998.06Zm6.53-.528a.5.5 0 0 0-.528.47l-.5 8.5a.5.5 0 0 0 .998.058l.5-8.5a.5.5 0 0 0-.47-.528ZM8 4.5a.5.5 0 0 0-.5.5v8.5a.5.5 0 0 0 1 0V5a.5.5 0 0 0-.5-.5Z" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        ) : (
          <p>No records found</p>
        )}
        <hr />
        <p className={styles.teacheader}>All uploaded pdfs: </p>
        {allpdfs.length > 0 ? (
          <>
            <table class="table table-bordered">
              <thead>
                <tr>
                  <th scope="col" style={{ color: "#5c5c5c" }}>
                    Pdf Name
                  </th>
                  <th scope="col" style={{ color: "#5c5c5c" }}>
                    Pdf Category
                  </th>
                  <th scope="col" style={{ color: "#5c5c5c" }}>
                    Actions
                  </th>
                  <th scope="col" style={{ color: "#5c5c5c" }}>
                    Created By
                  </th>
                  <th scope="col" style={{ color: "#5c5c5c" }}>
                    Assigned To
                  </th>
                  <th scope="col" style={{ color: "#5c5c5c" }}>
                    Assign
                  </th>
                </tr>
              </thead>
              <tbody>
                {allpdfs.map((allpdf) => (
                  <tr>
                    <td style={{ color: "#5c5c5c" }}>{allpdf.filename} </td>
                    <td style={{ color: "#5c5c5c" }}>{allpdf.category}</td>
                    <td>
                      <span>
                        <button
                          style={{
                            color: "#fff",
                          }}
                          class="btn btn-danger"
                          onClick={() => this.deletepdf(allpdf._id)}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            fill="currentColor"
                            class="bi bi-trash3-fill"
                            viewBox="0 0 16 16"
                          >
                            <path d="M11 1.5v1h3.5a.5.5 0 0 1 0 1h-.538l-.853 10.66A2 2 0 0 1 11.115 16h-6.23a2 2 0 0 1-1.994-1.84L2.038 3.5H1.5a.5.5 0 0 1 0-1H5v-1A1.5 1.5 0 0 1 6.5 0h3A1.5 1.5 0 0 1 11 1.5Zm-5 0v1h4v-1a.5.5 0 0 0-.5-.5h-3a.5.5 0 0 0-.5.5ZM4.5 5.029l.5 8.5a.5.5 0 1 0 .998-.06l-.5-8.5a.5.5 0 1 0-.998.06Zm6.53-.528a.5.5 0 0 0-.528.47l-.5 8.5a.5.5 0 0 0 .998.058l.5-8.5a.5.5 0 0 0-.47-.528ZM8 4.5a.5.5 0 0 0-.5.5v8.5a.5.5 0 0 0 1 0V5a.5.5 0 0 0-.5-.5Z" />
                          </svg>
                        </button>
                        <br />
                        <button
                          type="button"
                          class="btn btn-info"
                          data-bs-toggle="modal"
                          data-bs-target="#exampleModal"
                          style={{ color: "#fff", marginTop: 5 }}
                          onClick={() => {
                            this.renderpdf(allpdf._id);
                          }}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            fill="currentColor"
                            class="bi bi-file-earmark-arrow-down"
                            viewBox="0 0 16 16"
                          >
                            <path d="M8.5 6.5a.5.5 0 0 0-1 0v3.793L6.354 9.146a.5.5 0 1 0-.708.708l2 2a.5.5 0 0 0 .708 0l2-2a.5.5 0 0 0-.708-.708L8.5 10.293V6.5z" />
                            <path d="M14 14V4.5L9.5 0H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2zM9.5 3A1.5 1.5 0 0 0 11 4.5h2V14a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h5.5v2z" />
                          </svg>
                        </button>
                      </span>
                    </td>
                    <td style={{ color: "#5c5c5c" }}>{allpdf.creator}</td>
                    <td style={{ color: "#5c5c5c" }}>
                      {allpdf.assignedto.map((e) => (
                        <p>{e.name}</p>
                      ))}
                    </td>
                    <td style={{ color: "#5c5c5c" }}>
                      <span>
                        <button
                          type="button"
                          class="btn btn-primary"
                          data-bs-toggle="modal"
                          data-bs-target="#selectionModal"
                        >
                          Select students to assign
                        </button>
                        {/*<!-- Modal -->*/}
                        <div
                          class="modal fade"
                          id="selectionModal"
                          tabindex="-1"
                          aria-labelledby="exampleModalLabel"
                          aria-hidden="true"
                        >
                          <div
                            class="modal-dialog modal-xl"
                          >
                            <div class="modal-content">
                              <div class="modal-header">
                              <h5 class="modal-title">Select from the list of available students</h5>
                                <button
                                  type="button"
                                  class="btn-close"
                                  data-bs-dismiss="modal"
                                  aria-label="Close"
                                ></button>
                              </div>
                              <div
                                class="modal-body"
                                style={{ alignItems: "center" }}
                              >
                                <button class="btn btn-primary" onClick={()=>
                                          this.setState({ refresh: true })
                                        }><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-bootstrap-reboot" viewBox="0 0 16 16">
                                        <path d="M1.161 8a6.84 6.84 0 1 0 6.842-6.84.58.58 0 1 1 0-1.16 8 8 0 1 1-6.556 3.412l-.663-.577a.58.58 0 0 1 .227-.997l2.52-.69a.58.58 0 0 1 .728.633l-.332 2.592a.58.58 0 0 1-.956.364l-.643-.56A6.812 6.812 0 0 0 1.16 8z"/>
                                        <path d="M6.641 11.671V8.843h1.57l1.498 2.828h1.314L9.377 8.665c.897-.3 1.427-1.106 1.427-2.1 0-1.37-.943-2.246-2.456-2.246H5.5v7.352h1.141zm0-3.75V5.277h1.57c.881 0 1.416.499 1.416 1.32 0 .84-.504 1.324-1.386 1.324h-1.6z"/>
                                      </svg></button>
                                {students.map((student) => (
                                  <ul class="list-group">
                                    <li class="list-group-item">
                                      <div class="input-group mb-3">
                                        <div class="input-group-prepend">
                                          <div class="input-group-text" style={{marginRight:20}}>
                                            <input
                                              type="checkbox"
                                              aria-label="Checkbox for following text input"
                                              value={student._id}
                                              
                                              onChange={(e) => {
                                                if (e.target.checked) {
                                                  const res = {
                                                    name: student.firstName,
                                                    id: student._id,
                                                  };
                                                  this.setState({
                                                    currentlyassigned: [
                                                      ...currentlyassigned,
                                                      res,
                                                    ],
                                                  });
                                                }
                                              }}
                                            />
                                          </div>
                                        </div>
                                        {student.firstName}
                                      </div>
                                    </li>
                                  </ul>
                                ))}
                                <button
                                  value={allpdf._id}
                                  type="button"
                                  class="btn btn-primary"
                                  data-bs-dismiss="modal"
                                  onClick={(e) => {
                                    this.createassign(e.target.value);
                                  }}
                                >
                                  Assign
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>

                        {assigninfo && (
                          <div
                            class="alert alert-info alert-dismissible fade show"
                            role="alert"
                            style={{
                              margin: 10,
                              width: "50%",
                              alignSelf: "center",
                            }}
                          >
                            <p style={{ textAlign: "center" }}>
                              {assigninfomessage}
                            </p>
                          </div>
                        )}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {/*<!-- Modal -->*/}
            <div
              class="modal fade"
              id="exampleModal"
              tabindex="-1"
              aria-labelledby="exampleModalLabel"
              aria-hidden="true"
            >
              <div class="modal-dialog modal-xl" style={{ height: "90%" }}>
                <div class="modal-content" style={{ height: "100%" }}>
                  <div class="modal-header">
                    <button
                      type="button"
                      class="btn-close"
                      data-bs-dismiss="modal"
                      aria-label="Close"
                    ></button>
                  </div>
                  <div class="modal-body">
                    <PDFViewer
                      style={{
                        width: "100%",
                        alignSelf: "center",
                        height: "100%",
                      }}
                    >
                      <Pdf newcontent={content} />
                    </PDFViewer>
                  </div>
                  <PDFDownloadLink
                    document={<Pdf newcontent={content} />}
                    style={{ alignSelf: "center" }}
                  >
                    {({ loading }) =>
                      loading ? (
                        <button
                          type="button"
                          class="btn btn-success"
                          style={{ margin: 5, color: "#fff" }}
                        >
                          Loading Document...
                        </button>
                      ) : (
                        <button
                          type="button"
                          class="btn btn-success"
                          style={{ margin: 5, color: "#fff" }}
                        >
                          Download as pdf
                        </button>
                      )
                    }
                  </PDFDownloadLink>
                </div>
              </div>
            </div>
          </>
        ) : (
          <p>No records found</p>
        )}
      </div>
    );
  }
}

export default AdminDashboard;

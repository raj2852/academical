import React, { Component } from "react";
import styles from "./styles.module.css";
import axios from "axios";
import { Navigate } from "react-router-dom";

//imports for react-pdf package
import { Document, Page, Text, Image, PDFViewer } from "@react-pdf/renderer";
import { PDFDownloadLink } from "@react-pdf/renderer";
//cover will act as default cover image of the pdf
import cover from "../../images/cover.jpg";
import page from "../../images/page.png";
import StudentDashboard from "./student";
import AdminDashboard from "./admin";

class Main extends Component {
  constructor() {
    super();

    this.state = {
      token: localStorage.getItem("token"),
      userName: "",
      userId: "",
      role: "",
      userRecords: [],
      stutasks: [],
      text: "", //stores main content of each pdf
      indexcontent: "", //stores chapter names as index
      pdfname: "",
      category: "",
      pagecount: 0,
      showeditor: false,
      showpdfs: false,
      content: [{ chaptername: "", chaptertext: "" }], //stores chaptername and chaptercontent as object
      createdpdfs: [], //stores teacher specific pdfs
      allpdfs: [], //stores all pdfs created by all the teachers
      students: [],
      currentlyassigned: [{}], //stores studentname and id of the students to whom a pdf is assigned as object
      showpdfcontent: false,
      showpdfactions: false,
      pdfexists: true,
      assigninfo: false,
      assignbg: "",
      assigninfomessage: "",
      action: false,
      actionbg: "",
      actionmessage: "",
      logout: false,
      refresh: false
    };
  }

  componentDidMount() {
    this.getCreds();

    //fetch all localstorage saved contents
    const draftcontent = localStorage.getItem("draft");
    const index = localStorage.getItem("indexcontent");
    const filename = localStorage.getItem("filename");
    const contcategory = localStorage.getItem("category");
    const pages = JSON.parse(localStorage.getItem("pagecount"));
    const a = JSON.parse(localStorage.getItem("contentsofar"));
    console.log(a);
    //set state if local storage is present else show default state initialization value
    const { text, pdfname, indexcontent, pagecount, content, category } =
      this.state;
    this.setState({ text: draftcontent ? draftcontent : text });
    this.setState({ indexcontent: index ? index : indexcontent });
    this.setState({ pdfname: filename ? filename : pdfname });
    this.setState({ pagecount: pages ? pages : pagecount });
    this.setState({ content: a ? a : content });
    this.setState({ category: contcategory ? contcategory : category });
  }

  //function to get credentials of the current logged user
  getCreds = async () => {
    const { token } = this.state;
    //alert(token);
    const response = await fetch("https://academical-fh52.onrender.com/api/findUser", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await response.json();
    this.setState({ role: data.role, userName: data.name, userId: data.id },()=>{
          this.getRecords();
          this.getTeachertasks();
    });
  };

  //function to get list of all users: students,teachers,admins
  getRecords = async () => {
    const url = "https://academical-fh52.onrender.com/api/getUsers";
    const { data: res } = await axios.get(url);
    let stu = res.allusers.filter(function (ele) {
      return ele.role == "Student";
    });
    this.setState({ userRecords: res.allusers });
    this.setState({ students: stu });
  };

  //function to fetch tasks of all users: students, teachers and admins
  getTeachertasks = async () => {
    const url = "https://academical-fh52.onrender.com/api/findUploads";
    const { data: res } = await axios.get(url);

    const { userId } = this.state;
    console.log(userId);
    //mydocs will return teacher specific pdfs to show in teacher's dashboard
    let mydocs = res.alldocs.filter(function (ele) {
      return ele.creatorid === userId;
    });

    this.setState({ allpdfs: res.alldocs });
    this.setState({ createdpdfs: mydocs });

    //api to fetch list to pdfs assigned to a particular student
    const response = await fetch("https://academical-fh52.onrender.com/api/getstutasks", {
      method: "GET",
      headers: { userid: userId },
    });
    const tasks = await response.json();
    const unique = [];
    const result = tasks.tasks.filter((e) => {
      const isduplicate = unique.includes(e.fileid);
      if (!isduplicate) {
        unique.push(e.fileid);
        return true;
      }
      return false;
    });
    this.setState({ stutasks: result });
  };

  //real time storage of chapter content
  handleContent = ({ currentTarget: input }) => {
    this.setState({ [input.name]: input.value });
    localStorage.setItem("draft", input.value);
  };

  //real time storage of chapter names
  handleIndex = ({ currentTarget: input }) => {
    this.setState({ [input.name]: input.value });
    localStorage.setItem("indexcontent", input.value);
  };

  //real time storage of pdf name
  handleFilename = ({ currentTarget: input }) => {
    this.setState({ [input.name]: input.value });
    localStorage.setItem("filename", input.value);
  };

  //real time storage of content category
  handleCategory = ({ currentTarget: input }) => {
    this.setState({ [input.name]: input.value });
    localStorage.setItem("category", input.value);
  };

  //function to add and move to new page
  addnewpage = async () => {
    const { indexcontent, text, pagecount, content } = this.state;
    if (indexcontent !== "" && text !== "") {
      const contentbody = { chaptername: indexcontent, chaptertext: text };
      this.setState({
        content: [...content, contentbody],
      });
      console.log(content);
      localStorage.setItem("contentsofar", JSON.stringify(content));

      const count = pagecount + 1;
      this.setState({ indexcontent: "", text: "", pagecount: count });

      localStorage.removeItem("indexcontent");
      localStorage.removeItem("draft");
      localStorage.setItem("pagecount", JSON.stringify(count));

      this.addnewpage();
      this.setState({ action: false });
      this.setState({ showpdfactions: true });
    } else {
      this.setState({
        action: true,
        actionbg: "red",
        actionmessage: "Please provide some content",
      });
      setTimeout(() => {
        this.setState({ action: false });
      }, 1500);
    }
  };

  //function to save a pdf as uploaded and start working on a fresh one
  saveandstartfresh = async () => {
    localStorage.removeItem("filename");
    localStorage.removeItem("indexcontent");
    localStorage.removeItem("draft");
    localStorage.removeItem("contentsofar");
    localStorage.removeItem("pagecount");
    localStorage.removeItem("category");
    this.setState({
      text: "",
      pdfname: "",
      indexcontent: "",
      pagecount: 0,
      content: [{ chaptername: "", chaptertext: "" }],
      category: "",
      showeditor: false,
      showpdfs: false
    });
    this.getTeachertasks();
  };

  //function to handle pdf's content upload
  uploadpdf = async () => {
    const { pdfname, category, content, userName, userId } = this.state;
    const date = new Date();
    const body = {
      filename: pdfname,
      creator: userName,
      creatorid: userId,
      dateofupload: date,
      category,
      content,
    };
    const url = "https://academical-fh52.onrender.com/api/upload";
    const res = await axios.post(url, body);
    console.log(res);
    if (res.status == 201) {
      this.setState({ action: false });
      this.saveandstartfresh();
      this.getTeachertasks();
    } else if (res.status == 200) {
      this.setState({
        action: true,
        actionbg: "red",
        actionmessage:
          "You already have a pdf with this title, please enter a different one",
      });
      setTimeout(() => {
        this.setState({ action: false });
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
      this.getTeachertasks();
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
      this.getTeachertasks();
      setTimeout(() => {
        this.setState({ assigninfo: false });
      }, 1500);
    } else {
      this.setState({
        assigninfo: true,
        assignbg: "red",
        assigninfomessage: "Could not be assigned",
      });
      setTimeout(() => {
        this.setState({ assigninfo: false });
      }, 1500);
    }
  };

  //function to log a user out
  handleLogout = () => {
    localStorage.removeItem("token");
    this.setState({ logout: true });
  };

  /////////////////////////creating react-pdf component to convert text input into pdfs
  Rpdf = () => {
    const newcontent = this.state.content;
    return (
      <Document>
        <Page
          style={{
            paddingTop: 35,
            paddingBottom: 65,
            paddingHorizontal: 35,
          }}
        >
          <Image src={cover} style={{ height: "100%", width: "100%" }} />
        </Page>
        <Page style={{ padding: 40, textAlign: "center" }}>
          <Text
            style={{
              margin: 12,
              fontSize: 30,
              textAlign: "justify",
              fontFamily: "Times-Roman",
            }}
          >
            Index
          </Text>
          {newcontent.map((set) => (
            <Text
              style={{
                margin: 12,
                fontSize: 14,
                textAlign: "justify",
                fontFamily: "Times-Roman",
              }}
            >
              {set.chaptername}
            </Text>
          ))}
        </Page>
        {newcontent.map((set) => (
          <Page
            style={{
              padding: 40,
              textAlign: "center",
            }}
          >
            <Text
              style={{
                margin: 12,
                fontSize: 28,
                textAlign: "center",
                fontFamily: "Times-Roman",
                fontWeight: "bold",
              }}
            >
              {set.chaptername}
            </Text>

            <Text
              style={{
                margin: 12,
                fontSize: 14,
                textAlign: "justify",
                fontFamily: "Times-Roman",
              }}
            >
              {set.chaptertext}
            </Text>
            <Text
              style={{
                position: "absolute",
                fontSize: 12,
                bottom: 30,
                left: 0,
                right: 0,
                textAlign: "center",
                color: "grey",
              }}
              render={({ pageNumber, totalPages }) =>
                `${pageNumber} / ${totalPages}`
              }
            />
          </Page>
        ))}
      </Document>
    );
  };

  render() {
    const {
      userName,
      role,
      text,
      pdfname,
      category,
      indexcontent,
      userRecords,
      stutasks,
      showeditor,
      showpdfs,
      students,
      createdpdfs,
      allpdfs,
      currentlyassigned,
      showpdfactions,
      pdfexists,
      assigninfo,
      assigninfomessage,
      assignbg,
      action,
      actionbg,
      actionmessage,
      logout,
      refresh
    } = this.state;

    if (logout) { return <Navigate to="/login" replace />; }
    if(refresh) { return <Navigate to="/dashboard" replace />; }

    return (
      <div className={styles.main_container}>
        <nav className={styles.navbar}>
          <text className={styles.logo}>Academical</text>
          <button
            type="button"
            class="btn btn-outline-primary"
            style={{ position: "absolute", right: 10 }}
            onClick={this.handleLogout}
          >
            Logout
          </button>
        </nav>
        <p className={styles.welcome}>Welcome to your dashboard, {userName}</p>

        {/* //////////////////////////////////////////////  Teacher  ///////////////////////////////////////////////////////// */}

        {role === "Teacher" && (
          <div className={styles.body}>
            <p className={styles.teacwelcome}> Let's get started</p>
            <div className={styles.btnpack}>
              <button
                className={styles.teacbtn}
                onClick={() =>
                  this.setState({ showeditor: true, showpdfs: false })
                }
              >
                Create a new pdf
              </button>
              <button
                className={styles.teacbtn}
                onClick={() =>
                  this.setState({
                    showeditor: false,
                    showpdfs: true,
                  })
                }
              >
                See your created pdfs
              </button>
            </div>

            {showeditor && (
              <>
                <form>
                  <div class="form-group">
                    <label
                      for="exampleInputEmail1"
                      className={styles.formlabel}
                    >
                      Enter name of pdf file :{" "}
                    </label>
                    <input
                      class="form-control"
                      id="exampleInputEmail1"
                      aria-describedby="emailHelp"
                      type="text/number"
                      value={pdfname}
                      name="pdfname"
                      placeholder="file name"
                      required={true}
                      onChange={this.handleFilename}
                    />
                  </div>
                  <div class="form-group">
                    <label
                      for="exampleInputPassword1"
                      className={styles.formlabel}
                    >
                      Enter pdf category :
                    </label>
                    <input
                      class="form-control"
                      id="exampleInputEmail1"
                      aria-describedby="emailHelp"
                      type="text/number"
                      name="category"
                      value={category}
                      placeholder="category"
                      required={true}
                      onChange={this.handleCategory}
                    />
                  </div>
                  <div class="form-group">
                    <label
                      for="exampleInputPassword1"
                      className={styles.formlabel}
                    >
                      Enter chapter name:{" "}
                    </label>
                    <input
                      class="form-control"
                      id="exampleInputEmail1"
                      aria-describedby="emailHelp"
                      type="text/number"
                      name="indexcontent"
                      value={indexcontent}
                      placeholder="chapter name"
                      required={true}
                      onChange={this.handleIndex}
                    />
                  </div>

                  <label
                    for="exampleInputPassword1"
                    className={styles.formlabel}
                  >
                    Enter chapter content:{" "}
                  </label>
                  <div className={styles.textarea}>
                    <textarea
                      class="form-control"
                      id="exampleFormControlTextarea1"
                      type="text/number"
                      wrap="true"
                      rows={20}
                      cols={150}
                      value={text}
                      name="text"
                      placeholder={"chapter note"}
                      onChange={this.handleContent}
                      required={true}
                    />

                    <button
                      onClick={this.addnewpage}
                      className={styles.addpage}
                    >
                      <p style={{ fontSize: 40, margin: 5, color: "#fff" }}>
                        +
                        <span>
                          <img
                            src={page}
                            style={{ height: 30, width: 30, margin: 2 }}
                            alt="Add this chapter and move to next page"
                          />
                        </span>
                      </p>
                      Add this chapter and start new
                    </button>
                  </div>
                </form>

                {action && (
                  <div
                    class="alert alert-warning alert-dismissible fade show"
                    role="alert"
                  >
                    {actionmessage}
                  </div>
                )}
                <br></br>

                {showpdfactions && (
                  <>
                    <p style={{ color: "#5c5c5c" }}>
                      *Click save as draft if you plan to be inactive for longer
                      durations
                    </p>
                    <PDFDownloadLink
                      document={<this.Rpdf />}
                      fileName={`${pdfname} - ${userName}`}
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
                            onClick={() => {
                              this.uploadpdf();
                            }}
                          >
                            Download as pdf
                          </button>
                        )
                      }
                    </PDFDownloadLink>
                    <button
                      type="button"
                      class="btn btn-primary"
                      style={{ margin: 5, color: "#fff" }}
                      onClick={this.uploadpdf}
                    >
                      Save as draft and start with a new pdf
                    </button>
                  </>
                )}
                <br></br>
                <hr />
                <p
                  style={{ fontWeight: "bold", fontSize: 20, color: "#5c5c5c" }}
                >
                  Your content so far:{" "}
                </p>
                <button
                  type="button"
                  class="btn btn-warning"
                  style={{ color: "#fff" }}
                  onClick={() => {
                    this.setState({
                      content: [{ chaptername: "", chaptertext: "" }],
                    });
                  }}
                >
                  Clear content
                </button>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    overflowX: "auto",
                    overflowY: "hidden",
                  }}
                >
                  {this.state.content.map(
                    (c) =>
                      c.chaptername !== "" && (
                        <div
                          style={{
                            height: 400,
                            width: 245,
                            backgroundColor: "#FBFCFC",
                            margin: 10,
                            overflowX: "hidden",
                            overflowY: "auto",
                            padding: 10,
                          }}
                        >
                          <p style={{ fontWeight: 600, textAlign: "center" }}>
                            {c.chaptername}
                          </p>
                          <p style={{ fontWeight: 400 }}>{c.chaptertext}</p>
                        </div>
                      )
                  )}
                </div>
                <hr />

                <p className={styles.teacheader}>Your previous works: </p>
                {createdpdfs.length > 0 ? (
                  <>
                    <table class="table table-bordered">
                      <thead>
                        <tr>
                          <th scope="col" style={{ color: "#5c5c5c" }}>
                            Pdf Name
                          </th>
                          <th scope="col" style={{ color: "#5c5c5c" }}>
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {createdpdfs.map((createdpdf) => (
                          <>
                            <tr>
                              <td>{createdpdf.filename}</td>
                              <td>
                                <span>
                                  <button
                                    type="button"
                                    class="btn btn-primary"
                                    style={{ margin: 5 }}
                                    data-bs-toggle="modal"
                                    data-bs-target="#exampleModal"
                                    onClick={() => {
                                      this.setState({
                                        content: createdpdf.content,
                                      });
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

                                  <button
                                    type="button"
                                    class="btn btn-danger"
                                    style={{ margin: 5 }}
                                    onClick={() =>
                                      this.deletepdf(createdpdf._id)
                                    }
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
                                  <button
                                    type="button"
                                    class="btn btn-secondary"
                                    style={{ margin: 5 }}
                                    onClick={() => {
                                      this.setState({
                                        content: createdpdf.content,
                                        pdfname: createdpdf.filename,
                                        showpdfactions: false,
                                      });
                                      this.setState({
                                        action: true,
                                        actionbg: "red",
                                        actionmessage:
                                          "Please note: you need to save with a new name if document is edited/updated",
                                      });
                                      setTimeout(() => {
                                        this.setState({ action: false });
                                      }, 1500);
                                    }}
                                  >
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      width="16"
                                      height="16"
                                      fill="currentColor"
                                      class="bi bi-pencil-square"
                                      viewBox="0 0 16 16"
                                    >
                                      <path d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z" />
                                      <path
                                        fill-rule="evenodd"
                                        d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5v11z"
                                      />
                                    </svg>
                                  </button>
                                </span>
                              </td>
                            </tr>
                          </>
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
                      <div
                        class="modal-dialog modal-xl"
                        style={{ height: "90%" }}
                      >
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
                              <this.Rpdf />
                            </PDFViewer>
                          </div>
                          <PDFDownloadLink
                            document={<this.Rpdf />}
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
                  <p>No record found</p>
                )}
              </>
            )}
            {showpdfs && (
              <>
                <p className={styles.teacheader}>Your uploads: </p>
                {createdpdfs.length > 0 ? (
                  <>
                    <table class="table table-bordered">
                      <thead>
                        <tr>
                          <th scope="col" style={{ color: "#5c5c5c" }}>
                            Pdf Name
                          </th>
                          <th scope="col" style={{ color: "#5c5c5c" }}>
                            Assigned To
                          </th>
                          <th scope="col" style={{ color: "#5c5c5c" }}>
                            Action
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {createdpdfs.map((createdpdf) => (
                          <>
                            <tr>
                              <td style={{ color: "#5c5c5c" }}>
                                {createdpdf.filename}{" "}
                                <button
                                  type="button"
                                  class="btn btn-primary"
                                  style={{ margin: 5 }}
                                  data-bs-toggle="modal"
                                  data-bs-target="#exampleModal"
                                  onClick={() => {
                                    this.setState({
                                      content: createdpdf.content,
                                    });
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
                                <button
                                    type="button"
                                    class="btn btn-danger"
                                    style={{ margin: 5 }}
                                    onClick={() =>
                                      this.deletepdf(createdpdf._id)
                                    }
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
                              <td style={{ color: "#5c5c5c" }}>
                              <div style={{height:"95%",overflowY:"scroll"}}>
                                {createdpdf.assignedto.map((e) => (
                                  
                                  <p>{e.name}</p>
                                  
                                ))}
                                </div>
                              </td>
                              <td style={{ color: "#5c5c5c" }}>
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
                                  <div class="modal-dialog modal-xl">
                                    <div class="modal-content">
                                      <div class="modal-header">
                                        <h5 class="modal-title">
                                          Select from the list of available
                                          students
                                        </h5>
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
                                          this.getRecords()
                                        }><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-bootstrap-reboot" viewBox="0 0 16 16">
                                        <path d="M1.161 8a6.84 6.84 0 1 0 6.842-6.84.58.58 0 1 1 0-1.16 8 8 0 1 1-6.556 3.412l-.663-.577a.58.58 0 0 1 .227-.997l2.52-.69a.58.58 0 0 1 .728.633l-.332 2.592a.58.58 0 0 1-.956.364l-.643-.56A6.812 6.812 0 0 0 1.16 8z"/>
                                        <path d="M6.641 11.671V8.843h1.57l1.498 2.828h1.314L9.377 8.665c.897-.3 1.427-1.106 1.427-2.1 0-1.37-.943-2.246-2.456-2.246H5.5v7.352h1.141zm0-3.75V5.277h1.57c.881 0 1.416.499 1.416 1.32 0 .84-.504 1.324-1.386 1.324h-1.6z"/>
                                      </svg></button>
                                        {students.map((student) => (
                                          <ul class="list-group">
                                            <li class="list-group-item">
                                              <div class="input-group mb-3">
                                                <div class="input-group-prepend">
                                                  <div
                                                    class="input-group-text"
                                                    style={{ marginRight: 20 }}
                                                  >
                                                    <input
                                                    className="check"
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
                                          value={createdpdf._id}
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
                              </td>
                            </tr>
                          </>
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
                      <div
                        class="modal-dialog modal-xl"
                        style={{ height: "90%" }}
                      >
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
                              <this.Rpdf />
                            </PDFViewer>
                          </div>
                          <PDFDownloadLink
                            document={<this.Rpdf />}
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
              </>
            )}
          </div>
        )}

        {/* //////////////////////////////////////////////  Student  ///////////////////////////////////////////////////////// */}

        {role === "Student" && <StudentDashboard stutasks={stutasks} />}

        {/* //////////////////////////////////////////////  Admin  ///////////////////////////////////////////////////////// */}

        {role === "Admin" && (
          <AdminDashboard
            userRecords={userRecords}
            allpdfs={allpdfs}
            students={students}
            onUserDeleted={this.getRecords}
            onPdfDeleted={this.getTeachertasks}
            onRefreshStudents={this.getRecords}
          />
        )}
      </div>
    );
  }
}

export default Main;

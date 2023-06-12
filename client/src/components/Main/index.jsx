import React, { Component } from "react";
import styles from "./styles.module.css";
import axios from "axios";

//imports for react-pdf package
import { Document, Page, Text, Image, PDFViewer } from "@react-pdf/renderer";
import { PDFDownloadLink } from "@react-pdf/renderer";
//cover will act as default cover image of the pdf
import cover from "../../images/cover.jpg";
import page from "../../images/page.png";

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
      category:"",
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
      pdfexists:true,
      assigninfo:false,
      assignbg:"",
      assigninfomessage:"",
      action:false,
      actionbg:"",
      actionmessage:""
    };
  }

  componentDidMount() {
    this.getCreds();
    this.getRecords();
    this.getTeachertasks();

    //fetch all localstorage saved contents
    const draftcontent = localStorage.getItem("draft");
    const index = localStorage.getItem("indexcontent");
    const filename = localStorage.getItem("filename");
    const contcategory = localStorage.getItem("category");
    const pages = JSON.parse(localStorage.getItem("pagecount"));
    const a = JSON.parse(localStorage.getItem("contentsofar"));
    console.log(a);
    //set state if local storage is present else show default state initialization value
    const { text, pdfname, indexcontent, pagecount, content, category } = this.state;
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
    const response = await fetch("http://localhost:8080/api/findUser", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await response.json();
    this.setState({ role: data.role, userName: data.name, userId: data.id });
  };

  //function to get list of all users: students,teachers,admins
  getRecords = async () => {
    const url = "http://localhost:8080/api/getUsers";
    const { data: res } = await axios.get(url);
    let stu = res.allusers.filter(function (ele) {
      return ele.role == "Student";
    });
    this.setState({ userRecords: res.allusers });
    this.setState({ students: stu });
  };

  //function to fetch tasks of all users: students, teachers and admins
  getTeachertasks = async () => {
    const url = "http://localhost:8080/api/findUploads";
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
    const response = await fetch("http://localhost:8080/api/getstutasks", {
      method: "GET",
      headers: { userid: userId },
    });
    const tasks = await response.json();  
    const unique = [];
          const result = tasks.tasks.filter(e =>{
             const isduplicate = unique.includes(e.fileid);
             if(!isduplicate){
              unique.push(e.fileid);
              return true;
             }
             return false;
          });      
    this.setState({ stutasks: result });
  };

  //admin functionality to remove any type of user
  deleteUser = async (id) => {
    var result = window.confirm("This will remove from database");
    if (result) {
      await fetch("http://localhost:8080/api/deleteUser", {
        method: "POST",
        headers: { UserId: `${id}` },
      });
      this.getRecords();
    }
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
  }

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
      this.setState({action:false});
      this.setState({ showpdfactions: true });
    } else {
      this.setState({action:true,actionbg:"red",actionmessage:"Please provide some content"})
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
    window.location.reload();
    this.getTeachertasks();
  };

  //function to handle pdf's content upload
  uploadpdf = async () => {
    const { pdfname,category, content, userName, userId } = this.state;
    const date = new Date();
    const body = {
      filename: pdfname,
      creator: userName,
      creatorid: userId,
      dateofupload: date,
      category,
      content,
    };
    const url = "http://localhost:8080/api/upload";
    const res = await axios.post(url, body);
    console.log(res);
    if (res.status == 201) {
      this.setState({action:false})
      this.saveandstartfresh();
      this.getTeachertasks();
    } else if (res.status == 200) {
      this.setState({action:true,actionbg:"red",actionmessage:"You already have a pdf with this title, please enter a different one"})
    }
  };

  //function to delete any pdf
  deletepdf = async (id) => {
    var result = window.confirm("This will remove from database");
    if (result) {
      await fetch("http://localhost:8080/api/deletepdf", {
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
    const res = await fetch("http://localhost:8080/api/assign", {
      method: "POST",
      headers: {
        pdfId: docid,
        aud: JSON.stringify(currentlyassigned),
      },
    });
    if(res.status == 200){
      this.setState({assigninfo:true,assignbg:"green",assigninfomessage:"Successfully assigned"})
    this.getTeachertasks();
    }
    else{
      this.setState({assigninfo:true,assignbg:"red",assigninfomessage:"Could not be assigned"})
    }
  };

  //function to log a user out
  handleLogout = () => {
    localStorage.removeItem("token");
    window.location.reload();
  };

  //function to read pdf
  renderpdf = async (id) => {
    try {
      const renderthis = await fetch("http://localhost:8080/api/renderpdf", {
        method: "POST",
        headers: { pdfid: id },
      });
      const data = await renderthis.json();
      console.log(data.data);
      if (data.message == "Pdf not found") {
        this.setState({pdfexists:false})
      } else {
        this.setState({pdfexists:true})
        this.setState({ content: data.data, read: true });
      }
    } catch (e) {
      console.log(e);
    }
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
      actionmessage
    } = this.state;

    return (
      <div className={styles.main_container}>
        <nav className={styles.navbar}>
          <text className={styles.logo}>Academical</text>
          <button className={styles.white_btn} onClick={this.handleLogout}>
            Logout
          </button>
        </nav>
        <p className={styles.welcome}>Welcome to your dashboard, {userName}</p>

        {/* //////////////////////////////////////////////  Student  ///////////////////////////////////////////////////////// */}

        {role === "Student" && (
          <div className={styles.body}>
            <p style={{ fontSize: 36, color: "#5c5c5c" }}>Tasks assigned to you</p>
            {stutasks.length > 0 ? (
              <>
                <table class="table">
                  <thead>
                    <tr>
                      <th scope="col" style={{ color: "#5c5c5c" }}>
                        Pdf Name
                      </th>
                      <th scope="col" style={{ color: "#5c5c5c" }}>
                        Pdf Category
                      </th>
                      <th scope="col" style={{ color: "#5c5c5c" }}>
                        Assigned By
                      </th>
                      <th scope="col" style={{ color: "#5c5c5c" }}>
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {stutasks.map((t) => (
                      <>
                        <tr>
                          <td style={{ color: "#5c5c5c" }}>{t.filename}</td>
                          <td style={{ color: "#5c5c5c" }}>{t.category}</td>
                          <td style={{ color: "#5c5c5c" }}>{t.creator}</td>
                          <td>
                            <button
                              type="button"
                              class="btn btn-info"
                              data-bs-toggle="modal"
                              data-bs-target="#exampleModal"
                              style={{ color: "#fff" }}
                              onClick={() => {
                                this.renderpdf(t.fileid);
                              }}
                            >
                              View
                            </button>
                          </td>
                        </tr>
                      </>
                    ))}
                  </tbody>
                </table>
              </>
            ) : (
              <p>no tasks assigned yet</p>
            )}

            {/*<!-- Modal -->*/}
            <div
              class="modal fade"
              id="exampleModal"
              tabindex="-1"
              aria-labelledby="exampleModalLabel"
              aria-hidden="true"
            >
              <div class="modal-dialog modal-xl" style={{ height: "90%" }}>
                {pdfexists ? (<div class="modal-content" style={{ height: "100%" }}>
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
                            style={{alignSelf:"center"}}>
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
                </div>)
                :(
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
                    <p style={{textAlign:"center", color:"#5c5c5c", fontSize: 40}}>This pdf seems to be removed</p>
                    </div>
                    </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* //////////////////////////////////////////////  Teacher  ///////////////////////////////////////////////////////// */}

        {role === "Teacher" && (
          <div className={styles.body}>
            <text style={{ fontWeight: 300, fontSize: 26, color: "#5c5c5c" }}>
              The teacher's dashboard provides you the power feature of creating
              your own notes, saving and downloading them as pdfs and further
              assigning them to the students of your choice. Create your notes,
              save them as draft and continue where you left out anytime
              anywhere. Our system provides a view of what you have been upto
              and manage your tasks hastle free.
            </text>
            <p
              style={{
                fontWeight: "bold",
                fontSize: 26,
                textAlign: "center",
                marginTop: 40,
                marginBottom: 40,
                color: "#5c5c5c",
              }}
            >
              {" "}
              Let's get started
            </p>
            <div
              className="btnpack"
              style={{
                width: "100%",
                display: "flex",
                flexDirection: "row",
                justifyContent: "center",
                alignSelf: "center",
              }}
            >
              <button
                className={styles.teacbtn}
                onClick={() =>
                  this.setState({ showeditor: true, showpdfs: false })
                }
              >
                Start with creating a new pdf
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
                <p
                  style={{
                    fontWeight: 300,
                    fontSize: 26,
                    color: "#5c5c5c",
                    marginBottom: 40,
                  }}
                >
                  Fill the input fields accordingly and sit back and relax as we
                  convert your input text into chapters under a pdf. Enter the
                  chapter name and respective chapter content and press add new
                  chapter button to start creating a new chapter from a fresh
                  page.
                </p>
                <p
                  style={{
                    fontWeight: "bold",
                    fontSize: 26,
                    textAlign: "center",
                    marginTop: 40,
                    marginBottom: 40,
                    color: "#024db1",
                  }}
                >
                  ⩔
                </p>
                <label
                  style={{ fontWeight: "bold", fontSize: 20, color: "#5c5c5c" }}
                >
                  Enter name of the pdf file to be saved as :{" "}
                </label>
                <input
                  type="text/number"
                  value={pdfname}
                  name="pdfname"
                  placeholder="file name"
                  required={true}
                  onChange={this.handleFilename}
                />
                <br></br>

                <label
                  style={{ fontWeight: "bold", fontSize: 20, color: "#5c5c5c" }}
                >
                  Enter chapter name :{" "}
                </label>
                <input
                  type="text/number"
                  name="indexcontent"
                  value={indexcontent}
                  placeholder="chapter name"
                  required={true}
                  onChange={this.handleIndex}
                />
                <br></br>
                <label style={{ fontWeight: "bold", fontSize: 20, color: "#5c5c5c" }}>Enter content category :{" "}</label>
                <input
                  type="text/number"
                  name="category"
                  value={category}
                  placeholder="category"
                  required={true}
                  onChange={this.handleCategory}
                />
                <br></br>

                <label
                  style={{ fontWeight: "bold", fontSize: 20, color: "#5c5c5c" }}
                >
                  Enter chapter content :{" "}
                </label>
                <br />
                <br />
                <div
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <textarea
                    type="text/number"
                    wrap="true"
                    rows={20}
                    cols={150}
                    value={text}
                    name="text"
                    placeholder={"chapter note"}
                    onChange={this.handleContent}
                    required={true}
                    style={{
                      outline: "none",
                      border: "none",
                      padding: 15,
                      borderRadius: 10,
                      backgroundColor: "#edf5f3",
                      margin: 5,
                      fontSize: 14,
                    }}
                  />
                  <button
                    onClick={this.addnewpage}
                    style={{
                      margin: 10,
                      backgroundColor: "#3F00FF",
                      outline: "none",
                      border: "none",
                      borderRadius: 50,
                      padding: 5,
                      color: "#fff",
                      fontWeight: 400,
                    }}
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
                {action && (
                  <div class="alert alert-warning alert-dismissible fade show" role="alert">
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
                    window.location.reload();
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
                    <table class="table">
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
                                    Show / download content
                                  </button>

                                  <button
                                    type="button"
                                    class="btn btn-danger"
                                    style={{ margin: 5 }}
                                    onClick={() =>
                                      this.deletepdf(createdpdf._id)
                                    }
                                  >
                                    Remove this pdf
                                  </button>
                                  <button
                                    type="button"
                                    class="btn btn-success"
                                    style={{ margin: 5 }}
                                    onClick={() => {
                                      this.setState({
                                        content: createdpdf.content,
                                        pdfname: createdpdf.filename,
                                        showpdfactions: false,
                                      });
                                      this.setState({action:true,actionbg:"red",actionmessage:"Please note: you need to save with a new name if document is edited/updated"})                                      
                                    }}
                                  >
                                    Edit pdf
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
                        <div class="modal-content" style={{ height: "100%"}}>
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
                              style={{alignSelf:"center"}}
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
                    <table class="table">
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
                              </td>
                              <td style={{ color: "#5c5c5c" }}>
                                {createdpdf.assignedto.map((e) => (
                                  <p>{e.name}</p>
                                ))}
                              </td>
                              <td style={{ color: "#5c5c5c" }}>
                                <p>*Refresh to deselect</p>
                                {students.map((student) => (
                                  <li
                                    style={{
                                      backgroundColor: "transparent",
                                      color: "#5c5c5c",
                                    }}
                                  >
                                    {student.firstName}
                                    <span>
                                      <input
                                        type="checkbox"
                                        value={student._id}
                                        style={{ width: 20, margin: 5 }}
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
                                          console.log(
                                            this.state.currentlyassigned
                                          );
                                        }}
                                      />
                                    </span>
                                  </li>
                                ))}
                                <button
                                  type="button"
                                  class="btn btn-info"
                                  value={createdpdf._id}
                                  onClick={(e) => {
                                    this.createassign(e.target.value);
                                  }}
                                  style={{
                                    color: "#fff",
                                    backgroundColor: "blue",
                                  }}
                                >
                                  Assign
                                </button>
                                {assigninfo && (
                              <div class="alert alert-info alert-dismissible fade show" role="alert" style={{margin:10,width:"50%",alignSelf:"center"}}>
                                <p style={{textAlign:"center"}}>{assigninfomessage}</p>
                              </div>
                            )}
                              </td>
                            </tr>
                          </>
                        ))}
                      </tbody>
                    </table>
                  </>
                ) : (
                  <p>No records found</p>
                )}
              </>
            )}
          </div>
        )}

        {/* //////////////////////////////////////////////  Admin  ///////////////////////////////////////////////////////// */}

        {role === "Admin" && (
          <div className={styles.body}>
            <p className={styles.teacheader}>List of all users</p>
            {userRecords.length > 0 ? (
              <>
                <table class="table">
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
                        <td style={{ color: "#5c5c5c" }}>
                          {userRecord.firstName}
                        </td>
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
                            Remove
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
                <table class="table">
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
                              Remove this pdf
                            </button>
                            <br/>
                            <button
                              type="button"
                              class="btn btn-info"
                              data-bs-toggle="modal"
                              data-bs-target="#exampleModal"
                              style={{ color: "#fff", marginTop:5}}
                              onClick={() => {
                                this.renderpdf(allpdf._id);
                              }}
                            >
                              View / Download pdf
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
                            <p>*Refresh to deselect</p>
                            {students.map((student) => (
                              <li
                                style={{
                                  backgroundColor: "transparent",
                                  color: "#5c5c5c",
                                }}
                              >
                                {student.firstName}
                                <span>
                                  <input
                                    type="checkbox"
                                    style={{ width: 10, margin: 5 }}
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
                                </span>
                              </li>
                            ))}
                            <button
                              value={allpdf._id}
                              type="button"
                              class="btn btn-info"
                              style={{
                                backgroundColor: "blue",
                                color: "#fff",
                              }}
                              onClick={(e) => {
                                this.createassign(e.target.value);
                              }}
                            >
                              Assign
                            </button>
                            {assigninfo && (
                              <div class="alert alert-info alert-dismissible fade show" role="alert" style={{margin:10,width:"50%",alignSelf:"center"}}>
                              <p style={{textAlign:"center"}}>{assigninfomessage}</p>
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
                          <this.Rpdf />
                        </PDFViewer>
                      </div>
                      <PDFDownloadLink
                              document={<this.Rpdf />}
                              style={{alignSelf:"center"}}
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
        )}
      </div>
    );
  }
}

export default Main;

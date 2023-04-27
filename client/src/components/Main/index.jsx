import React, { Component } from "react";
import styles from "./styles.module.css";
import axios from "axios";

//imports for react-pdf package
import { Document, Page, Text, Image,} from "@react-pdf/renderer";
import { PDFDownloadLink } from "@react-pdf/renderer";
//cover will act as default cover image of the pdf
import cover from "../../images/cover.jpg";

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
      pagecount: 0,
      showeditor: true,
      showpdfs: false,
      content: [{}], //stores chaptername and chaptercontent as object
      createdpdfs: [], //stores teacher specific pdfs
      allpdfs: [], //stores all pdfs created by all the teachers
      students: [],
      currentlyassigned: [{}], //stores studentname and id of the students to whom a pdf is assigned as object
      showpdfcontent:false
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
    const pages = JSON.parse(localStorage.getItem("pagecount"));
    const a = JSON.parse(localStorage.getItem("contentsofar"));
    console.log(a)
    //set state if local storage is present else show default state initialization value
    const { text, pdfname, indexcontent, pagecount, content} = this.state;
    this.setState({ text: draftcontent ? draftcontent : text });
    this.setState({ indexcontent: index ? index : indexcontent });
    this.setState({ pdfname: filename ? filename : pdfname });
    this.setState({ pagecount: pages ? pages : pagecount });
    this.setState({ content: a ? a : content });
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
    const response = await fetch("http://localhost:8080/api/getstutasks",{
    method:"GET",
    headers:{ userid: userId }
    });
    const tasks = await response.json();
    this.setState({stutasks: tasks.tasks});
  };

  //admin functionality to remove any type of user
  deleteUser = async (id) => {
    await fetch("http://localhost:8080/api/deleteUser", {
      method: "POST",
      headers: { UserId: `${id}` },
    });
    this.getRecords();
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

  //function to handle pdf's content upload 
  uploadpdf = async () => {
    const { pdfname, content, userName, userId } = this.state;
    const date = new Date();
    const body = {
      filename: pdfname,
      creator: userName,
      creatorid: userId,
      dateofupload: date,
      content
    };
    const url = "http://localhost:8080/api/upload";
    const { data: res } = await axios.post(url, body);
    this.getTeachertasks();
  };

  //function to add and move to new page
  addnewpage = async () => {
    const { indexcontent, text, pagecount, content } = this.state;
    const contentbody = { chaptername: indexcontent, chaptertext: text };
    this.setState({
      content: [...content, contentbody],
    });
    console.log(content);
    localStorage.setItem("contentsofar",JSON.stringify(content));

    const count = pagecount + 1;
    this.setState({indexcontent:"",text:"", pagecount: count });
    
    localStorage.removeItem("indexcontent");
    localStorage.removeItem("draft");
    localStorage.setItem("pagecount", JSON.stringify(count));
    
  };

  //function to save a pdf as uploaded and start working on a fresh one
  saveandstartfresh = async () => {
    this.addnewpage();
    this.uploadpdf();
    localStorage.removeItem("filename");
    localStorage.removeItem("indexcontent");
    localStorage.removeItem("draft");
    localStorage.removeItem("contentsofar");
    localStorage.removeItem("pagecount");
    window.location.reload();
    this.getTeachertasks();
  };

  //function to delete any pdf
  deletepdf = async (id) => {
    await fetch("http://localhost:8080/api/deletepdf", {
      method: "POST",
      headers: { pdfId: `${id}` },
    });
    this.getTeachertasks();
  };

  //function to assign pdfs
  createassign = async(id) => {
    const { currentlyassigned } = this.state;
    const docid = id;
    await fetch("http://localhost:8080/api/assign", {
      method: "POST",
      headers: {
        pdfId: docid,
        aud: JSON.stringify(currentlyassigned)
      }    
    });
    this.getTeachertasks();
  };

  //function to log a user out
  handleLogout = () => {
    localStorage.removeItem("token");
    window.location.reload();
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
        <Page style={{padding:40,textAlign:"center"}}>
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
              padding:40,
              textAlign:"center"
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
      indexcontent,
      userRecords,
      stutasks,
      showeditor,
      showpdfs,
      students,
      createdpdfs,
      allpdfs,
      currentlyassigned,
      showpdfcontent
    } = this.state;

    return (
      <div className={styles.main_container}>
        <nav className={styles.navbar}>
          <h1>Ebook system</h1>
          <button className={styles.white_btn} onClick={this.handleLogout}>
            Logout
          </button>
        </nav>
        <p className={styles.welcome}>
          Welcome {role}, {userName}
        </p>

        {/* //////////////////////////////////////////////  Student  ///////////////////////////////////////////////////////// */}

        {role === "Student" && (
          <div className={styles.body}>
            <p style={{ fontSize: 36 }}>Tasks assigned to you</p>
            {stutasks.length > 0 ? (
              <>
                <li>
                  <b>Topic</b>{" "}
                  <span>
                    <b>Assigned By</b>
                  </span>{" "}
                  <span>
                    <b>Action</b>
                  </span>
                </li>
                <ul>
                  {stutasks.map((t) => (             
                   <li>
                    {t.filename}
                    <span>{t.creator}</span>
                    <button><a href={"../../../../downloads/"+`${t.filename}.pdf`} download>View</a></button>
                   </li>
                  ))}
                </ul>
              </>
            ) : (
              <p>no tasks assigned yet</p>
            )}
          </div>
        )}

        {/* //////////////////////////////////////////////  Teacher  ///////////////////////////////////////////////////////// */}

        {role === "Teacher" && (
          <div className={styles.body}>


            <div className="btnpack" style={{ marginLeft: "40%" }}>
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
                My pdfs
              </button>
            </div>


            {showeditor && (
              <>
                <label>Enter name of the pdf file to be saved as : </label>
                <input
                  type="text/number"
                  value={pdfname}
                  name="pdfname"
                  placeholder="file name"
                  required
                  onChange={this.handleFilename}
                />
                <br></br>

                <label>Enter chapter name : </label>
                <input
                  type="text/number"
                  name="indexcontent"
                  value={indexcontent}
                  placeholder="chapter name"
                  required
                  onChange={this.handleIndex}
                />
                <br></br>
                
                <label>Enter chapter content : </label>
                <br/>
                <br/>
                <textarea
                  type="text/number"
                  wrap="true"
                  rows={20}
                  cols={150}
                  value={text}
                  name="text"
                  placeholder={"chapter note"}
                  onChange={this.handleContent}
                  required
                />
                <br></br>
                <hr />

                <button onClick={this.addnewpage}>Add new page</button>
                <PDFDownloadLink document={<this.Rpdf />} fileName={pdfname}>
                  {({ loading }) =>
                    loading ? (
                      <button className={styles.green_btn}>
                        Loading Document...
                      </button>
                    ) : (
                      <button className={styles.green_btn} onClick={()=>{localStorage.removeItem("pagecount");window.location.reload()}}>
                        Download as pdf
                      </button>
                    )
                  }
                </PDFDownloadLink>
                <button
                  className={styles.blue_btn}
                  onClick={this.saveandstartfresh}
                >
                  Save and start with a new pdf
                </button>
                <br></br>
                <hr />

                  <p>Your content so far: </p>
                  <div style={{display:"flex", flexDirection:"row",overflowX:"auto",overflowY:"hidden"}}>
                {this.state.content.map((c) => (
                  
                  <div style={{minHeight: 0, minWidth: 245,backgroundColor:"#5c5c5c",margin: 10,overflowX:"hidden",overflowY:"auto"}}>
                    <p>{c.chaptername}</p>
                    <p>{c.chaptertext}</p>
                  </div>
                  
                ))}
                </div>
                <hr />

                <p className={styles.teacheader}>Your previous works: </p>
                {createdpdfs.length > 0 ? (
                  <>
                    <li>
                      <b>Pdf name</b>
                      <span>
                        <b>Actions</b>
                      </span>
                    </li>
                    <ul>
                      {createdpdfs.map((createdpdf) => (
                        <>
                        <li>
                          {createdpdf.filename}
                          <span>
                            <button
                              style={{ alignSelf: "flex-start" }}
                              onClick={()=>{
                                this.setState({showpdfcontent:true})
                              }}
                            >
                              Show content
                            </button>
                            <button
                              style={{ alignSelf: "flex-start" }}
                              onClick={() => this.deletepdf(createdpdf._id)}
                            >
                              Remove this pdf
                            </button>
                            <button onClick={()=>{this.setState({content:createdpdf.content,pdfname:createdpdf.filename})}}>Download as pdf</button>
                          </span>
                        </li>

                        {showpdfcontent && (
                          <>
                          <button
                              style={{ alignSelf: "flex-end" }}
                              onClick={()=>{
                                this.setState({showpdfcontent:false})
                              }}
                            >
                              Hide content
                            </button>
                        <div style={{display:"flex", flexDirection:"row",overflowX:"auto",overflowY:"hidden"}}>
                          
                          {createdpdf.content.map((c)=>(
                            <div style={{maxHeight:300, minWidth: 245,backgroundColor:"#5c5c5c",margin: 10,overflowX:"hidden",overflowY:"auto"}}>
                            <p>{c.chaptername}</p>
                            <p>{c.chaptertext}</p>
                          </div>
                          ))}
                        </div>
                        </>)}
                        </>
                      ))}
                    </ul>
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
                    <li>
                      <b>Pdf Name</b>
                      <span>
                        <b>Assigned to</b>
                      </span>
                      <span>
                        <b>Action</b>
                      </span>
                    </li>
                    <ul>
                      {createdpdfs.map((createdpdf) => (
                       
                        <li>
                          {createdpdf.filename}{" "}
                          <span>{createdpdf.assignedto.map((e)=>(
                            <p>{e.name}</p>
                          ))}</span>
                          <span>
                            {students.map((student) => (
                              <li>
                                {student.firstName}
                                <span>
                                  <input
                                    type="checkbox"
                                    value={student._id}
                                    onChange={(e) => {
                                      
                                      if(e.target.checked){
                                      const res = {name: student.firstName,id:student._id}
                                      this.setState({
                                        currentlyassigned: [
                                          ...currentlyassigned,
                                          res,
                                        ],
                                      });
                                    }
                                      console.log(this.state.currentlyassigned);
                                    }}
                                  />
                                </span>
                              </li>
                            ))}
                            <button value={createdpdf._id} onClick={(e)=>{this.createassign(e.target.value)}}>Assign</button>
                          </span>
                        </li>
                      ))}
                    </ul>
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
                <li>
                  <b>Name</b>{" "}
                  <span>
                    <b>Role</b>
                  </span>
                  <span>
                    <b>Action</b>
                  </span>
                </li>
                <ul>
                  {userRecords.map((userRecord) => (
                    <li>
                      {userRecord.firstName} <span>{userRecord.role}</span>
                      <button onClick={() => this.deleteUser(userRecord._id)}>
                        X
                      </button>
                    </li>
                  ))}
                </ul>
              </>
            ) : (
              <p>No records found</p>
            )}
            <hr />
            <p className={styles.teacheader}>All uploaded pdfs: </p>
            {allpdfs.length > 0 ? (
              <>
                <li>
                  <b>Pdf Name</b>
                  <span><b>Created by</b></span>
                  <span>
                    <b>Assigned to</b>
                  </span>
                  <span>
                    <b>Action</b>
                  </span>
                </li>
                <ul>
                  {allpdfs.map((allpdf) => (
                    <li>
                      <span>{allpdf.filename}  <button
                              style={{ alignSelf: "flex-start" }}
                              onClick={() => this.deletepdf(allpdf._id)}
                            >
                              Remove this pdf
                            </button></span>
                      <span>{allpdf.creator}</span>
                      <span>{allpdf.assignedto.map((e)=>(
                            <p>{e.name}</p>
                          ))}</span>
                      <span>
                        {students.map((student) => (
                          <li>
                            {student.firstName}
                            <span>
                              <input
                                type="checkbox"
                                value={student._id}
                                onChange={(e) => {
                                  if(e.target.checked){
                                      const res = {name: student.firstName,id:student._id}
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
                        <button value={allpdf._id} onClick={(e)=>{this.createassign(e.target.value)}}>Assign</button>
                      </span>
                    </li>
                  ))}
                </ul>
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

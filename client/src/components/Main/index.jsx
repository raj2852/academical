import React, { Component } from "react";
import styles from "./styles.module.css";
import axios from "axios";

//imports for react-pdf package
import { Document, Page, Text, Image,} from "@react-pdf/renderer";
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
      pagecount: 0,
      showeditor: false,
      showpdfs: false,
      content: [{chaptername:"",chaptertext:""}], //stores chaptername and chaptercontent as object
      createdpdfs: [], //stores teacher specific pdfs
      allpdfs: [], //stores all pdfs created by all the teachers
      students: [],
      currentlyassigned: [{}], //stores studentname and id of the students to whom a pdf is assigned as object
      showpdfcontent:false,
      showpdfactions:false,
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
    var result = window.confirm("This will remove from database");
    if(result){
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
    if(indexcontent!=="" && text!==""){
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

    this.addnewpage();

    this.setState({showpdfactions:true})
  }
  else{
    alert("Please provide some content");
  }
  };

  //function to save a pdf as uploaded and start working on a fresh one
  saveandstartfresh = async () => {
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
    var result = window.confirm("This will remove from database");
    if(result){
    await fetch("http://localhost:8080/api/deletepdf", {
      method: "POST",
      headers: { pdfId: `${id}` },
    });
    this.getTeachertasks();
  }
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
      showpdfcontent,
      showpdfactions,
    } = this.state;

    return (
      <div className={styles.main_container}>
        <nav className={styles.navbar}>
        <text className={styles.logo}>Academical</text>
          <button className={styles.white_btn} onClick={this.handleLogout}>
            Logout
          </button>
        </nav>
        <p className={styles.welcome}>
          Welcome to the {role}'s dashboard, {userName}
        </p>

        {/* //////////////////////////////////////////////  Student  ///////////////////////////////////////////////////////// */}

        {role === "Student" && (
          <div className={styles.body}>
            <p style={{ fontSize: 36,color:"#fff" }}>Tasks assigned to you</p>
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
                    <button style={{padding:10,backgroundColor:"orange",border:"none",outline:"none",borderRadius:10,color:"#fff",fontWeight:600}}><a href={"../../../../downloads/"+`${t.filename}.pdf`} download style={{textDecoration:"none",color:"#fff"}}>View</a></button>
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
            <text style={{fontWeight:600,fontSize:26,color:"#fff"}}>
              The teacher's dashboard provides you the power feature of creating your own notes, saving and downloading them as pdfs and further assigning them to the students of your choice. Create your notes, save them as draft and continue where you left out anytime anywhere. Our system provides a view of what you have been upto and manage your tasks hastle free.
            </text>
            <p style={{fontWeight:"bold",fontSize:26,textAlign:"center",marginTop:40,marginBottom:40,color:"#fff"}}>  Let's get started</p>
            <div className="btnpack" style={{width:"100%",display:"flex",flexDirection: "row",
    justifyContent: "center", alignSelf:"center" }}>
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
              <p style={{fontWeight:600,fontSize:26,color:"#fff",marginBottom:40}}>Fill the input fields accordingly and sit back and relax as we convert your input text into chapters under a pdf. Enter the chapter name and respective chapter content and press add new chapter button to start creating a new chapter from a fresh page.</p>
              <p style={{fontWeight:"bold",fontSize:26,textAlign:"center",marginTop:40,marginBottom:40,color:"#fff"}}>⩔</p>
                <label style={{fontWeight:"bold",fontSize:20,color:"#fff"}}>Enter name of the pdf file to be saved as : </label>
                <input
                  type="text/number"
                  value={pdfname}
                  name="pdfname"
                  placeholder="file name"
                  required={true}
                  onChange={this.handleFilename}
                />
                <br></br>

                <label style={{fontWeight:"bold",fontSize:20,color:"#fff"}}>Enter chapter name : </label>
                <input
                  type="text/number"
                  name="indexcontent"
                  value={indexcontent}
                  placeholder="chapter name"
                  required={true}
                  onChange={this.handleIndex}
                />
                <br></br>
                
                <label style={{fontWeight:"bold",fontSize:20,color:"#fff"}}>Enter chapter content : </label>
                <br/>
                <br/>
                <div style={{display:"flex",flexDirection:"row",alignItems:"center",justifyContent:"center"}}>
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
                  style={{outline: "none",
                    border: "none",
                    padding: 15,
                    borderRadius: 10,
                    backgroundColor: "#edf5f3",
                    margin: 5,
                    fontSize: 14}}
                />
                <button onClick={this.addnewpage} style={{margin:10,backgroundColor:"#3F00FF",outline:"none",border:"none",borderRadius:50,padding:5,color:"#fff",fontWeight:400}}><p style={{fontSize:40,margin:5,color:"#fff"}}>+<span><img src={page} style={{height:30,width:30,margin:2}} alt="Add this chapter and move to next page"/></span></p>Add this chapter and start new</button>
                </div>
                <br></br>
                
                
                {showpdfactions && (
                  <>
                  <p style={{color:"#fff"}}>*Click save as draft if you plan to be inactive for longer durations</p>
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
                  Save as draft and start with a new pdf
                </button>
                </>
                )}
                <br></br>
                <hr />
                  <p  style={{fontWeight:"bold",fontSize:20,color:"#fff"}}>Your content so far: </p>
                  <div style={{display:"flex", flexDirection:"row",overflowX:"auto",overflowY:"hidden"}}>
                
                {this.state.content.map((c) => (
                  (c.chaptername!=="" && (
                  <div style={{height: 400, width: 245,backgroundColor:"#FBFCFC",margin: 10,overflowX:"hidden",overflowY:"auto",padding:10}}>
                    <p style={{fontWeight:600,textAlign:"center"}}>{c.chaptername}</p>
                    <p style={{fontWeight:400}}>{c.chaptertext}</p>
                  </div>
                  ))
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
                              style={{ alignSelf: "flex-start",margin:10,backgroundColor:"#fec20c",padding:10,border:"none",outline:"none",borderRadius:10,color:"#fff",fontWeight:"bold" }}
                              onClick={()=>{
                                this.setState({showpdfcontent:true})
                              }}
                            >
                              Show content
                            </button>
                            <button
                              style={{ alignSelf: "flex-start",margin:10,backgroundColor:"red",padding:10,border:"none",outline:"none",borderRadius:10,color:"#fff",fontWeight:"bold" }}
                              onClick={() => this.deletepdf(createdpdf._id)}
                            >
                              Remove this pdf
                            </button>
                            <button style={{ alignSelf: "flex-start",margin:10,backgroundColor:"green",padding:10,border:"none",outline:"none",borderRadius:10,color:"#fff",fontWeight:"bold" }} onClick={()=>{this.setState({content:createdpdf.content,pdfname:createdpdf.filename,showpdfactions:true})}}>
                              Edit / Download as pdf
                            </button>
                          </span>
                        </li>

                        {showpdfcontent && (
                          <>
                          <button
                              style={{ alignSelf: "flex-end" ,border:"none", outline:"none",borderRadius:8,padding:5}}
                              onClick={()=>{
                                this.setState({showpdfcontent:false})
                              }}
                            >
                              X Hide content
                            </button>
                        <div style={{display:"flex", flexDirection:"row",overflowX:"auto",overflowY:"hidden"}}>
                          
                          {createdpdf.content.map((c)=>(
                            (c.chaptername!=="" && (
                            <div style={{height: 400, width: 245,backgroundColor:"#FBFCFC",margin: 10,overflowX:"hidden",overflowY:"auto",padding:10}}>
                            <p style={{fontWeight:600,textAlign:"center"}}>{c.chaptername}</p>
                            <p style={{fontWeight:400}}>{c.chaptertext}</p>
                          </div>
                            ))
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
                          <p>*Refresh to deselect</p>
                            {students.map((student) => (
                              <li>
                                {student.firstName}
                                <span>
                                  <input
                                    type="checkbox"
                                    value={student._id}
                                    style={{width:20,margin:5}}
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
                            <button value={createdpdf._id} onClick={(e)=>{this.createassign(e.target.value)}} style={{outline:"none",border:"none",backgroundColor:"orange",padding:10,borderRadius:10,color:"#fff",fontWeight:"bold",fontSize:16}}>Assign</button>
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
                      <button style={{ alignSelf: "flex-start",backgroundColor:"red",padding:10,border:"none",outline:"none",borderRadius:10,color:"#fff",fontWeight:"bold" }} onClick={() => this.deleteUser(userRecord._id)}>
                        Remove
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
                              style={{ alignSelf: "flex-start",margin:10,backgroundColor:"red",padding:10,border:"none",outline:"none",borderRadius:10,color:"#fff",fontWeight:"bold" }}
                              onClick={() => this.deletepdf(allpdf._id)}
                            >
                              Remove this pdf
                            </button></span>
                      <span>{allpdf.creator}</span>
                      <span>{allpdf.assignedto.map((e)=>(
                            <p>{e.name}</p>
                          ))}</span>
                      <span>
                        <p>*Refresh to deselect</p>
                        {students.map((student) => (
                          <li>
                            {student.firstName}
                            <span>
                              <input
                                type="checkbox"
                                style={{width:10,margin:5}}
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
                        <button value={allpdf._id} style={{outline:"none",border:"none",backgroundColor:"orange",padding:10,borderRadius:10,color:"#fff",fontWeight:"bold",fontSize:16}} onClick={(e)=>{this.createassign(e.target.value)}}>Assign</button>
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

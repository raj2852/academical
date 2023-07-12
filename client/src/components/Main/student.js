import React,{Component} from "react";
import styles from "./styles.module.css";
import {PDFViewer } from "@react-pdf/renderer";
import { PDFDownloadLink } from "@react-pdf/renderer";
import Pdf from "./pdf";


class StudentDashboard extends Component{
  constructor(props){
    super(props);
    this.state = {
      pdfexists: true,
      content: [{ chaptername: "", chaptertext: "" }]
    }
  }
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
        this.setState({ pdfexists: false });
      } else {
        this.setState({ pdfexists: true });
        this.setState({ content: data.data, read: true });
      }
    } catch (e) {
      console.log(e);
    }
  };

  render(){
    const {content,pdfexists} = this.state;
    const {stutasks} = this.props;
    return(
        
            <div className={styles.body}>
              <p style={{ fontSize: 36, color: "#5c5c5c" }}>
                Tasks assigned to you
              </p>
              {stutasks.length > 0 ? (
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
                                View / Download
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
                  {pdfexists ? (
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
                          <Pdf newcontent={content}/>
                        </PDFViewer>
                      </div>
                      <PDFDownloadLink
                        document={<Pdf newcontent={content}/>}
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
                  ) : (
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
                        <p
                          style={{
                            textAlign: "center",
                            color: "#5c5c5c",
                            fontSize: 40,
                          }}
                        >
                          This pdf seems to be removed
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          
          
    )
  }
};

export default StudentDashboard;
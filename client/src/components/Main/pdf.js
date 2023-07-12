import React from "react";
//imports for react-pdf package
import { Document, Page, Text, Image} from "@react-pdf/renderer";
//cover will act as default cover image of the pdf
import cover from "../../images/cover.jpg";

const Pdf = ({newcontent}) => {
    return(
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
    )
};

export default Pdf;

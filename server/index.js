require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const cookieParser = require('cookie-parser');
const session = require('express-session');
const connection = require("./db");
const userRoutes = require("./routes/users");
const authRoutes = require("./routes/auth");
const findUserRoutes = require("./routes/findUser");
const getUsersRoutes = require("./routes/getUsers");
const deleteUserRoutes = require("./routes/deleteUser");
const uploadRoutes = require("./routes/upload");
const findUploadsRoutes = require("./routes/findUploads");
const deletepdfRoutes = require("./routes/deletepdf");
const assignRoutes = require("./routes/assign");
const getstutasksRoutes = require("./routes/getstutasks");
const pdfrenderRoutes = require("./routes/pdfrender");

// database connection
connection();

app.set('trust proxy', 1);

// middlewares
app.use(express.json());
app.use(cors());
app.use(cookieParser());
// app.use(session({
//   cookie: {maxAge: null,
//   secure: false,
// }
// }));

// routes
app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/findUser", findUserRoutes);
app.use("/api/getUsers", getUsersRoutes);
app.use("/api/deleteUser", deleteUserRoutes);
app.use("/api/upload",uploadRoutes);
app.use("/api/findUploads", findUploadsRoutes);
app.use("/api/deletepdf", deletepdfRoutes);
app.use("/api/assign", assignRoutes);
app.use("/api/getstutasks", getstutasksRoutes);
app.use("/api/renderpdf", pdfrenderRoutes);

// Health check endpoint 
app.get("/api/health", (req, res) => { res.status(200).json({ status: "ok", message: "Backend is alive!" }); });

const port = process.env.PORT || 8080;
app.listen(port, console.log(`Listening on port ${port}...`));

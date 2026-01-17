import { useEffect } from "react";
import { Route, Routes, Navigate } from "react-router-dom";
import Main from "./components/Main";
import Signup from "./components/Signup";
import Login from "./components/Login";

function ProtectedRoute({ children }) {
  const user = localStorage.getItem("token");
  return user ? children : <Navigate to="/login" replace />;
}

function App() {

  useEffect(() => { 
    // Ping backend on app load 
    const pingBackend = async () => { 
      try { 
        await fetch("https://academical-fh52.onrender.com/api/health", { method: "GET", }); 
        console.log("Backend pinged successfully"); 
      } catch (err) { 
        console.error("Backend ping failed:", err); 
      }
    };
    pingBackend();
   }, []);

  return (
    <Routes>
      <Route path="/signup" element={<Signup />} />
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<Navigate replace to="/login" />} />

      {/* Protect dashboard */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Main />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;
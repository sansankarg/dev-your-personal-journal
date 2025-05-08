import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../ContextComponents/AuthContext";
import { useNavigate } from 'react-router-dom';
import './Login.css';
import { authService, FileService } from "../services/apiServices";
import { useStatus } from "../ContextComponents/StatusContext";
const Login = ({ onClose }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const { setIsAuthenticated, isAuthenticated , setShowLoginModal, setUserdetails } = useAuth();
  const {status, setStatus} = useStatus();
  const navigate = useNavigate();

  useEffect(() => {
    console.log(isAuthenticated);
  }, [isAuthenticated]);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await authService.login(email, password);

      if (response.data.message === "Login Successful") {
        setMessage("Login Successful!");
        const response = await authService.login(email, password)
        const user = response.data.user;
        setIsAuthenticated(true)
        setUserdetails(user);
        const files = await FileService.getFiles(user._id);
        console.log("GOT : ", files.data);
        console.log("GOT : ", user);
        // setTimeout(
        //   () => navigate(`/${files.data[files.data.length - 1].fileName}`),
        //   0
        // );
        setStatus('online');
        setShowLoginModal(false);
      } else {
        setMessage(response.data.message);
      }
    } catch (error) {
      console.error("Error during login:", error);
      setMessage("Invalid credentials");
    }
  };

  return (<>
      <div className="login-modal-overlay" onClick={()=> setShowLoginModal(false)}/>
 
      <div className="login-card">
      
        
        <div className="form-container">
          <h2>Login</h2>
          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label htmlFor="email">Email:</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="password">Password:</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <button type="submit">Login</button>
          </form>
          {message && <p className="message">{message}</p>}
        </div>
    </div></>
  );
};

export default Login;

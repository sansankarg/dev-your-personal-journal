import { Navigate, useNavigate } from "react-router-dom";
import React, { createContext, useState, useEffect, useContext } from "react";
import axios from "axios";
import { authService } from "../services/apiServices";
import { useStatus } from "./StatusContext";

const getBackendUrl = () => {
  const isMobile = window.innerWidth < 768;
  return isMobile
    ? import.meta.env.VITE_LOCAL_BACKEND_URL
    : import.meta.env.VITE_NETWORK_BACKEND_URL;
};

const BACKEND_URL = getBackendUrl();
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [user, setUserdetails] = useState({});
  const [folderName, setFolderName] = useState({});
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showSignupModal, setShowSignupModal] = useState(false);
  const navigate = useNavigate();
  const {status, setStatus} = useStatus()

  useEffect(() => {
    const checkAuthentication = async () => {
      if (status === 'offline') {
        try {
          const folderName = await authService.getFolder();
          console.log("Folder path : ",folderName)
          if(folderName == null) {
            setIsAuthenticated(false);
          }else {
            setIsAuthenticated(true)
          }
          setFolderName(folderName);
        } catch (err) {
          console.error("Failed to get folder name:", err);
        }
      // } else {
      //   try {
      //     const response = await authService.check()
      //     setIsAuthenticated(response.data.isAuthenticated);
      //     setUserdetails(response.data.user);
      //     alert("Use : ",response.data.user._id)
      //   } catch (err) {
      //     console.error("Auth check failed:", err);
      //     setIsAuthenticated(false);
      //   }
      }
    };
  
    checkAuthentication();
  }, [status]);
  

  const logout = async () => {
    try {
      const response = await authService.logout();
      if (response.data.message === "Logout Successful") {
        setStatus('offline')
        setUserdetails(null);
        window.location.reload();

      }
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      isAuthenticated,
      setIsAuthenticated,
      user,
      setUserdetails,
      logout,
      folderName,
      showLoginModal,
      showSignupModal,
      setShowLoginModal,
      setShowSignupModal
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

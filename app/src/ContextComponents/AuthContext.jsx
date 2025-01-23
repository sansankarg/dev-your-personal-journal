import { Navigate, useNavigate } from "react-router-dom";
import React, { createContext, useState, useEffect, useContext } from "react";
import axios from "axios";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [user,setUserdetails]=useState({})
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get("http://localhost:5000/checkauth", { withCredentials: true })
      .then((response) => {
        setIsAuthenticated(response.data.isAuthenticated)
        setUserdetails(response.data.user)
        console.log(response.data.user)
      })
      .catch(() => setIsAuthenticated(false));
  }, []);

  const logout = async () => {
    try {
      const response = await axios.get("http://localhost:5000/logout", {
        withCredentials: true,
      });
      if (response.data.message === "Logout Successful") {
        setIsAuthenticated(false);
        navigate('/login')
      }
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, logout, user}}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

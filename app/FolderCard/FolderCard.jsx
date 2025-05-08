import { useState, useEffect } from "react";
import { useAuth } from "../src/ContextComponents/AuthContext";
import { useStatus } from "../src/ContextComponents/StatusContext";
import "./FolderCard.css";
import { useNavigate } from "react-router-dom";
import { FileService, ElectronFileService, authService } from "../src/services/apiServices";


const FolderCard = () => {
  // contexts
  const { status, setStatus } = useStatus();
  const {user, isAuthenticated, setShowSignupModal, setShowLoginModal, logout } = useAuth();
  
  // data
  const [folderPath, setFolderPath] = useState("");

  // Routing
  const navigate = useNavigate();

  //Folder api
  const handleChooseFolder = async () => {
    const path = await window.markdownAPI.selectFolder();
    if (path) setFolderPath(path);
    window.location.reload();
  };

  //Path fetcher
  useEffect(() => {
    const getInitialPath = async () => {
      if (status === "offline") {
        const savedPath = await window.markdownAPI.getRootPath();
        if (savedPath) setFolderPath(savedPath);
      }
    };
    getInitialPath();
  }, [status]);

  //status toggler and handle the landing file as the latest one
  const toggleStatus = async () => {
    const isAuth = await authService.check();
    if (status === "online") {
      const files = await ElectronFileService.getFiles();
      setTimeout(() => navigate(`/${files[files.length - 1].fileName}`), 0);
    } else {
      if(isAuth.data.isAuthenticated){
        const response = await authService.check()
        const user = response.data.user;
        const files = await FileService.getFiles(user._id);
        setTimeout(
          () => navigate(`/${files.data[files.data.length - 1].fileName}`),
          0
        );
    }
    }
    setStatus(status === "online" ? "offline" : "online");
  };

  return (
    <div className="card">
      <div className="header">
        <h2>Haven</h2>
        <button
          onClick={toggleStatus}
          className="toggle"
          aria-label="Switch vault mode"
        >
          <span className="toggle-text">
            Switch to {status === "online" ? "Offline" : "Online"}
          </span>
        </button>
      </div>

      <div className="status-indicator">
        <span className={`status-dot ${status}`}></span>
        {status === "online" ? "Online Storage" : "Local Storage"}
      </div>

      {status === "offline" ? (
        <div className="offline-content">
          <button onClick={handleChooseFolder} className="button">
            {folderPath ? "Change to existing haven" : "Create a new haven"}
          </button>
          {folderPath && (
            <p className="path">
              <span className="path-label">Haven location: <code className="path-value">{folderPath}</code></span>
              
            </p>
          )}
        </div>
      ) : (
        user ? (
          <>
            <button
              onClick={() => setShowLoginModal(true)}
              className="button auth-button"
            >
              Secure haven
            </button>
            <button
              onClick={() => setShowSignupModal(true)}
              className="button auth-button"
            >
              Create haven
            </button>
          </>
        ) : 
        <>
            <button
              onClick={logout}
              className="button auth-button"
            >
              log out
            </button>
        </>
      )}
    </div>
  );
};

export default FolderCard;
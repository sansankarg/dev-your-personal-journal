import "./NavBar.css";
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../ContextComponents/AuthContext";
import { useStatus } from "../ContextComponents/StatusContext";
import { FileService, ElectronFileService } from "../services/apiServices";
import FolderCard from "../../FolderCard/FolderCard";

const NavBar = ({ handleShowTemplate, handleBookMark, handleFiles}) => {
  
  //Routing
  const navigate = useNavigate();

  //Suggestions data
  const [suggestions, setSuggestions] = useState([]);

  //Selected index in suggestions
  const [selectedWordIndex, setSelectedWordIndex] = useState(null);
  
  //Query from input for search and synapse
  const [searchQuery, setSearchQuery] = useState("");
  const [searchSynapseQuery, setSearchSynapseQuery] = useState("");
  
  // Context
  const { isAuthenticated, folderName, logout, user, } = useAuth();
  const { status } = useStatus();

  //UI
  const suggestionsRef = useRef(null);
  const [folderCard, setFolderCard] = useState(false);
  const [toggle, setToggle] = useState(true);

  // Theme toggler
  const toggleTheme = () => {
    const html = document.documentElement;
    const currentTheme = html.getAttribute("data-theme");
    const newTheme = currentTheme === "dark" ? "light" : "dark";
    html.setAttribute("data-theme", newTheme);
    localStorage.setItem("theme", newTheme);
  };

  // To initialize theme
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "light";
    document.documentElement.setAttribute("data-theme", savedTheme);
  }, []);

  // redirect to the file
  const goToFile = (id) => {
    navigate(`/${id}`);
  };

  // Name search logic
  function findFilesByFileName(files, word) {
    if (!word || word.trim() === "") return [];

    const matches = [];

    files.forEach((file) => {
      if (
        file.fileName &&
        file.fileName.toLowerCase().includes(word.toLowerCase())
      ) {
        matches.push({
          fileName: file.fileName,
          matchedFileName: file.fileName,
        });
      }
    });

    return matches;
  }

  useEffect(() => {
    const loadData = async () => {
      const files =
        status === "online"
          ? user && await FileService.getFiles(user._id)
          : await ElectronFileService.getFiles();
      setSuggestions(
        findFilesByFileName(
          status === "online" ? files.data : files,
          searchQuery
        )
      );
    };
    loadData();
  }, [status, user?._id, searchQuery]);

  useEffect(() => { console.log(isAuthenticated)})
  //Synapse search logic
  function findFilesBySynapse(files, word) {
    const matches = [];

    files.forEach((file) => {
      if (!word || word.trim() === "") return [];
      if (!Array.isArray(file.synapses)) return;

      file.synapses.forEach((syn) => {
        if (syn.toLowerCase().includes(word.toLowerCase())) {
          matches.push({
            fileName: file.fileName,
            matchedSynapse: syn,
          });
        }
      });
    });
    return matches;
  }

  useEffect(() => {
    const fetchFiles = async () => {
      const files =
        status === "online"
          ? await FileService.getFiles(user._id)
          : await ElectronFileService.getFiles();
      setSuggestions(
        findFilesBySynapse(
          status === "online" ? files.data : files,
          searchSynapseQuery
        )
      );
    };

    fetchFiles();
  }, [searchSynapseQuery, user?._id]);

  //Event handlers
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };
  const handleSearchSynapseChange = (e) => {
    setSearchSynapseQuery(e.target.value);
  };
  const handleKeyDownFilesSuggetions = (event) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setSelectedWordIndex((prevIndex) =>
        prevIndex === null ? 0 : Math.min(suggestions.length - 1, prevIndex + 1)
      );
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setSelectedWordIndex((prevIndex) =>
        prevIndex === null ? 0 : Math.max(0, prevIndex - 1)
      );
    } else if (event.key === "Enter" && selectedWordIndex !== null) {
      event.preventDefault();
      setSearchQuery(suggestions[selectedWordIndex].fileName);
      setSuggestions([]);
      setSelectedWordIndex(null);
      setToggle(true);
      setSearchQuery("");
      setSearchSynapseQuery("");
      goToFile(suggestions[selectedWordIndex].fileName);
    }
  };
  useEffect(() => {
    if (suggestionsRef.current && selectedWordIndex !== null) {
      const selectedSearchItem =
        suggestionsRef.current.children[selectedWordIndex];
      if (selectedSearchItem) {
        selectedSearchItem.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
        });
      }
    }
  }, [selectedWordIndex, suggestions]);

  const highlightText = (text, query) => {
    if (!query.trim()) {
      return text;
    }
    function escapeRegExp(string) {
      return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    }
    const escapedQuery = escapeRegExp(query);
    const regex = new RegExp(`(${escapedQuery})`, "gi");
    const parts = text.split(regex);

    return parts.map((part, index) => {
      if (index % 2 === 1) {
        return (
          <span key={index} className="highlight">
            {part}
          </span>
        );
      } else {
        return part;
      }
    });
  };

  return (
    <div className="navComplete">
      {toggle ? (
        <>
          {suggestions.length > 0 && (
            <div
              className="navbar-overlay"
              onClick={() => {
                setToggle(true);
                setSuggestions([]);
                setSearchQuery("");
              }}
            />
          )}
          {searchQuery.length >= 1 && suggestions.length > 0 && (
            <div className="navbar-suggestions">
              <h1>{searchQuery}</h1>
              <ul className="navbar-suggestions-list" ref={suggestionsRef}>
                {suggestions.map((file, index) => (
                  <li
                    key={file._id}
                    className={`navbar-suggestion-item ${
                      index === selectedWordIndex ? "selected" : ""
                    }`}
                    onClick={() => {
                      setSuggestions([]);
                      setSelectedWordIndex(null);
                      goToFile(file.fileName);
                      setSearchQuery("");
                    }}
                    onMouseEnter={() => setSelectedWordIndex(index)}
                  >
                    {highlightText(file.fileName, searchQuery)}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      ) : (
        <>
          {searchSynapseQuery.length >= 1 && (
            <>
              <div
                className="navbar-overlay"
                onClick={() => {
                  setToggle(true);
                  setSuggestions([]);
                  setSearchSynapseQuery("");
                }}
              />
              <div className="navbar-suggestions">
                <h1>{searchSynapseQuery}</h1>
                {suggestions.length > 0 ? (
                  <ul className="navbar-suggestions-list" ref={suggestionsRef}>
                    {suggestions.map((file, index) => (
                      <li
                        key={file._id}
                        className={`navbar-suggestion-item ${
                          index === selectedWordIndex ? "selected" : ""
                        }`}
                        onClick={() => {
                          setSuggestions([]);
                          setSelectedWordIndex(null);
                          goToFile(file.fileName);
                          setToggle(true);
                          setSearchSynapseQuery("");
                        }}
                        onMouseEnter={() => setSelectedWordIndex(index)}
                      >
                        {file.fileName} -{" "}
                        {highlightText(file.matchedSynapse, searchSynapseQuery)}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>No files available with this synapse</p>
                )}
              </div>
            </>
          )}
        </>
      )}
      {folderCard && (
        <>
          <div
            className="navbar-overlay"
            onClick={() => {
              setToggle(true);
              setFolderCard(false);
            }}
          />
          <div className="folder-card-wrapper">
            <FolderCard />
          </div>
        </>
      )}

      <nav className="navbar navbar-expand-lg">
        <div className="container-fluid">
          <ul className="navbar-nav me-auto">
            <li className="nav-item">
              <button className="nav-link" onClick={handleFiles}>
                <span className="material-icons">folder</span>
              </button>
            </li>
            <li className="nav-item">
              <button className="nav-link" onClick={handleShowTemplate}>
                <span className="material-icons">post_add</span>
              </button>
            </li>
            <li className="nav-item">
              <button className="nav-link" onClick={handleBookMark}>
                <span className="material-icons">bookmarks</span>
              </button>
            </li>
            <li className="nav-item">
              <button className="nav-link" onClick={toggleTheme}>
                <span className="material-icons">dark_mode</span>
              </button>
            </li>
          </ul>
          <input
            type="text"
            className="form-control search-input"
            placeholder="Search"
            onKeyDown={handleKeyDownFilesSuggetions}
            value={searchQuery}
            onClick={() => setToggle(true)}
            onChange={handleSearchChange}
          />
          <input
            type="text"
            className="form-control synapse-input"
            placeholder="Synapse search"
            onKeyDown={handleKeyDownFilesSuggetions}
            onClick={() => setToggle(false)}
            value={searchSynapseQuery}
            onChange={handleSearchSynapseChange}
          />

          <span className="navbar-brand mx-auto custom-text-color haven">
            {typeof (status === "online" ? user?.haven : folderName) ===
            "object"
              ? "Loading..."
              : `${
                  status === "online" ? user?.haven || folderName : folderName
                }    `}
            
          </span>

          <div className="navbar-nav ms-auto">
            <>
              {" "}
              <li className="addo material-icons">
                <button
                  onClick={() => setFolderCard((prev) => !prev)}
                  className="nav-link"
                >
                  <span className="material-icons">{folderCard ?  "close" :status==='online' ? 'cloud_done': 'cloud_off'}</span>
                </button>
              </li>
              {/* <li><span className={`status-dot ${status}`}></span></li> */}
              <li className="addo material-icons">
                <button
                  onClick={()=>window.markdownAPI.minimize()}
                  className="nav-link"
                >
                  <span className="material-icons">minimize</span>
                </button>
              </li>
              <li className="addo material-icons">
                <button
                  onClick={()=>window.markdownAPI.maximize()}
                  className="nav-link"
                >
                  <span className="material-icons">open_in_full</span>
                </button>
              </li>
              <li className="addo material-icons">
                <button
                  onClick={()=>window.markdownAPI.close()}
                  className="nav-link"
                >
                  <span className="material-icons">close</span>
                </button>
              </li>
            </>
          </div>
        </div>
      </nav>
    </div>
  );
};

export default NavBar;

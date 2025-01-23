import './NavBar.css';
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from "../ContextComponents/AuthContext";
import Signup from '../signup/Signup';

const NavBar = ({ handleShowTemplate, handleBookMark, handleFiles, toggleSignup, toggleLogin }) => {
  const navigate = useNavigate();
  const [files, setFiles] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [synapseSuggestions, setSynapseSuggestions] = useState([]);
  const [selectedWordIndex, setSelectedWordIndex] = useState(null);
  const [selectedSynapseIndex, setSelectedSynapseIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchSynapseQuery, setSearchSynapseQuery] = useState('');
  const {isAuthenticated, logout, user} = useAuth();
  const suggestionsRef = useRef(null);

  const [toggle, setToggle] = useState(true);
    const goToFile = (id) => {
      navigate(`/${id}`);
    };
    
    const handleSearchChange = (e) => {
      fileNameSuggestions(e.target.value)
      setSearchQuery(e.target.value);
    };
    const handleSearchSynapseChange = (e) => {
      setSearchSynapseQuery(e.target.value);
    };

  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const response = await axios.post('http://localhost:5000/get-markdown-to-link', {userId : user._id});
        console.log(user._id);
        setFiles(response.data);
      } catch (error) {
        console.error('Error fetching files:', error);
      }
    };

    fetchFiles();
  }, [searchQuery]);

  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const response = await axios.post('http://localhost:5000/search-by-synapse', {
          synapseWord: searchSynapseQuery  // The word you're searching in the 'synapses' array
        });
        console.log('Files found:', response.data);
        setSuggestions(response.data)
      } catch (error) {
        setSuggestions({})
        console.error('Error fetching files:', error);
      }
    };

    fetchFiles();
  }, [searchSynapseQuery]);
  
    const fileNameSuggestions = (currentWord) => {
      if (!currentWord) {
        setSuggestions([]);
        return;
      }
      const filtered = files.filter(file =>
        file.fileName.toLowerCase().includes(currentWord.toLowerCase())
      );
      setSuggestions(filtered);
      console.log("Suggetions : ",suggestions)
    };

    const handleKeyDownFilesSuggetions = (event) => {
      if (event.key === 'ArrowDown') {
        event.preventDefault();
        setSelectedWordIndex((prevIndex) => (prevIndex === null ? 0 : Math.min(suggestions.length - 1, prevIndex + 1)));
      } else if (event.key === 'ArrowUp') {
        event.preventDefault();
        setSelectedWordIndex((prevIndex) => (prevIndex === null ? 0 : Math.max(0, prevIndex - 1)));
      } else if (event.key === 'Enter' && selectedWordIndex !== null) {
        event.preventDefault();
        setSearchQuery(suggestions[selectedWordIndex].fileName);
        setSuggestions([]);
        setSelectedWordIndex(null);
        setToggle(true);
        goToFile(suggestions[selectedWordIndex]._id)
        setSearchQuery("")
        setSearchSynapseQuery("")
      }
    };

    useEffect(() => {
      if (suggestionsRef.current && selectedWordIndex !== null) {
        const selectedSearchItem = suggestionsRef.current.children[selectedWordIndex];
        if (selectedSearchItem) {
          selectedSearchItem.scrollIntoView({
            behavior: 'smooth',
            block: 'nearest',
          });
        }
      }
    }, [selectedWordIndex, suggestions]);

  return (
    <div className="navComplete">
      {toggle ? (
        <>
          {suggestions.length > 0 && <div className="templateX-overlay" onClick={() => {
              setToggle(true);
              setSuggestions([]);
              setSearchQuery("");
            }}/>}
          {searchQuery.length >= 1 && suggestions.length > 0 && (
            <div className="template-suggestions">
              <h1>{searchQuery}</h1>
              <ul className="templateXX-suggestions" ref={suggestionsRef}>
                {suggestions.map((file, index) => (
                  <li
                    key={file._id}
                    className={`templateX-suggestion-item ${index === selectedWordIndex ? 'selected' : ''}`}
                    onClick={() => {
                      setSuggestions([]);
                      setSelectedWordIndex(null); 
                      goToFile(file._id);
                      setSearchQuery("")
                    }}
                    onMouseEnter={() => setSelectedWordIndex(index)
                
                    } 
                  >
                    {file.fileName}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      ) : <>
      {searchSynapseQuery.length >= 1 && (
        <>
          <div
            className="templateX-overlay"
            onClick={() => {
              setToggle(true);
              setSuggestions([]);
              setSearchSynapseQuery("");
            }}
          />
          <div className="template-suggestions">
            <h1>{searchSynapseQuery}</h1>
            {suggestions.length > 0 ? (
              <ul className="templateXX-suggestions" ref={suggestionsRef}>
                {suggestions.map((file, index) => (
                  <li
                    key={file._id}
                    className={`templateX-suggestion-item ${
                      index === selectedWordIndex ? 'selected' : ''
                    }`}
                    onClick={() => {
                      setSuggestions([]);
                      setSelectedWordIndex(null);
                      goToFile(file._id)
                      setToggle(true);
                      setSearchSynapseQuery("")
                    }}
                    onMouseEnter={() => setSelectedWordIndex(index)
                      
                    }
                    
                  >
                    {file.fileName} - {file.matchedSynapses[0]}
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
    }

      <nav className="navbar navbar-expand-lg bg-body-tertiary bg-primary">
        <div className="container-fluid">
          <ul className="navbar-nav me-auto">
            <li className="nav-item">
              <button className="nav-link" onClick={handleFiles}>
                <span className="material-icons">folder</span>
              </button>
            </li>
            <li className="nav-item">
              <button className="nav-link" onClick={handleShowTemplate}>
                <span className="material-icons">template</span>
              </button>
            </li>
            <li className="nav-item">
              <button className="nav-link" onClick={handleBookMark}>
                <span className="material-icons">bookmarks</span>
              </button>
            </li>
            <li className="nav-item">
              <input
                type="text"
                className="form-control search-input"
                placeholder="Search"
                onKeyDown={handleKeyDownFilesSuggetions}
                value={searchQuery}
                onClick={()=>setToggle(true)}
                onChange={handleSearchChange}
              />
            </li>
            <li className="nav-item">
              <input
                type="text"
                className="form-control synapse-input"
                placeholder="Synapse search"
                onKeyDown={handleKeyDownFilesSuggetions}
                onClick={()=>setToggle(false)}
                value={searchSynapseQuery}
                onChange={handleSearchSynapseChange}
              />
            </li>
            
          </ul>
          

          <span className="navbar-brand mx-auto custom-text-color">{user.firstName}_</span>


          <div className="navbar-nav ms-auto">
            {!isAuthenticated ? (
              <>
            <li className="nav-item">
              <button className="nav-link">
                <span onClick={toggleLogin}>login</span>
              </button>
            </li>
            <li className="nav-item">
              <button onClick={toggleSignup} className="nav-link">
                <span >sign up</span>
              </button>
            </li>
            </>
            ):(
              <li className="addo material-icons">
              <button className="nav-link" onClick={logout}>
                <span className="material-icons">logout</span>
              </button>
            </li>
            )}
          </div>
        </div>
      </nav>
    </div>
  );
};

export default NavBar;

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './TemplateX.css';

const TemplateX = () => {
  const [inputText, setInputText] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [selectedWordIndex, setSelectedWordIndex] = useState(null);
  const [files, setFiles] = useState([]);

  const handleInputChange = (event) => {
    setInputText(event.target.value);
  };

  const fileNameSuggestions = (currentWord) => {
    if (!currentWord) {
      setSuggestions([]);
      return;
    }
    const filtered = files.filter(file =>
      file.fileName.toLowerCase().includes(currentWord.toLowerCase())
    );
    setSuggestions(filtered);
  };

  const handleKeyDownFilesSuggetions = (event) => {
    if (event.key === 'ArrowDown') {
      setSelectedWordIndex((prevIndex) => (prevIndex === null ? 0 : Math.min(suggestions.length - 1, prevIndex + 1)));
    } else if (event.key === 'ArrowUp') {
      setSelectedWordIndex((prevIndex) => (prevIndex === null ? 0 : Math.max(0, prevIndex - 1)));
    } else if (event.key === 'Enter' && selectedWordIndex !== null) {
      const selectedFile = suggestions[selectedWordIndex];
      setInputText(inputText.replace(/\S+$/, selectedFile.fileName));
      setSuggestions([]);
      setSelectedWordIndex(null);
    }
  };

  useEffect(() => {
    const words = inputText.split(' ');
    const currentWord = words[words.length - 1];
    fileNameSuggestions(currentWord);
  }, [inputText]);

  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const response = await axios.get('http://localhost:5000/get-markdown-to-link');
        setFiles(response.data);
      } catch (error) {
        console.error('Error fetching files:', error);
      }
    };

    fetchFiles();
  }, []);


  return (
    <div className="templateX-container">
      {suggestions.length > 0 && <div className="templateX-overlay" />}
      <div className="templateX-content">
        <h1 className="templateX-header">Word Suggestions for TemplateX</h1>
        <textarea
          value={inputText}
          onChange={handleInputChange}
          onKeyDown={handleKeyDownFilesSuggetions}
          placeholder="Start typing here..."
          rows="6"
          cols="50"
          className="templateX-textarea"
        />
        {suggestions.length > 0 && (
          <ul className="templateX-suggestions">
            {suggestions.map((file, index) => (
              <li
                key={file._id}
                className={`templateX-suggestion-item ${index === selectedWordIndex ? 'selected' : ''}`}
                onClick={() => {
                  setInputText(inputText.replace(/\S+$/, file.fileName));
                  setSuggestions([]);
                  setSelectedWordIndex(null);
                }}
                onMouseEnter={() => setSelectedWordIndex(index)}
              >
                {file.fileName}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default TemplateX;

import React, { useState, useRef, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { marked } from 'marked';
import axios from 'axios';
import './Template.css';
import { debounce } from 'lodash';
import { useAuth } from "../ContextComponents/AuthContext";

const Template = ({ fileData, onFileNameChange }) => {
  const [markdownText, setMarkdownText] = useState('');
  const [fileName, setFileName] = useState('');
  const [saving, setSaving] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const textareaRef = useRef(null);
  const [selectedWordIndex, setSelectedWordIndex] = useState(null);
  const [startIndex, setStartIndex] = useState()
  const [fileSuggestion, setFileSuggestion] = useState(false);
  const [files, setFiles] = useState([]);
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [editableToggle, setEditableToggle] = useState(false);
  const {user} = useAuth();

  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const response = await axios.post('http://localhost:5000/get-markdown-to-link',{userId : user._id});
        setFiles(response.data);
      } catch (error) {
        console.error('Error fetching files:', error);
      }
    };

    fetchFiles();
  }, [markdownText]);

  const parseCustomSyntax = (html) => {
    const synapseRegex = /(\^\^([^\^]+)\^\^)/g;
    html = html.replace(synapseRegex, (match, p1, p2) => {
      return `<span class="custom-syntax">${p2}</span>`;
    });

    const linkRegex = /\[\[([^\]]+)\]\]::\(([^)]+)\)/g;
    html = html.replace(linkRegex, (match, p1, p2) => {
      return `<a href="${p2}" class="custom-link">${p1}</a>`;
    });



    const checkboxRegex = /\[([ xX])\]/g;
    html = html.replace(checkboxRegex, (match, p1) => {
      const isChecked = p1.trim().toLowerCase() === 'x';
      return `<input type="checkbox" ${isChecked ? 'checked' : ''} disabled class="custom-checkbox" />`;
    });

    return html;
  };

  const extractSynapseWords = (content) => {
    const synapseRegex = /\^\^([^\^]+)\^\^/g;
    let match;
    const words = [];

    while ((match = synapseRegex.exec(content)) !== null) {
      words.push(match[1]);
    }

    return words;
  };

  const handleKeyDown = (event) => {
    const text = markdownText;
    const cursorPosition = textareaRef.current.selectionStart;

    let startOfWord = cursorPosition - 1;
    while (startOfWord >= 0 && /\S/.test(text[startOfWord])) {
      startOfWord--;
    }

    const currentWord = text.slice(startOfWord + 1, cursorPosition).trim();

    if (!currentWord) return;

    if (event.altKey && event.shiftKey) {
      event.preventDefault();

      if (currentWord.startsWith('[[') && currentWord.endsWith(']]')) {
        return;
      }

      if (currentWord.startsWith('^^') && currentWord.endsWith('^^')) {
        const cleanWord = currentWord.slice(2, -2);
        const newText = text.slice(0, startOfWord + 1) + cleanWord + text.slice(cursorPosition);
        setMarkdownText(newText);
        setTimeout(() => {
          const textarea = textareaRef.current;
          textarea.setSelectionRange(startOfWord + 1 + cleanWord.length, startOfWord + 1 + cleanWord.length);
          textarea.focus();
        }, 0);
      } else {
        const newText = text.slice(0, startOfWord + 1) + `^^${currentWord}^^` + text.slice(cursorPosition);
        setMarkdownText(newText);
        setTimeout(() => {
          const textarea = textareaRef.current;
          textarea.setSelectionRange(startOfWord + 1 + `^^${currentWord}^^`.length, startOfWord + 1 + `^^${currentWord}^^`.length);
          textarea.focus();
        }, 0);
      }
    } else if (event.ctrlKey && event.shiftKey && event.key === 'S') {
      event.preventDefault();
      if (currentWord.startsWith('^^') && currentWord.endsWith('^^')) {
        return;
      }

      if (currentWord.startsWith('[[') && currentWord.endsWith(']]')) {
        const cleanWord = currentWord.slice(2, -2);
        const newText = text.slice(0, startOfWord + 1) + cleanWord + text.slice(cursorPosition);
        setMarkdownText(newText);
        setTimeout(() => {
          const textarea = textareaRef.current;
          textarea.setSelectionRange(startOfWord + 1 + cleanWord.length, startOfWord + 1 + cleanWord.length);
          textarea.focus();
        }, 0);
      } else {
        const newText = text.slice(0, startOfWord + 1) + `[[${currentWord}]]()` + text.slice(cursorPosition);
        setMarkdownText(newText);
        setTimeout(() => {
          const textarea = textareaRef.current;
          const cursorPos = startOfWord + 1 + `[[${currentWord}]]()`.length - 1;  // Position cursor between ()
          textarea.setSelectionRange(cursorPos, cursorPos);
          setStartIndex(cursorPos)
          setFileSuggestion(true)
          textarea.focus();
          console.log(currentWord);
        }, 0);
      }
    }
  };

  useEffect(() => {
    if(fileSuggestion) {
      const endIndex = markdownText.indexOf(')', startIndex);
      const currentWord = markdownText.slice(startIndex, endIndex);
      console.log("Link suggestion : ",currentWord)
      fileNameSuggestions(currentWord);
    }
    },[markdownText]);

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
      const selectedFile = suggestions[selectedWordIndex]._id;
      const endIndex = markdownText.indexOf(')', startIndex);
      setMarkdownText(markdownText.slice(0, startIndex) + selectedFile + markdownText.slice(endIndex));
      setSuggestions([]);
      setFileSuggestion(false);
      setSelectedWordIndex(null);
    }
  };



  const getMarkdownPreview = () => {
    const markdownHtml = marked(markdownText);
    const finalHtml = parseCustomSyntax(markdownHtml);
    return { __html: finalHtml };
  };

  const handleSave = async () => {
    setSaving(true);

    try {
      const extractedSynapses = extractSynapseWords(markdownText);
      if (fileData && fileData._id) {
        const response = await axios.put(`http://localhost:5000/update-markdown/${fileData._id}`, {
          content: markdownText,
          fileName: fileName,
          synapses: extractedSynapses,
          userId : user._id
        },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        });
        console.log("synapses : ",extractedSynapses);
        if (response.data.message === 'File saved successfully') {
          // console.log("id : ", fileData._id);
          // console.log("fileName : ", fileName);
          // console.log("synapses : ", extractedSynapses);
          // console.log('File saved successfully');
        } else {
          // console.error('Failed to save file');
        }
      } else {
        const response = await axios.post('http://localhost:5000/save-markdown', {
          fileName: fileName.trim(),
          content: markdownText,
          synapses: extractedSynapses
        });

        if (response.data.message === 'File created successfully') {
          console.log('File created successfully');
        } else {
          console.error('Failed to create file');
        }
      }
    } catch (error) {
      console.error('Error saving markdown file', error);
    } finally {
      setSaving(false);
    }
  };

  const debouncedSave = debounce(() => {
    handleSave();
  }, 1000);

  useEffect(() => {
    if (fileData) {
      setMarkdownText(fileData.content);
      setFileName(fileData.fileName);
    }
  }, [fileData]);

  const handleChange = (e) => {
    setMarkdownText(e.target.value);
    debouncedSave();
  };

  const handleTitleChange = (e) => {
    const updatedFileName = e.target.value;
    onFileNameChange(updatedFileName);
    setFileName(updatedFileName);
    debouncedSave();
  };

  useEffect(() => {
    if (markdownText && fileName) {
      debouncedSave();
    }
  }, [markdownText, fileName]);

  

  return (
    <div className="template-container">
      {suggestions.length > 0 && <div className="templateX-overlay" />}
      {suggestions.length > 0 && (
          <ul className="templateX-suggestions">
            {suggestions.map((file, index) => (
              <li
                key={file._id}
                className={`templateX-suggestion-item ${index === selectedWordIndex ? 'selected' : ''}`}
                onClick={() => {
                  setFileSuggestion(false);
                  setMarkdownText(markdownText.slice(0, startIndex) + file.fileName + markdownText.slice(startIndex));
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

      
      <div className="header">
        <div className='title'>
          <h3>{fileName} file</h3>
          {editableToggle && (
            <p className="save-status ms-2">
              <span className="material-icons">
                {saving ? 'hourglass_empty' : 'check_circle'}
              </span>
            </p>
          )}
        </div>
        <button
          className="icon-button"
          onClick={() => setEditableToggle(!editableToggle)}
          title={editableToggle ? 'Switch to Read Mode' : 'Switch to Edit Mode'}
        >
          <span className="material-icons">
            {editableToggle ? 'visibility' : 'edit'}
          </span>
        </button>
      </div>

      {editableToggle && (
        <div className='section'>
          <div className="editor-section">
            <input
              type="text"
              placeholder="Enter file name"
              value={fileName}
              onChange={handleTitleChange}
              className="file-name-input"
            />
            <textarea
              ref={textareaRef}
              value={markdownText}
              onChange={handleChange}
              onKeyDown={(e)=> {if(suggestions.length > 0){handleKeyDownFilesSuggetions(e)}else {handleKeyDown(e)}}}
              className="markdown-textarea"
            />
          </div>
          <div className="preview-section">
            <div
              dangerouslySetInnerHTML={getMarkdownPreview()}
              className="markdown-preview"
            />
          </div>
        </div>
      )}

      {!editableToggle && (
        <div className="preview-section1">
          <div
            dangerouslySetInnerHTML={getMarkdownPreview()}
            className="markdown-preview"
          />
        </div>
      )}
    </div>
  );
};

export default Template;

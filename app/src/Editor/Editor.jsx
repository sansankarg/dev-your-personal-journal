import { useState, useRef, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { marked } from "marked";
import "./Editor.css";
import { useNavigate } from "react-router-dom";
import { debounce } from "lodash";
import { useAuth } from "../ContextComponents/AuthContext";
import {
  FileService,
  TemplateService,
  ElectronFileService,
  electronTemplateService,
} from "../services/apiServices";
import { useStatus } from "../ContextComponents/StatusContext";
import { Link } from "react-router-dom";

const Editor = ({ allFiles, fileData, reload, onFileNameChange }) => {
  // Content State
  const [markdownText, setMarkdownText] = useState("");
  const [fileName, setFileName] = useState("");
  const [oldFileName, setOldFileName] = useState("");
  const [linkFiles, setLinkFiles] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [templateName, setTemplateName] = useState("");
  const [selectedIcon, setSelectedIcon] = useState("");
  const [bookmark, setBookmark] = useState(false);
  const icons = [
    "home",
    "search",
    "settings",
    "email",
    "star",
    "phone",
    "person",
    "info",
    "notifications",
    "add",
    "delete",
    "archive",
    "thumb_up",
    "favorite",
    "chat",
  ];
  const handleIconClick = (icon) => {
    setSelectedIcon(icon);
  };

  // Textarea & Cursor
  const textareaRef = useRef(null);
  const [startIndex, setStartIndex] = useState();
  const [selectedLinkSuggestionIndex, setselectedLinkSuggestionIndex] =
    useState(null);

  // UI Control states
  const [editableToggle, setEditableToggle] = useState(false);
  const [fileSuggestion, setFileSuggestion] = useState(false);
  const [saving, setSaving] = useState(false);
  const [addTemplateToggle, setAddTemplateToggle] = useState(false);
  const [dataStatus, setDataStatus] = useState(true);
  const [loading, setLoading] = useState(true);
  const [editorWidth, setEditorWidth] = useState(50);

  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 3000);
  }, []);

  // User Context
  const { isAuthenticated, user } = useAuth();
  const { status } = useStatus();

  // Initialize from filedata
  useEffect(() => {
    if (fileData) {
      setDataStatus(false);
      setMarkdownText(fileData.content);
      setFileName(fileData.fileName);
      setOldFileName(fileData.fileName);
      setBookmark(fileData.bookmark);
    } else {
      setDataStatus(true);
    }
  }, [fileData]);

  // File fetching for Link
  useEffect(() => {
    const fetchFiles = async () => {
      setLinkFiles(allFiles);
    };

    fetchFiles();
  }, [markdownText]);

  // Set suggestion for link
  useEffect(() => {
    if (fileSuggestion) {
      const endIndex = markdownText.indexOf(")", startIndex);
      const currentWord = markdownText.slice(startIndex, endIndex);

      console.log("Link suggestion:", currentWord);

      if (!currentWord) {
        setSuggestions([]);
      } else {
        const filtered = linkFiles.filter((file) =>
          file.fileName.toLowerCase().includes(currentWord.toLowerCase())
        );
        setSuggestions(filtered);
        console.log("Suggestions:", filtered);
      }
    }
  }, [markdownText, fileSuggestion, startIndex, linkFiles]);

  // Saving sync
  const saveChanges = debounce(async () => {
    setSaving(true);
    try {
      const extractedSynapses = Array.from(
        markdownText.matchAll(/\^\^([^\^]+)\^\^/g),
        (m) => m[1]
      );
      console.log("DUde : ",user)
      if (status === "online") {
          await FileService.updateFile(
            fileData.fileName,
            markdownText,
            fileName,
            extractedSynapses,
            user._id
          );
      } else {
        await ElectronFileService.updateFile(
          fileName,
          markdownText,
          extractedSynapses
        );
      }
    } catch (error) {
      console.error("Error saving markdown file", error);
    } finally {
      setSaving(false);
    }
  }, 1000);
  useEffect(() => {
    if (markdownText || fileName) {
      saveChanges();
    }

    return () => {
      saveChanges.cancel?.();
    };
  }, [markdownText, fileName, fileData, user]);

  const renameFileName = async () => {
    if (fileName && oldFileName && fileName !== oldFileName) {
      try {
        const response = await window.markdownAPI.renameFile(
          oldFileName,
          fileName
        );
        if (response.success) {
          setOldFileName(fileName);
          await setTimeout(() => navigate(`/${fileName}`), 0);
          reload();
        } else {
          console.error("Error renaming file:", response.error);
        }
      } catch (error) {
        console.error("Error calling rename API:", error);
      }
    }
  };

  // Preview generation
  const getMarkdownPreview = () => {
    const parseCustomSyntax = (html) => {
      const synapseRegex = /(\^\^([^\^]+)\^\^)/g;
      html = html.replace(synapseRegex, (match, p1, p2) => {
        return `<span class="custom-syntax">${p2}</span>`;
      });
      const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
      html = html.replace(linkRegex, (match, text, url) => {
        return `<a href="${encodeURIComponent(
          url
        )}" class="custom-link">${text}</a>`;
      });
      const checkboxRegex = /\[([ xX])\]/g;
      html = html.replace(checkboxRegex, (match, p1) => {
        const isChecked = p1.trim().toLowerCase() === "x";
        return `<input type="checkbox" ${
          isChecked ? "checked" : ""
        } disabled class="custom-checkbox" />`;
      });

      return html;
    };
    const markdownHtml = marked(markdownText);
    const finalHtml = parseCustomSyntax(markdownHtml);
    return { __html: finalHtml };
  };

  // Keyboard handlers
  const handleKeyDown = (event) => {
    // For shortcuts
    const text = markdownText;
    const cursorPosition = textareaRef.current.selectionStart;

    // Step 1: Find start of the current word
    let startOfWord = cursorPosition - 1;
    while (startOfWord >= 0 && /\S/.test(text[startOfWord])) {
      startOfWord--;
    }
    const currentWord = text.slice(startOfWord + 1, cursorPosition).trim();
    if (!currentWord) return;

    const textarea = textareaRef.current;

    // function to replace text and move cursor will be used after
    const updateTextAndCursor = (newText, newCursorPos, cb) => {
      setMarkdownText(newText);
      setTimeout(() => {
        textarea.setSelectionRange(newCursorPos, newCursorPos);
        textarea.focus();
        if (cb) cb();
      }, 0);
    };

    // ALT + SHIFT for synapse ^^word^^
    if (event.altKey && event.shiftKey && !event.ctrlKey) {
      event.preventDefault();

      const pattern = /\^\^(.*?)\^\^/g;
      let match;
      let found = false;

      // 2: Look for existing ^^word^^ around the cursor
      while ((match = pattern.exec(text)) !== null) {
        const matchStart = match.index;
        const matchEnd = match.index + match[0].length;
        if (cursorPosition >= matchStart && cursorPosition <= matchEnd) {
          found = true;
          const cleanWord = match[1];
          const newText =
            text.slice(0, matchStart) + cleanWord + text.slice(matchEnd);
          const newPos = matchStart + cleanWord.length;
          updateTextAndCursor(newText, newPos);
          break;
        }
      }

      // 3: If not found, wrap current word with ^^ ^^
      if (!found) {
        const wrapped = `^^${currentWord}^^`;
        const newText =
          text.slice(0, startOfWord + 1) + wrapped + text.slice(cursorPosition);
        const newPos = startOfWord + 1 + wrapped.length;
        updateTextAndCursor(newText, newPos);
      }
    }

    // CTRL + SHIFT + S for link [word]()
    else if (event.ctrlKey && event.shiftKey && event.key === "S") {
      event.preventDefault();

      const pattern = /\[(.*?)\]\(\)/g;
      let match;
      let found = false;

      // 2: Look for existing [word]() around the cursor
      while ((match = pattern.exec(text)) !== null) {
        const matchStart = match.index;
        const matchEnd = match.index + match[0].length;
        if (cursorPosition >= matchStart && cursorPosition <= matchEnd) {
          found = true;
          const cleanWord = match[1];
          const newText =
            text.slice(0, matchStart) + cleanWord + text.slice(matchEnd);
          const newPos = matchStart + cleanWord.length;
          updateTextAndCursor(newText, newPos);
          break;
        }
      }

      // 3: If not found, wrap current word with []()
      if (!found) {
        const wrapped = `[${currentWord}]()`;
        const newText =
          text.slice(0, startOfWord + 1) + wrapped + text.slice(cursorPosition);
        const newPos = startOfWord + 1 + wrapped.length - 1; // Place cursor before the closing )
        updateTextAndCursor(newText, newPos, () => {
          setStartIndex(newPos);
          setFileSuggestion(true);
          console.log(currentWord);
        });
      }
    }
  };

  const handleKeyDownFilesSuggetions = (event) => {
    //For movement while suggestions
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setselectedLinkSuggestionIndex((prevIndex) =>
        prevIndex === null ? 0 : Math.min(suggestions.length - 1, prevIndex + 1)
      );
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setselectedLinkSuggestionIndex((prevIndex) =>
        prevIndex === null ? 0 : Math.max(0, prevIndex - 1)
      );
    } else if (event.key === "Enter" && selectedLinkSuggestionIndex !== null) {
      event.preventDefault();
      const selectedFile = suggestions[selectedLinkSuggestionIndex].fileName;
      const endIndex = markdownText.indexOf(")", startIndex);
      setMarkdownText(
        markdownText.slice(0, startIndex) +
          selectedFile +
          markdownText.slice(endIndex)
      );
      setSuggestions([]);
      setFileSuggestion(false);
      setselectedLinkSuggestionIndex(null);
    }
  };

  // Event handlers
  const handleChange = (e) => {
    setMarkdownText(e.target.value);
  };
  const handleTitleChange = (e) => {
    const updatedFileName = e.target.value;
    saveChanges();
    setFileName(updatedFileName);
  };

  // Add template
  const addTemplate = async (e) => {
    e.preventDefault();
    const extractedSynapses = Array.from(
      markdownText.matchAll(/\^\^([^\^]+)\^\^/g),
      (m) => m[1]
    );
    if (!fileName) {
      alert("File name is required");
      return;
    }
    console.log("File data : ", fileData);

    try {
      if (status === "online") {
        const response = await TemplateService.addTemplate(
          templateName,
          selectedIcon,
          fileName,
          markdownText,
          extractedSynapses,
          user._id
        );
      } else {
        const response = await electronTemplateService.addTemplate(
          templateName,
          selectedIcon,
          fileName,
          markdownText,
          extractedSynapses
        );
      }
      window.location.reload();
    } catch (error) {
      console.error(error);
      console.log(
        error.response?.data?.error || "An error occurred. Please try again."
      );
    }
  };

  // bookmark and delete functions
  const handleFileAction = async (action) => {
    switch (action) {
      case "delete":
        if (status === "online") {
          await FileService.deleteFile(user._id, fileData.fileName);
        } else {
          await ElectronFileService.deleteFile(fileData.fileName);
        }
        window.location.reload();
        break;
      case "bookmark":
        if (status === "online") {
          await FileService.bookmarkFile(
            user._id,
            fileData.fileName,
            !fileData.bookmark
          );
        } else {
          await ElectronFileService.bookmarkFile(
            fileData.fileName,
            !fileData.bookmark
          );
        }
        window.location.reload();
        break;
    }
  };

  // Resizable divider listeners
  const startDragging = (e) => {
    document.addEventListener("mousemove", onDragging);
    document.addEventListener("mouseup", stopDragging);
  };

  const onDragging = (e) => {
    const section = document.querySelector(".section");
    const sectionRect = section.getBoundingClientRect();
    const relativeX = e.clientX - sectionRect.left;
    const newWidth = (relativeX / sectionRect.width) * 100;

    if (newWidth > 20 && newWidth < 80) {
      setEditorWidth(newWidth);
    }
  };

  const stopDragging = () => {
    document.removeEventListener("mousemove", onDragging);
    document.removeEventListener("mouseup", stopDragging);
  };

  if (dataStatus) {
    return (
      <div className="loading">
        {loading
          ? "Loading..."
          : "The file you’re looking for may have been deleted or is no longer available."}{" "}
      </div>
    );
  }

  return (
    <>
      {/* Add template dialogue box */}
      {addTemplateToggle && (
        <>
          <div
            className="templateX-overlay"
            onClick={() => setAddTemplateToggle(false)}
          />
          <div className="add-template-card">
            <div>
              <h2>Add this file as Template</h2>
              <div className="template-input-group">
                <label>Template Name</label>
                <input
                  type="text"
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  placeholder="Enter template name..."
                />
              </div>

              <h3>Choose Template Icon</h3>
              <div className="icon-grid">
                {icons.map((icon, index) => (
                  <div
                    key={index}
                    className={`icon-option ${
                      selectedIcon === icon ? "selected" : ""
                    }`}
                    onClick={() => handleIconClick(icon)}
                  >
                    <span
                      className="material-icons"
                      style={{
                        fontSize: "24px",
                        color:
                          selectedIcon === icon
                            ? "var(--icon-hover)"
                            : "var(--text-secondary)",
                      }}
                    >
                      {icon}
                    </span>
                  </div>
                ))}
              </div>

              <button
                className="add-template-button"
                onClick={addTemplate}
                style={{
                  backgroundColor: "var(--add-template-button-bg)",
                  color: "white",
                }}
              >
                Create Template
              </button>
            </div>
          </div>
        </>
      )}
      {/* Editor */}
      <div className="template-container">
        {suggestions.length > 0 && <div className="suggestion-bg-overlay" />}
        {suggestions.length > 0 && (
          <ul className="suggestions-card">
            {suggestions.map((file, index) => (
              <li
                key={file._id}
                className={`suggestion-item ${
                  index === selectedLinkSuggestionIndex ? "selected" : ""
                }`}
                onClick={() => {
                  setFileSuggestion(false);
                  setMarkdownText(
                    markdownText.slice(0, startIndex) +
                      file.fileName +
                      markdownText.slice(startIndex)
                  );
                  setSuggestions([]);
                  setselectedLinkSuggestionIndex(null);
                }}
                onMouseEnter={() => setselectedLinkSuggestionIndex(index)}
              >
                {file.fileName}
              </li>
            ))}
          </ul>
        )}

        <div className="header">
          <div className="title">
            <h3>{fileName}</h3>
            {editableToggle && (
              <span className="save-status">
                <span
                  className="material-icons"
                  title="Saving status"
                  style={{ fontSize: "18px", marginLeft: "8px" }}
                >
                  {saving ? "hourglass_empty" : "check_circle"}
                </span>
              </span>
            )}
          </div>

          <div className="header-actions">
            <button
              className="icon-button"
              onClick={() => handleFileAction("delete")}
              title="Delete file"
            >
              <span className="material-icons">delete</span>
            </button>

            <button
              className="icon-button"
              onClick={() => handleFileAction("bookmark")}
              title={
                fileData
                  ? fileData.bookmark
                    ? "Remove bookmark"
                    : "Bookmark file"
                  : ""
              }
            >
              <span className="material-icons">
                {fileData
                  ? fileData.bookmark
                    ? "bookmark"
                    : "bookmark_border"
                  : ""}
              </span>
            </button>

            <button
              className="icon-button"
              onClick={() => setAddTemplateToggle(true)}
              title="Save as template"
            >
              <span className="material-icons">add</span>
            </button>

            <button
              className="icon-button"
              onClick={() => setEditableToggle(!editableToggle)}
              title={editableToggle ? "Switch to preview" : "Switch to editor"}
            >
              <span className="material-icons">
                {editableToggle ? "visibility" : "edit_note"}
              </span>
            </button>
          </div>
        </div>

        {editableToggle && (
          <div className="section">
            <div
              className="editor-section"
              style={{
                width: `${editorWidth}%`,
                minWidth: "30%",
                maxWidth: "70%",
              }}
            >
              <input
                type="text"
                placeholder="Enter file name"
                value={fileName}
                onChange={handleTitleChange}
                onBlur={
                  status === "online"
                    ? () => {
                        reload();
                      }
                    : () => {
                        renameFileName();
                      }
                }
                className="file-name-input"
              />
              <textarea
                ref={textareaRef}
                value={markdownText}
                onChange={handleChange}
                onKeyDown={(e) => {
                  if (suggestions.length > 0) {
                    handleKeyDownFilesSuggetions(e);
                  } else {
                    handleKeyDown(e);
                  }
                }}
                className="markdown-textarea"
              />
            </div>

            <div className="divider" onMouseDown={startDragging} />

            <div className="preview-section" style={{ flexGrow: 1 }}>
              <div
                dangerouslySetInnerHTML={getMarkdownPreview()}
                className="markdown-preview"
              />
            </div>
          </div>
        )}

        {!editableToggle && (
          <div className="preview-section">
            <div
              dangerouslySetInnerHTML={getMarkdownPreview()}
              className="markdown-preview"
            />
          </div>
        )}
      </div>
    </>
  );
};

export default Editor;

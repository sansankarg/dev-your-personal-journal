import { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./MainPage.css";
import NavBar from "../NavBar/NavBar";
import Editor from "../Editor/Editor";
import { format } from "date-fns";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../ContextComponents/AuthContext";
import FolderCard from "../../FolderCard/FolderCard";
import {
  FileService,
  TemplateService,
  ElectronFileService,
  electronTemplateService,
} from "../services/apiServices";
import { useStatus } from "../ContextComponents/StatusContext";

const MainPage = ({ toggleSignup, toggleLogin }) => {
  // Authentication
  const { user, isAuthenticated } = useAuth();
  const { status } = useStatus();

  // Routing
  const navigate = useNavigate();
  const { id } = useParams();

  // Content states
  const [data, setData] = useState(null);
  const [files, setFiles] = useState([]);
  const [templates, setTemplates] = useState([]);

  // UI Control states
  const [selectedFile, setSelectedFile] = useState(null);
  const [showTemplate, setShowTemplate] = useState(true);
  const [bookmarks, setBookmarks] = useState(false);
  const [filesFlag, setFilesFlag] = useState(true);
  const [openGroups, setOpenGroups] = useState({});
  const [fileColumnWidth, setfileColumnWidth] = useState(15);

  const toggleGroup = (monthKey) => {
    setOpenGroups((prev) => ({
      ...prev,
      [monthKey]: !prev[monthKey],
    }));
  };

  // Fetch files
  const loadData = async () => {
    const [filesRes, templatesRes] = await Promise.all([
      status === "online"
        ? FileService.getFiles(user._id)
        : ElectronFileService.getFiles(),
      status === "online"
        ? TemplateService.getTemplates(user._id)
        : await electronTemplateService.getTemplates(),
    ]);
    status === "online" ? setFiles(filesRes.data) : setFiles(filesRes);
    status === "online"
      ? setTemplates(templatesRes.data.templates)
      : setTemplates(templatesRes.templates);
    console.log(filesRes, user._id)
  };
  useEffect(() => {
    // all files including markdowns and template

    loadData();
  }, [status, user?._id]);

  

  useEffect(() => {
    const fetchFileData = async () => {
      // by id
      try {
        if (!id) return;
        if (status === "online") {
          const response = await FileService.getFilesById(id, user._id);
          console.log("Response : ", response);
          setData(response.data);
        } else {
          const response = await ElectronFileService.getFilesByName(id);
          // console.log("Response : ", response);
          setData(response);
        }
      } catch (error) {
        console.error("Error fetching file data:", error);
      }
    };
    fetchFileData();
  }, [id, status, files]);

  // delete template
  const deleteTemplate = async (index, fileName) => {
    try {
      if (status === "online") {
        const response = await TemplateService.deleteTemplate(user._id, index);
        if (response.ok) {
          console.log("Template deleted successfully:", data);
          const updatedTemplates = templates.filter((_, i) => i !== index);
          setTemplates(updatedTemplates);
        } else {
          console.error("Error deleting template:", data.error);
        }
      } else {
        const response = await electronTemplateService.deleteTemplate(fileName);
        const updatedTemplates = templates.filter(
          (template) => template.templateName !== fileName
        );
        setTemplates(updatedTemplates);
      }
      const data = await response.json();
    } catch (error) {
      console.error("Error:", error);
    }
  };

  // bookmark and delete functions
  const handleFileAction = async (action, file) => {
    switch (action) {
      case "delete":
        if (status === "online") {
          await FileService.deleteFile(user._id, file.fileName);
        } else {
          await ElectronFileService.deleteFile(file.fileName);
        }
        setFiles((prev) => prev.filter((f) => f.fileName !== file.fileName));
        console.log("Check : ", data);
        if (data.fileName == file.fileName) {
          setData(null);
        }
        break;
      case "bookmark": {
        if (status === "online") {
          await FileService.bookmarkFile(
            user._id,
            file.fileName,
            !file.bookmark
          );
        } else {
          await ElectronFileService.bookmarkFile(file.fileName, !file.bookmark);
        }
        setFiles((prev) =>
          prev.map((f) => (f === file ? { ...f, bookmark: !f.bookmark } : f))
        );
        break;
      }
    }
  };

  // Add functions for custom, blank, day, month files
  const handleAddCustomFile = async (file) => {
    const newFile = {
      fileName: file.fileName,
      content: file.content,
      synapses: file.synapses,
    };

    try {
      if (status === "online") {
        const response = await FileService.saveFile(newFile, user._id);
        setFiles([...files, response.data]);
        handleFileClick(response.data);
        console.log("Response from main process:", response);
      } else {
        const response = await ElectronFileService.saveFile(
          newFile.fileName,
          newFile.content,
          newFile.synapses,
          user._id
        );
        console.log("Response from main process:", response);
        setFiles([...files, response]);
        handleFileClick(response);
        console.log("Response from main process:", response);
      }
    } catch (error) {
      console.error(
        "Error creating file:",
        error.response?.data || error.message
      );
    }
  };

  const handleAddFile = async () => {
    const newFile = {
      fileName: `New File ${files.length + 1}`,
      content: "",
    };

    try {
      if (status === "online") {
        const response = await FileService.saveFile(newFile, user._id);
        setFiles([...files, response.data]);
        handleFileClick(response.data);
        console.log("Response from main process:", response);
      } else {
        const response = await ElectronFileService.saveFile(
          newFile.fileName,
          newFile.content,
          newFile.synapses,
          user._id
        );
        console.log("Response from main process:", response);
        setFiles([...files, response]);
        handleFileClick(response);
      }
    } catch (error) {
      console.error(
        "Error creating file:",
        error.response?.data || error.message
      );
    }
  };

  const handleAddDayFile = async () => {
    const currentDate = new Date().toISOString().split("T")[0];
    const currentDayName = new Date().toLocaleString("default", {
      weekday: "long",
    });
    const newFile = {
      fileName: `${currentDate} - ${currentDayName}`,
      content: `# ${currentDate} - ${currentDayName} 
`,
    };

    try {
      if (status === "online") {
        const response = await FileService.saveFile(newFile, user._id);
        setFiles([...files, response.data]);
        handleFileClick(response.data);
      } else {
        const response = await ElectronFileService.saveFile(
          newFile.fileName,
          newFile.content,
          newFile.synapses,
          user._id
        );
        console.log("Response from main process:", response);
        setFiles([...files, response]);
        handleFileClick(response);
      }
    } catch (error) {
      console.error(
        "Error creating day file:",
        error.response?.data || error.message
      );
    }
  };

  const handleAddMonthFile = async () => {
    const today = new Date();
    const currentDate = today.toISOString().split("T")[0];
    const currentYear = today.getFullYear();
    const currentMonthName = today.toLocaleString("default", { month: "long" });
    const currentMonth = today.getMonth();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

    const tableRows = Array.from({ length: daysInMonth }, (_, i) => {
      const date = new Date(currentYear, currentMonth, i + 1);
      const day = date
        .toLocaleDateString("en-US", { weekday: "short" })
        .charAt(0);
      return i <= 8
        ? `  | ${i + 1}    | ${day}   |   | [ ] | [ ] | [ ] |`
        : `  | ${i + 1}   | ${day}   |   | [ ] | [ ] | [ ] |`;
    }).join("\n");

    const markdownContent = `
  # ${currentMonthName} - ${currentYear}
  
  | Date | Day | Highlight | T 1 | T 2 | T 3 |
  |------|-----|-----------|-----|-----|-----|
${tableRows}`.trim();

    const newFile = {
      fileName: `${currentMonthName} - ${currentYear}`,
      content: markdownContent,
    };

    try {
      if (status === "online") {
        const response = await FileService.saveFile(newFile, user._id);
        setFiles([...files, response.data]);
        handleFileClick(response.data);
      } else {
        const response = await ElectronFileService.saveFile(
          newFile.fileName,
          newFile.content,
          newFile.synapses,
          user._id
        );
        console.log("Response from main process:", response);
        setFiles([...files, response]);
        handleFileClick(response);
        console.log("Response from main process:", response);
      }
    } catch (error) {
      console.error(
        "Error creating day file:",
        error.response?.data || error.message
      );
    }
  };

  // Event handlers
  const handleFileClick = (file) => {
    setSelectedFile(file);
    setTimeout(() => navigate(`/${file.fileName}`), 0);
  };

  const handleFileNameChange = (updatedFileName) => {
    if (!selectedFile) return;

    setFiles((prevFiles) =>
      prevFiles.map((file) =>
        file.fileName === selectedFile.fileName
          ? { ...file, fileName: updatedFileName }
          : file
      )
    );
  };

  const handleBookMark = () => {
    setBookmarks(!bookmarks);
    setShowTemplate(true);
  };

  const handleShowTemplate = () => {
    setShowTemplate(!showTemplate);
  };

  const handleFilesToggle = () => {
    setFilesFlag(!filesFlag);
  };

  const filesToDisplay = bookmarks
    ? files.filter((file) => file.bookmark)
    : files;

  const groupedFiles = filesToDisplay.reduce((acc, file) => {
    const dateKey = format(new Date(file.createdAt), "yyyy-MM"); // e.g., "2025-04"
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(file);
    return acc;
  }, {});

  // Resizable divider listeners
  const startDragging = (e) => {
    e.preventDefault();
    document.addEventListener("mousemove", onDragging);
    document.addEventListener("mouseup", stopDragging);
  };

  const onDragging = (e) => {
    const pageRect = document.querySelector(".page").getBoundingClientRect();
    const relativeX = e.clientX - pageRect.left;

    // Adjust the width of the editor dynamically, based on the cursor movement
    const newWidth = (relativeX / pageRect.width) * 100;

    if (newWidth > 10 && newWidth < 30) {
      setfileColumnWidth(newWidth);
    }
  };

  const stopDragging = () => {
    document.removeEventListener("mousemove", onDragging);
    document.removeEventListener("mouseup", stopDragging);
  };

  if(!isAuthenticated) {
    return (
      <FolderCard/>
    )
  }

  return (
    <>
      <NavBar
        handleShowTemplate={handleShowTemplate}
        handleBookMark={handleBookMark}
        handleFiles={handleFilesToggle}
        toggleSignup={toggleSignup}
        toggleLogin={toggleLogin}
      />

      <div className="page">
        <div className="template-column">
          <span
            onClick={handleAddFile}
            title="Add a blank file"
            className="logo material-icons"
          >
            post_add
          </span>
          <span
            onClick={handleAddDayFile}
            title="Add a day file"
            className="logo material-icons"
          >
            today
          </span>
          <span
            onClick={handleAddMonthFile}
            title="Add a month file"
            className="logo material-icons"
          >
            calendar_month
          </span>
          {showTemplate && (
            <>
              {templates.map((template) => (
                <span
                  key={template.templateName}
                  title={`Add a ${template.templateName} file`}
                  className="logo material-icons"
                  onClick={() => handleAddCustomFile(template)}
                >
                  {template.templateLogo}
                </span>
              ))}
            </>
          )}
        </div>
        {filesFlag && (
          <>
            {showTemplate ? (
              <>
                <div
                  className="file-list-column"
                  style={{
                    width: `${fileColumnWidth}%`,
                    minWidth: "5%",
                    maxWidth: "95%",
                  }}
                >
                  <div className="margin-header">
                    <h4>Files</h4>
                  </div>
                  <ul className="list-group">
                    {Object.keys(groupedFiles)
                      .sort((a, b) => new Date(b) - new Date(a)) // newest month first
                      .map((monthKey) => (
                        <div key={monthKey}>
                          <h5
                            className={
                              !openGroups[monthKey]
                                ? "list-month-open"
                                : "list-month-close"
                            }
                            onClick={() => toggleGroup(monthKey)}
                            style={{ cursor: "pointer", userSelect: "none" }}
                          >
                            <span>
                              {format(new Date(monthKey + "-01"), "MMMM yyyy")}
                            </span>
                            <span>{!openGroups[monthKey] ? "" : "▼"}</span>
                          </h5>

                          {!openGroups[monthKey] && ( // Only show if open
                            <ul className="list-group">
                              {groupedFiles[monthKey]
                                .sort(
                                  (a, b) =>
                                    new Date(b.createdAt) -
                                    new Date(a.createdAt)
                                )
                                .map((file) => (
                                  <li
                                    key={file._id}
                                    className="list-file d-flex justify-content-between align-items-center file-item"
                                  >
                                    <span
                                      key={file._id}
                                      onClick={() => handleFileClick(file)}
                                    >
                                      {file.fileName}
                                    </span>
                                    <div className="icon-container">
                                      <span
                                        className="material-icons icon"
                                        title={
                                          file.bookmark
                                            ? "Remove bookmark"
                                            : "Bookmark file"
                                        }
                                        onClick={() =>
                                          handleFileAction("bookmark", file)
                                        }
                                      >
                                        {file.bookmark
                                          ? "bookmark"
                                          : "bookmark_border"}
                                      </span>
                                      <span
                                        className="material-icons icon"
                                        title="Delete"
                                        onClick={() =>
                                          handleFileAction("delete", file)
                                        }
                                      >
                                        delete
                                      </span>
                                    </div>
                                  </li>
                                ))}
                            </ul>
                          )}
                        </div>
                      ))}
                  </ul>
                </div>
              </>
            ) : (
              <>
                <div
                  className="file-list-column"
                  style={{
                    width: `${fileColumnWidth}%`,
                    minWidth: "5%",
                    maxWidth: "95%",
                  }}
                >
                  <div className="margin-header">
                    <h4>Templates</h4>
                  </div>
                  <ul className="list-group">
                    {templates.map((template, index) => (
                      <li
                        key={index}
                        className="list-file d-flex justify-content-between align-items-center file-item"
                      >
                        <span className="material-icons icon">
                          {template.templateLogo}
                        </span>
                        {template.templateName}
                        <div className="icon-container">
                          <span
                            onClick={() =>
                              deleteTemplate(index, template.templateName)
                            }
                            className="material-icons icon"
                          >
                            delete
                          </span>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </>
            )}
          </>
        )}

        <div className="divider" onMouseDown={startDragging} />

        <div
          className="editor-column"
          style={{ width: `calc(100% - ${fileColumnWidth}%)`, flexGrow: 1 }}
        >
          <Editor
            allFiles={files}
            fileData={data}
            reload={loadData}
            id={id}
            onFileNameChange={handleFileNameChange}
          />
        </div>
      </div>
    </>
  );
};

export default MainPage;

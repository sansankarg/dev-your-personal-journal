import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './MainPage.css';
import NavBar from '../NavBar/NavBar';
import Template from '../Template/Template';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { useAuth } from "../ContextComponents/AuthContext";
import AddTemplate from '../AddTemplate/AddTemplate';

const MainPage = ({ toggleSignup, toggleLogin }) => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [files, setFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null); 
  const [template, setTemplate] = useState([]);
  const [showTemplate, setShowTemplate] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null); 
  const [bookmarks, setBookmarks] = useState(false);
  const [filesFlag, setFilesFlag] = useState(true);
  const [fileSuggestion, setFileSuggestion] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const {user} = useAuth();
  const [toggle, setToggle] = useState(true);
  const [templates, setTemplates] = useState([]);
  const [addTemplateToggle, setAddTemplateToggle] = useState(false)
  const [templateName, setTemplateName] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('');

  const icons = [
    'home', 'search', 'settings', 'email', 'star', 'phone', 'person', 'info', 
    'notifications', 'add', 'delete', 'archive', 'thumb_up', 'favorite', 'chat'
  ];

  const handleIconClick = (icon) => {
    setSelectedIcon(icon);
  };

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const response = await axios.get("http://localhost:5000/get-template", {
          params: { userId: user._id },
        });
  
        if (response.status === 200) {
          setTemplates(response.data.templates); 
          console.log("Feteched templates : ",response.data.templates)
        }
      } catch (err) {
        console.error("Error fetching templates:", err);
      }
    };
  
    if (user._id) {
      fetchTemplates(); 
    }
  }, [user._id]);
  

  const goToFile = (id) => {
    navigate(`/${id}`);
  };

  const handleFileNameChange = (updatedFileName) => {
    setFiles((prevFiles) =>
      prevFiles.map((file) =>
        file._id === selectedFile._id
          ? { ...file, fileName: updatedFileName }
          : file
      )
    );
  };

 

  useEffect(() => {
    if(fileSuggestion) {
      fileNameSuggestions(currentWord);
    }
  }, [data]);

  const fileNameSuggestions = (currentWord) => {
    if (!currentWord) {
      setSuggestions([]);
      return;
    }
    const filtered = files.filter(file =>
      file.fileName.toLowerCase().includes(currentWord.toLowerCase())
    );
    setSuggestions(filtered);
    console.log("Suggestions : ", suggestions);
  };

  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const response = await fetch('http://localhost:5000/get-markdown', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ userId: user._id }),
        });

        if (!response.ok) {
          throw new Error('Network response was not ok');
        }

        const data = await response.json();
        console.log("Received markdown data:", data);
        setFiles(data);
      } catch (error) {
        console.error('Error fetching files:', error);
      }
    };
    if (user && user._id) {
      fetchFiles();
    }

  }, [user, addTemplateToggle]);

  useEffect(() => {
    const fetchFileData = async () => {
      try {
        const response = await axios.post(`http://localhost:5000/get-markdown/${id}`,{id : user._id});
        setData(response.data);
        console.log("Fetched data : ", response.data);
      } catch (error) {
        console.error('Error fetching file data:', error);
      }
    };
    fetchFileData();
  }, [id]);


  const handleFileClick = (file) => {
    setSelectedFile(file);
    goToFile(file._id);
    setToggle(true);
  };

  const addTemplate =()=> {
    const newFile = {
      templateName: templateName,
      templateLogo:selectedIcon,
      fileName: "New file",
      content:""
    }
    setTemplate([...template, newFile]);
    setAddTemplateToggle(false);
    setToggle(false);
    setSelectedTemplate(newFile);
  }

  const handleAddCustomFile = async (file) => {
    const newFile = {
      fileName: file.fileName,
      content: file.content,
      synapses: file.synapses
    };

    try {
      const response = await axios.post('http://localhost:5000/save-markdown',{ newFile, id:user._id});
      if (response.data.message === 'File created successfully') {
        setFiles([...files, response.data.data]);
        setSelectedFile(response.data.data);
      }
    } catch (error) {
      console.error('Error creating file:', error.response?.data || error.message);
    }
  };

  const handleAddFile = async () => {
    const newFile = {
      fileName: `New File ${files.length + 1}`,
      content: '',
    };

    try {
      const response = await axios.post('http://localhost:5000/save-markdown',{ newFile, id:user._id});
      if (response.data.message === 'File created successfully') {
        setFiles([...files, response.data.data]);
        setSelectedFile(response.data.data);
      }
    } catch (error) {
      console.error('Error creating file:', error.response?.data || error.message);
    }
  };

  const handleAddDayFile = async () => {
    const currentDate = new Date().toISOString().split('T')[0];
    const currentDayName = new Date().toLocaleString('default', { weekday: 'long' });
    const newFile = {
      fileName: `${currentDate} - ${currentDayName}`,
      content: `# ${currentDate} - ${currentDayName} 
`
    };
  
    try {
      const response = await axios.post('http://localhost:5000/save-markdown', { newFile, id:user._id});
      if (response.data.message === 'File created successfully') {
        setFiles([...files, response.data.data]);
        setSelectedFile(response.data.data);
      }
    } catch (error) {
      console.error('Error creating day file:', error.response?.data || error.message);
    }
  };

  const handleAddMonthFile = async () => {
    const today = new Date();
    const currentDate = today.toISOString().split('T')[0];
    const currentYear = today.getFullYear();
    const currentMonthName = today.toLocaleString('default', { month: 'long' });
    const currentMonth = today.getMonth();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  
    const tableRows = Array.from({ length: daysInMonth }, (_, i) => {
      const date = new Date(currentYear, currentMonth, i + 1);
      const day = date.toLocaleDateString('en-US', { weekday: 'short' }).charAt(0);
      return (i <= 8
        ? `  | ${i + 1}    | ${day}   |   | [ ] | [ ] | [ ] |`
        : `  | ${i + 1}   | ${day}   |   | [ ] | [ ] | [ ] |`);
    }).join('\n');
  
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
      const response = await axios.post('http://localhost:5000/save-markdown', { newFile, id:user._id});
      if (response.data.message === 'File created successfully') {
        setFiles([...files, response.data.data]);
        setSelectedFile(response.data.data);
      }
    } catch (error) {
      console.error('Error creating day file:', error.response?.data || error.message);
    }
  };

  const handleDeleteFile = async (fileId) => {
    try {
      const response = await axios.post(`http://localhost:5000/delete-markdown/${fileId}`,{userId : user._id});
      if (response.data.message === 'File deleted successfully') {
        setFiles(files.filter(file => file._id !== fileId));
        if (selectedFile && selectedFile._id === fileId) {
          setSelectedFile(null);
        }
      }
    } catch (error) {
      console.error('Error deleting file:', error.response?.data || error.message);
    }
  };

  const deleteTemplate = async (index) => {
    
    try {
        const response = await fetch('http://localhost:5000/delete-template', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ userId:user._id, templateIndex: index }),
        });

        const data = await response.json();
        if (response.ok) {
            console.log('Template deleted successfully:', data);
            const updatedTemplates = templates.filter((_, i) => i !== index);
            setTemplates(updatedTemplates);
        } else {
            console.error('Error deleting template:', data.error);
        }
    } catch (error) {
        console.error('Error:', error);
    }
};

  const handleBookMark = () => {
    setBookmarks(!bookmarks);
    setShowTemplate(true);
  };

  const handleShowTemplate =()=> {
    setShowTemplate(!showTemplate)
  }

  const handleFilesToggle = () => {
    setFilesFlag(!filesFlag);
  };

  const handleBookmarkFile = async (fileId, bookmarkStatus) => {
    try {
      const response = await axios.put(`http://localhost:5000/bookmark-markdown/${fileId}`, { bookmark: !bookmarkStatus, userId : user._id });
      console.log("After : ",files)

      if (response.data.message) {
        setFiles(files.map(file => 
          file._id === fileId ? { ...file, bookmark: !bookmarkStatus } : file
        ));
        console.log("Before : ",files)
      }
      console.log("Bookmarked successfully");
    } catch (error) {
      console.error('Error updating bookmark:', error.response?.data || error.message);
    }
  };

  const filesToDisplay = bookmarks
    ? files.filter(file => file.bookmark)
    : files;

  return (
    <>
      <NavBar handleShowTemplate = {handleShowTemplate} handleBookMark={handleBookMark} handleFiles={handleFilesToggle} toggleSignup={toggleSignup} toggleLogin={toggleLogin}/>
      {addTemplateToggle && (<>
        <div className="templateX-overlay" onClick={()=>setAddTemplateToggle(false)}/>
        <div className="add-template-card">
                    <div>
                <h2>Enter Template Details</h2>
                <div>
                  <label>Template Name:</label>
                  <input
                    type="text"
                    value={templateName}
                    onChange={(e) => setTemplateName(e.target.value)}
                    placeholder="Template Name"
                  />
                </div>
                <div>
                  <h3>Select Template Logo</h3>
                  <div>
                    {icons.map((icon, index) => (
                      <span
                        key={index}
                        className="material-icons"
                        onClick={() => handleIconClick(icon)}
                        style={{ fontSize: '24px', cursor: 'pointer', margin: '5px' }}
                      >
                        {icon}
                      </span>
                    ))}
                  </div>
                </div>
                <button onClick={addTemplate}>Add Template</button>
              </div>
            </div></>
      )}

      <div className="page">
        <div className='very-left-column'>
          <span onClick={handleAddFile} className="add material-icons">post_add</span>
          <span onClick={handleAddDayFile} className="add material-icons">today</span>
          <span onClick={handleAddMonthFile} className="add material-icons">calendar_month</span>
          <span onClick={()=>setAddTemplateToggle(true)} className="add material-icons">add</span>
          {showTemplate && (
            <>
          {templates.map((template)=>(
            <span key={template.index} className="add material-icons" onClick={()=>handleAddCustomFile(template)}>{template.templateLogo}</span>
          ))}
            </>
          )}
        </div>
        {filesFlag && (<>
        {showTemplate ? (
          <>
          <div className="left-column">
            <div className='margin-header'>
              <h4>Files {addTemplateToggle}</h4>
            </div>
            <ul className='list-group'>
              {filesToDisplay.map((file) => (
                <li
                  key={file._id}
                  className='list-group-item d-flex justify-content-between align-items-center file-item'
                  onClick={() => handleFileClick(file)}
                >
                  {file.fileName}
                  <div className="icon-container">
                    <span 
                      className="material-icons icon" 
                      onClick={() => handleBookmarkFile(file._id, file.bookmark)}
                    >
                      {file.bookmark ? 'bookmark' : 'bookmark_border'}
                    </span>
                    <span 
                      className="material-icons icon"
                      onClick={() => {handleDeleteFile(file._id);}}
                    >
                      delete
                    </span>
                  </div>
                </li>
              ))}
            </ul>
            <ul className='list-group'>
              {template.map((temp)=> (
                <li
                key={temp.index}
                className='list-group-item d-flex justify-content-between align-items-center file-item'
                onClick={() => handleFileClick(temp)}
              >
                {temp.fileName}
              </li>
              ))}
            </ul>
          </div>
          </>
        ):(
          <>

          <div className="left-column">
            <div className='margin-header'>
              <h4>Templates {addTemplateToggle}</h4>
            </div>
            <ul className='list-group'>
              {templates.map((template, index) => (
                <li
                  key={index}
                  className='list-group-item d-flex justify-content-between align-items-center file-item'>
                    <span 
                      className="material-icons icon"
                    >
                      {template.templateLogo}
                    </span>
                  {template.templateName}
                  <div className="icon-container">
                    <span 
                      onClick={()=>deleteTemplate(index)}
                      className="material-icons icon"
                    >
                      delete
                    </span>
                  </div>
                </li>
              ))}
            </ul>
            <ul className='list-group'>
              {template.map((temp)=> (
                <li
                key={temp.index}
                className='list-group-item d-flex justify-content-between align-items-center file-item'
                onClick={() => handleFileClick(temp)}
              >
                {temp.templateName}
                <div className="icon-container">
                    <span 
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
        )}</>)}
        
        <div className="right-column">
          {!addTemplateToggle ? (
            <>
            {toggle ? (
            <Template fileData={data} id={id} onFileNameChange={handleFileNameChange}/>            
          ):(
            <AddTemplate fileData={selectedTemplate} id={id} onFileNameChange={handleFileNameChange}/>
          )}</>
          ):(
            // <div className="add-template-card">
            //         <div>
            //     <h2>Enter Template Details</h2>
            //     <div>
            //       <label>Template Name:</label>
            //       <input
            //         type="text"
            //         value={templateName}
            //         onChange={(e) => setTemplateName(e.target.value)}
            //         placeholder="Template Name"
            //       />
            //     </div>
            //     <div>
            //       <h3>Select Template Logo</h3>
            //       <div>
            //         {icons.map((icon, index) => (
            //           <span
            //             key={index}
            //             className="material-icons"
            //             onClick={() => handleIconClick(icon)}
            //             style={{ fontSize: '24px', cursor: 'pointer', margin: '5px' }}
            //           >
            //             {icon}
            //           </span>
            //         ))}
            //       </div>
            //     </div>
            //     <button onClick={addTemplate}>Add Template</button>
            //   </div>
            // </div>
            <></>
          )}
          
        </div>
      </div>
    </>
  );
};

export default MainPage;

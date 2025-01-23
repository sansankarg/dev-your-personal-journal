import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './MainPage1.css';
import NavBar from '../NavBar/NavBar';
import Template from '../Template/Template';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';

const MainPageA = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [files, setFiles] = useState([]);
  const [folders, setFolders] = useState([]);
  const [currentFolder, setCurrentFolder] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [bookmarks, setBookmarks] = useState(false);
  const [filesFlag, setFilesFlag] = useState(true);

  useEffect(() => {
    const fetchFolderTree = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/get-folder-tree/${currentFolder || 'root'}`);
        setFolders(response.data.folders);
        setFiles(response.data.files);
      } catch (error) {
        console.error('Error fetching folder tree:', error);
      }
    };

    fetchFolderTree();
  }, [currentFolder]);

  const handleCreateFolder = async () => {
    const folderName = prompt('Enter folder name:');
    if (!folderName) return;

    const newFolder = {
      name: folderName,
      parent: currentFolder || 'root',
    };

    try {
      const response = await axios.post('http://localhost:5000/create-folder', newFolder);
      setFolders([...folders, response.data]);
    } catch (error) {
      console.error('Error creating folder:', error);
    }
  };

  const handleAddFile = async () => {
    const newFile = {
      fileName: `New File ${files.length + 1}`,
      content: '',
      folder: currentFolder || 'root',
    };

    try {
      const response = await axios.post('http://localhost:5000/save-markdown', newFile);
      setFiles([...files, response.data.data]);
      setSelectedFile(response.data.data);
    } catch (error) {
      console.error('Error creating file:', error);
    }
  };

  const handleNavigateFolder = (folderId) => {
    setCurrentFolder(folderId);
  };

  const handleFileClick = (file) => {
    setSelectedFile(file);
    navigate(`/${file._id}`);
  };

  const handleDeleteFile = async (fileId) => {
    try {
      await axios.delete(`http://localhost:5000/delete-markdown/${fileId}`);
      setFiles(files.filter(file => file._id !== fileId));
      if (selectedFile && selectedFile._id === fileId) {
        setSelectedFile(null);
      }
    } catch (error) {
      console.error('Error deleting file:', error);
    }
  };

  return (
    <>
      <NavBar handleBookMark={() => setBookmarks(!bookmarks)} handleFiles={() => setFilesFlag(!filesFlag)} />
      <div className="page">
        <div className='very-left-column'>
          <span onClick={handleAddFile} className="add material-icons">post_add</span>
          <span onClick={handleCreateFolder} className="add material-icons">create_new_folder</span>
        </div>

        {filesFlag && (
          <div className="left-column">
            <div className='margin-header'>
              <h4>{currentFolder ? `Folder: ${currentFolder}` : 'Root Folder'}</h4>
              {currentFolder && (
                <button onClick={() => setCurrentFolder(null)} className="btn btn-link">Back to Root</button>
              )}
            </div>

            <ul className='list-group'>
              {folders.map(folder => (
                <li
                  key={folder._id}
                  className='list-group-item d-flex justify-content-between align-items-center file-item'
                  onClick={() => handleNavigateFolder(folder._id)}
                >
                  <span className="material-icons">folder</span> {folder.name}
                </li>
              ))}

              {files.map(file => (
                <li
                  key={file._id}
                  className='list-group-item d-flex justify-content-between align-items-center file-item'
                  onClick={() => handleFileClick(file)}
                >
                  {file.fileName}
                  <span className="material-icons" onClick={() => handleDeleteFile(file._id)}>delete</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="right-column">
          <Template fileData={data} id={id} />
        </div>
      </div>
    </>
  );
};

export default MainPageA;

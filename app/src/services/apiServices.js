import axios from "axios";
const getBackendUrl = () => {
  const isMobile = window.innerWidth < 768;

  return isMobile
    ? import.meta.env.VITE_LOCAL_BACKEND_URL
    : import.meta.env.VITE_NETWORK_BACKEND_URL;
};

const BACKEND_URL = getBackendUrl();
export const ElectronFileService = {
  saveFile: (fileName, content, userId) =>
    window.markdownAPI.saveMarkdownFile(fileName, content, userId),
  getFiles: () => window.markdownAPI.getAllMarkdownFiles(),
  getFilesByName: (name) => window.markdownAPI.getMarkdownFile(name),

  deleteFile: (fileName) => window.markdownAPI.deleteMarkdownFile(fileName),
  bookmarkFile: (fileName, bookmark) =>
    window.markdownAPI.setBookmark({ fileName, bookmark }),
  updateFile: (fileName, content, synapses) =>
    window.markdownAPI.updateMarkdown({
      fileName,
      content,
      synapses,
    }),
};

export const FileService = {
  saveFile: (file, userId) =>
    axios.post(`${BACKEND_URL}/save-markdown`, {
      newFile: file,
      id: userId,
    }),
  getFiles: (userId) => axios.post(`${BACKEND_URL}/get-markdown`, { userId }),
  getFilesById: (fileId, userId) =>
    axios.post(`${BACKEND_URL}/get-markdown/${fileId}`, { userId }),
  deleteFile: (userId, markDownId) =>
    fetch(`${BACKEND_URL}/delete-markdown`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userId, markDownId }),
    }),
  bookmarkFile: (userId, fileId, bookmark) =>
    axios.put(`${BACKEND_URL}/bookmark-markdown/${fileId}`, {
      userId,
      bookmark,
    }),
  updateFile: (fileId, content, fileName, synapses, userId) =>
    axios.put(
      `${BACKEND_URL}/update-markdown/${fileId}`,
      {
        content,
        fileName,
        synapses,
        userId,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    ),
};
export const electronTemplateService = {
  addTemplate: (templateName, templateLogo, fileName, content, synapses) =>
    window.markdownAPI.saveTemplate(
      templateName,
      templateLogo,
      fileName,
      content,
      synapses
    ),
  getTemplates: () => window.markdownAPI.getTemplates(),
  deleteTemplate: (fileName) => window.markdownAPI.deleteTemplate(fileName),
};
export const TemplateService = {
  addTemplate: (
    templateName,
    templateLogo,
    fileName,
    content,
    synapses,
    userId
  ) =>
    axios.post(`${BACKEND_URL}/add-template`, {
      templateName,
      templateLogo,
      fileName,
      content,
      synapses,
      userId,
    }),
  getTemplates: (userId) =>
    axios.get(`${BACKEND_URL}/get-template`, { params: { userId } }),
  deleteTemplate: (userId, templateIndex) =>
    fetch(`${BACKEND_URL}/delete-template`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userId, templateIndex }),
    }),
};

export const authService = {
  login: (email, password) =>
    axios.post(
      `${BACKEND_URL}/login`,
      {
        email,
        password,
      },
      { withCredentials: true }
    ),

  logout: () => axios.get(`${BACKEND_URL}/logout`, { withCredentials: true }),

  check: () => axios.get(`${BACKEND_URL}/checkauth`, { withCredentials: true }),

  getFolder: () => window.markdownAPI.getFolderName(),
};

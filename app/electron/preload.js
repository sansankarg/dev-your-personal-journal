const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('markdownAPI', {
  saveMarkdownFile: (filename, content, synapses, userId) => ipcRenderer.invoke('save:markdownFile', filename, content, synapses, userId),
  getAllMarkdownFiles: () => ipcRenderer.invoke('get:allMarkdownFiles'),
  getMarkdownFile: (fileName) => ipcRenderer.invoke('getMarkdownFile', fileName),
  updateMarkdown: (data) => ipcRenderer.invoke('update-markdown', data),
  renameFile: (oldName, newName) => ipcRenderer.invoke('rename-file', oldName, newName),
  selectFolder: () => ipcRenderer.invoke('dialog:openFolder'),
  getRootPath: () => ipcRenderer.invoke('get:rootPath'),
  deleteMarkdownFile: (fileName) => ipcRenderer.invoke('delete:markdownFile', fileName),
  setBookmark: ({ fileName, bookmark }) => ipcRenderer.invoke('bookmark:set', { fileName, bookmark }),

  saveTemplate: (templateName, templateLogo, fileName, content, synapses) =>
    ipcRenderer.invoke('save:template', templateName, templateLogo, fileName, content, synapses),
  getTemplates: () => ipcRenderer.invoke('get:templates'),
  deleteTemplate: (templateName) => ipcRenderer.invoke('delete:template', templateName),

  getFolderName: () => ipcRenderer.invoke('get:folderName'),

  minimize: () => ipcRenderer.send('window:minimize'),
  maximize: () => ipcRenderer.send('window:maximize'),
  close: () => ipcRenderer.send('window:close'),
});


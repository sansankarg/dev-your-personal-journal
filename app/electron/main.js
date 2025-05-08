import { app, BrowserWindow, ipcMain, dialog } from "electron";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

let win;

function createWindow() {
  win = new BrowserWindow({
    width: 1200,
    height: 800,
    autoHideMenuBar: true,
    frame: false,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
      enableRemoteModule: false,
    },
  });
  win.loadURL('http://localhost:5173');
    // win.loadFile(path.join(__dirname, '../dist/index.html'));
    // win.webContents.openDevTools();
}

const appConfigPath = path.join(app.getPath("userData"), "appConfig.json");
console.log("Application configuration will be stored at:", appConfigPath);

let rootFolderPath = (() => {
  try {
    if (fs.existsSync(appConfigPath)) {
      const config = JSON.parse(fs.readFileSync(appConfigPath, "utf-8"));
      console.log("Function called")
      return config.lastVaultPath || "";
    }
  } catch (e) {
    console.error("Error loading app config:", e);
  }
  return "";
})();

ipcMain.on("window:minimize", () => {
  if (win) {
    win.minimize();
  }
});

ipcMain.on("window:maximize", () => {
  if (win) {
    win.isMaximized() ? win.unmaximize() : win.maximize();
  }
});

ipcMain.on("window:close", () => {
  if (win) {
    win.close();
  }
});


// Folder selector api
ipcMain.handle("dialog:openFolder", async () => {
  const result = await dialog.showOpenDialog({ properties: ["openDirectory"] });

  if (!result.canceled && result.filePaths[0]) {
    rootFolderPath = result.filePaths[0];
    saveRootPath(rootFolderPath);

    // Persist the selected folder
    fs.writeFileSync(
      appConfigPath,
      JSON.stringify({ lastVaultPath: rootFolderPath }),
      "utf-8"
    );
    return rootFolderPath;
  }
  return null;
});

//helper
function getRootPath() {
  return rootFolderPath;
}

// return folder location
ipcMain.handle("get:rootPath", async () => {
  return getRootPath();
});

// saving or creating rootpath
function saveRootPath(folderPath) {
  const configPath = path.join(folderPath, "rootPath.json");
  const currentTime = new Date().toISOString();
  let data = { files: {} };

  // If json already exists read it
  if (fs.existsSync(configPath)) {
    data = JSON.parse(fs.readFileSync(configPath, "utf-8"));
  } else {
    // if doesnt create one with welcome message
    const welcomeFileName = "Welcome.md";
    const welcomeFilePath = path.join(folderPath, welcomeFileName);
    const welcomeContent =
      "# Welcome new!\n\nThis is your first markdown file.\nEnjoy your journey!";

      // save welcome md
    fs.writeFileSync(welcomeFilePath, welcomeContent, "utf-8");

    // add welcome md to config
    data.files["Welcome"] = {
      filename: welcomeFileName,
      path: welcomeFilePath,
      bookmark: false,
      createdAt: currentTime,
      synapses: [],
      updatedAt: currentTime,
    };

    console.log("Welcome file saved");
  }

  // update othe fields
  data.path = folderPath;
  data.timestamp = currentTime;
  data.version = "1.0.0";

  // save it
  fs.writeFileSync(configPath, JSON.stringify(data, null, 2), "utf-8");
}

// Initial saving of markdown
ipcMain.handle("save:markdownFile",  async (event, filename, content, synapses, userId) => {
    const rootFolder = getRootPath();
    if (!rootFolder) return { error: "No folder selected" };
    try {

      const configPath = path.join(rootFolder, "rootPath.json");
      const config = JSON.parse(fs.readFileSync(configPath, "utf-8"));

      config.files = config.files || {};
      const existingNames = Object.keys(config.files);

      // duplicate checking
      let finalName = filename;
      let counter = 1;
      while (existingNames.includes(finalName)) {
        finalName = `${filename} ${counter}`;
        counter++;
      }

      //save md fil
      const filePath = path.join(rootFolder, `${finalName}.md`);
      fs.writeFileSync(filePath, content, "utf-8");

      // Update config file
      config.files[finalName] = {
        filename: `${finalName}.md`,
        path: filePath,
        bookmark: false,
        userId: userId,
        synapses: synapses,
        createdAt: new Date().toISOString(),
      };
      fs.writeFileSync(configPath, JSON.stringify(config, null, 2), "utf-8");

      const response = {
        userId: userId,
        fileName: finalName,
        content: content,
        bookmark: false,
        synapses: synapses,
        createdAt: new Date().toISOString(),
      };

      return response;
    } catch (e) {
      console.error("Error - saving -", e.message);
      return { success: false, error: e.message };
    }
  }
);

// return folder name
ipcMain.handle("get:folderName", async () => {
  try {
    //get the folder path
    const rootFolder = getRootPath();
    if (!rootFolder) return null;

    //return te basename of folder
    return path.basename(rootFolder);
  } catch (err) {
    console.error("Error - foldername - ", err);
    return null;
  }
});

// Return all markdown files
ipcMain.handle("get:allMarkdownFiles", async () => {
  try {
    const rootFolder = getRootPath();
    if (!rootFolder) return [];

    const configPath = path.join(rootFolder, "rootPath.json");
    if (!fs.existsSync(configPath)) return [];
    const config = JSON.parse(fs.readFileSync(configPath, "utf-8"));

    
    const filesData = [];
    if (!config.files) {
      console.log("No files found in config.");
      return [];
    }

    for (const [fileName, fileMeta] of Object.entries(config.files)) {
      const {
        path: filePath,
        bookmark = false,
        synapses = [],
        createdAt,
      } = fileMeta;

      let content = "";
      try {
        content = fs.readFileSync(filePath, "utf-8");
      } catch (err) {
        console.warn(`Failed to read file ${filePath}:`, err.message);
      }

      filesData.push({
        fileName: fileName.replace(/\.md$/, ""),
        content,
        bookmark,
        synapses,
        createdAt,
      });
    }
    // console.log(filesData);
    return filesData;
  } catch (err) {
    console.error("Error - allmarkdown -", err);
    return [];
  }
});


ipcMain.handle("update-markdown", async (event, { fileName, content, synapses }) => {
    try {
      const rootFolder = getRootPath();
      if (!rootFolder) throw new Error("No folder selected");

      const configPath = path.join(rootFolder, "rootPath.json");
      const config = JSON.parse(fs.readFileSync(configPath, "utf-8"));

      const fileEntry = config.files[fileName];

      // file existency check
      if (!fileEntry || !fs.existsSync(fileEntry.path)) {
        throw new Error("File not found in filesystem");
      }

      //update md file
      fs.writeFileSync(fileEntry.path, content, "utf-8");

      //update config file
      fileEntry.synapses = synapses;
      fileEntry.updatedAt = new Date().toISOString();
      fs.writeFileSync(configPath, JSON.stringify(config, null, 2), "utf-8");

      return {success: true};
    } catch (error) {
      console.error("Error - update - ", error);
      return { success: false, error: error.message };
    }
  }
);

ipcMain.handle("rename-file", async (event, oldName, newName) => {
  try {
    const rootFolder = getRootPath();
    if (!rootFolder) throw new Error("No vault folder selected");

    const configPath = path.join(rootFolder, "rootPath.json");
    if (!fs.existsSync(configPath)) throw new Error("Vault not initialized");

    const config = JSON.parse(fs.readFileSync(configPath, "utf-8"));
    const fileEntry = config.files[oldName];

    if (!fileEntry || !fs.existsSync(fileEntry.path)) {
      throw new Error("File not found in filesystem");
    }

    let finalName = newName.endsWith(".md") ? newName : newName + ".md";
    const newPath = path.join(path.dirname(fileEntry.path), finalName);

    fs.renameSync(fileEntry.path, newPath);
    console.log("File name changed to:", newName);

    // Update config
    delete config.files[oldName];
    fileEntry.path = newPath;
    fileEntry.filename = finalName;
    config.files[newName] = fileEntry;

    fs.writeFileSync(configPath, JSON.stringify(config, null, 2), "utf-8");

    return { success: true, message: `File renamed to ${newName}` };
  } catch (error) {
    console.error("Rename error:", error);
    return { success: false, error: error.message };
  }
});

// Additional IPC handlers
ipcMain.handle("getMarkdownFile", async (event, fileName) => {
  const rootFolder = getRootPath();
  const configPath = path.join(rootFolder, "rootPath.json");
  const config = JSON.parse(fs.readFileSync(configPath, "utf-8"));

  const fileEntry = config.files[fileName];
  if (!fileEntry) throw new Error(fileName, " File not found");

  return {
    fileName,
    content: fs.readFileSync(fileEntry.path, "utf-8"),
    synapses: fileEntry.synapses,
    bookmark: fileEntry.bookmark,
    createdAt: fileEntry.createdAt,
  };
});

ipcMain.handle("delete:markdownFile", async (event, fileName) => {
  try {
    if (!fileName) {
      throw new Error("Filename is required");
    }

    const rootFolder = getRootPath();
    if (!rootFolder) throw new Error("No vault folder selected");

    const configPath = path.join(rootFolder, "rootPath.json");
    if (!fs.existsSync(configPath)) throw new Error("Vault not initialized");

    const config = JSON.parse(fs.readFileSync(configPath, "utf-8"));

    const fileEntry = config.files?.[fileName];
    if (!fileEntry || !fs.existsSync(fileEntry.path)) {
      throw new Error("File not found in config or filesystem");
    }

    // Delete the file from filesystem
    fs.unlinkSync(fileEntry.path);

    // Remove the file entry from config
    delete config.files[fileName];

    // Save updated config
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2), "utf-8");

    return { success: true };
  } catch (error) {
    console.error("Delete error:", error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle("bookmark:set", async (event, { fileName, bookmark }) => {
  try {
    if (!fileName || typeof bookmark !== "boolean") {
      throw new Error("Invalid parameters: fileName and bookmark are required");
    }

    const rootFolder = getRootPath();
    if (!rootFolder) throw new Error("No vault folder selected");

    const configPath = path.join(rootFolder, "rootPath.json");
    if (!fs.existsSync(configPath)) throw new Error("Vault not initialized");

    const config = JSON.parse(fs.readFileSync(configPath, "utf-8"));
    const fileEntry = config.files[fileName];

    if (!fileEntry) throw new Error("File not found in config");

    // Set bookmark value
    fileEntry.bookmark = bookmark;
    fileEntry.updatedAt = new Date().toISOString();

    fs.writeFileSync(configPath, JSON.stringify(config, null, 2), "utf-8");

    return {
      success: true,
      bookmark: fileEntry.bookmark,
    };
  } catch (error) {
    console.error("Bookmark set error:", error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle(
  "save:template",
  async (event, templateName, templateLogo, fileName, content, synapses) => {
    console.log("Saving template:", templateName);

    const rootFolder = getRootPath();
    if (!rootFolder) return { error: "No folder selected" };

    try {
      // Load the existing config
      const configPath = path.join(rootFolder, "rootPath.json");
      const config = JSON.parse(fs.readFileSync(configPath, "utf-8"));

      // Ensure templates object exists
      config.templates = config.templates || {};

      // Prevent overwriting existing template
      let finalTemplateName = templateName;
      let counter = 1;
      while (config.templates.hasOwnProperty(finalTemplateName)) {
        finalTemplateName = `${templateName} ${counter}`;
        counter++;
      }

      // Add template data
      config.templates[finalTemplateName] = {
        templateName: finalTemplateName,
        templateLogo,
        fileName,
        content,
        synapses,
        createdAt: new Date().toISOString(),
      };

      // Save updated config
      fs.writeFileSync(configPath, JSON.stringify(config, null, 2), "utf-8");

      return {
        success: true,
        template: {
          templateName: finalTemplateName,
          templateLogo,
          fileName,
          content,
          synapses,
          createdAt: new Date().toISOString(),
        },
      };
    } catch (e) {
      console.error("Error saving template:", e.message);
      return { success: false, error: e.message };
    }
  }
);

ipcMain.handle("get:templates", async () => {
  try {
    const rootFolder = getRootPath();
    const configPath = path.join(rootFolder, "rootPath.json");
    const config = JSON.parse(fs.readFileSync(configPath, "utf-8"));

    // Extract the templates object and convert it to an array
    const templatesArray = Object.values(config.templates || []); // Fallback to empty array if no templates found
    return { success: true, templates: templatesArray };
  } catch (error) {
    console.error("Error fetching templates:", error.message);
    return { success: false, error: error.message };
  }
});

ipcMain.handle("delete:template", async (event, templateName) => {
  try {
    const rootFolder = getRootPath();
    const configPath = path.join(rootFolder, "rootPath.json");
    const config = JSON.parse(fs.readFileSync(configPath, "utf-8"));

    if (config.templates && config.templates[templateName]) {
      // Delete the template
      delete config.templates[templateName];

      // Write the updated config back to the file
      fs.writeFileSync(configPath, JSON.stringify(config, null, 2));

      return { success: true, message: `Template "${templateName}" deleted.` };
    } else {
      return { success: false, error: `Template "${templateName}" not found.` };
    }
  } catch (error) {
    console.error("Error deleting template:", error.message);
    return { success: false, error: error.message };
  }
});

app.whenReady().then(createWindow);
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
      app.quit()
  }
})
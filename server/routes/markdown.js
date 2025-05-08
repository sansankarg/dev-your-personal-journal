const express=require('express')
const router=express.Router()
const MarkDown = require('../models/markDown')

router.post('/save-markdown', async (req, res) => {
  let { fileName, content } = req.body.newFile;
  const userId = req.body.id;

  console.log("User id:", userId);
  console.log("Save request reached server");

  if (!fileName) {
    return res.status(400).json({ message: 'File name is required.' });
  }

  try {
    const existingFiles = await MarkDown.find({ userId });
    const existingNames = existingFiles.map(f => f.fileName);

    let finalName = fileName;
    let counter = 1;
    while (existingNames.includes(finalName)) {
      finalName = `${fileName} ${counter}`;
      counter++;
    }

    const newFile = new MarkDown({
      userId,
      fileName: finalName,
      content: content || ''
    });

    await newFile.save();
    console.log("Saved with filename:", finalName);

    res.status(201).json({
      userId: userId,
      fileName: newFile.fileName,
      content: newFile.content,
      bookmark: true,
      synapses: [],
      createdAt: newFile.createdAt.toISOString()
    });

  } catch (error) {
    console.error('Error creating markdown file:', error);
    res.status(500).json({ message: 'Error creating file' });
  }
});


  //get all markdown files
  router.post('/get-markdown', async (req, res) => {
    const { userId } = req.body;
    console.log('Received userId:', userId);
  
    try {
      const files = await MarkDown.find({ userId: userId });
      console.log("Markdown files were sent.");
      res.status(200).json(files);
    } catch (error) {
      console.error('Error fetching markdown files:', error);
      res.status(500).json({ message: 'Error fetching files' });
    }
  });

  // update markdown
  router.put('/update-markdown/:id', async(req, res)=>{
    const{id} = req.params;
    const{userId, fileName, content, synapses} = req.body;
      if (!userId) {
          return res.status(400).json({ message: 'User ID is required' });
        }
      
        try {
          const updatedFile = await MarkDown.findOneAndUpdate(
            { _id: id, userId: userId },
            { fileName, content, synapses },
            { new: true }
          );
      
          if (!updatedFile) {
            return res.status(404).json({ message: 'File not found or unauthorized access' });
          }
      
          console.log("Update request for ", id, " was approved");
          res.status(200).json({ message: 'File saved successfully', data: updatedFile });
        } catch (error) {
          console.error('Error updating markdown file', error);
          res.status(500).json({ message: 'Error updating file' });
        }
  });

  // bookmark a markdown
  router.put('/bookmark-markdown/:fileId', async (req, res) => {
    const { fileId } = req.params; // Corrected to access fileId from req.params
    const { userId, bookmark } = req.body;  // Get userId and bookmark from request body
    
    console.log("Bookmark update request received for ID:", fileId, "User ID:", userId, "Bookmark:", bookmark);
  
    try {
      // Find the file by fileId and userId
      const file = await MarkDown.findOne({ fileName: fileId, userId: userId });
  
      if (!file) {
        return res.status(404).json({ message: 'File not found or access denied' });
      }
  
      // Update the bookmark field of the found file
      file.bookmark = bookmark;
      const updatedFile = await file.save();
  
      console.log(`Bookmark ${bookmark ? 'added' : 'removed'} successfully for ID:`, fileId);
  
      res.status(200).json({
        message: `File ${bookmark ? 'bookmarked' : 'unbookmarked'} successfully`,
        data: updatedFile,
      });
    } catch (error) {
      console.error('Error updating bookmark for markdown file:', error);
      res.status(500).json({ message: 'Error updating bookmark' });
    }
  });  

  // delete a markdown
  router.delete('/delete-markdown', async (req, res) => {
    const {userId, markDownId} = req.body;
    console.log("Delete request received for ID:", markDownId, "and User ID:", userId);
  
    try {
      const file = await MarkDown.findOne({ fileName : markDownId, userId: userId });
  
      if (!file) {
        return res.status(404).json({ message: 'File not found or access denied' });
      }
  
      await MarkDown.findOneAndDelete({ fileName : markDownId});
      console.log("File deleted successfully for ID:", markDownId);
  
      res.status(200).json({ message: 'File deleted successfully' });
    } catch (error) {
      console.error('Error deleting markdown file:', error);
      res.status(500).json({ message: 'Error deleting file' });
    }
  });

  // To get markdown by id
  router.post('/get-markdown/:id', async(req, res)=>{
    const{id} = req.params;
    const {userId} = req.body;
    console.log("User id : ",userId)
    try {
      const file = await MarkDown.findOne({ fileName : id });
      if (!file) {
        return res.status(404).json({ message: 'File not found' });
      }
      console.log("Get request for ",id," was approved");
      res.status(200).json(file);
    } catch (error) {
      console.error('Error fetching markdown file by ID:', error);
      res.status(500).json({ message: 'Error fetching file' });
    }
  })

  // get markdown by synapse
  router.post('/search-by-synapse', async (req, res) => {
    const { synapseWord } = req.body;
    console.log("Searching for synapse word: ", synapseWord);
  
    if (!synapseWord || synapseWord.trim() === "") {
      console.log("No synapse word provided");
      return res.status(200).json([]);
    }
  
    try {
      const regex = new RegExp(synapseWord, 'i');
  
      const files = await MarkDown.find({ synapses: { $regex: regex } });
  
      if (!files.length) {
        return res.status(404).json({ message: 'No files found with the given synapse word' });
      }
  
      const matchedFiles = files.map(file => {
        const matchedSynapses = file.synapses.filter(synapse => {
          return new RegExp(synapseWord, 'i').test(synapse);
        });
  
        return {
          ...file.toObject(),
          matchedSynapses: matchedSynapses,
        };
      });
  
      console.log("Files found for synapse word:", synapseWord);
      res.status(200).json(matchedFiles);
  
    } catch (error) {
      console.error('Error searching files by synapse word:', error);
      res.status(500).json({ message: 'Error fetching files' });
    }
  });

  //get markdown by for linking
  router.post('/get-markdown-to-link', async (req, res) => {
    const userId = req.body.userId;
  
    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }
  
    console.log("Fetching files for userId:", userId);
  
    try {
      const files = await MarkDown.find({ userId: userId }).select('fileName _id');
      res.status(200).json(files);
    } catch (error) {
      console.error('Error fetching markdown files:', error);
      res.status(500).json({ message: 'Error fetching files' });
    }
  });




module.exports=router
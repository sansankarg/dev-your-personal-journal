const express = require('express');
const router = express.Router();
const MarkDown = require('../models/markDown');

router.post('/', async (req, res) => {
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

module.exports = router;

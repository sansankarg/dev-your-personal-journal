const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const cookieParser=require('cookie-parser')

const app = express();

app.use(cors({
  origin: true, 
  credentials: true, 
}));
app.use(bodyParser.json());
app.use(cookieParser())
app.use(express.json())

mongoose.connect('mongodb+srv://dev:ArthurRevolt@projectiii.ww0j5.mongodb.net/?retryWrites=true&w=majority&appName=projectiii', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.log('Error connecting to MongoDB', err));



const user = require('./routes/user');
app.use('/', user);

const template = require('./routes/template');
app.use('/', template);

const markdown = require('./routes/markdown');
app.use('/', markdown);


const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log("Server running on port 5000");
});


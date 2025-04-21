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

mongoose.connect(`${process.env.REACT_APP_BACKEND_URL}`, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.log('Error connecting to MongoDB', err));


const loginRoute=require('./routes/login')
app.use('/login',loginRoute)

const registrationRoute=require('./routes/registraion')
app.use('/signup',registrationRoute)


const logoutRoute=require('./routes/logout')
app.use('/logout',logoutRoute)

const checkauth=require('./routes/checkauth')
app.use('/checkauth',checkauth)

const getMarkDown = require('./routes/getMarkDown')
app.use('/get-markdown',getMarkDown)

const addTemplate = require('./routes/addTemplate')
app.use('/add-template',addTemplate)

const getTemplate = require('./routes/getTemplates')
app.use('/get-template',getTemplate)

const deleteTemplate = require('./routes/deleteTemplate')
app.use('/delete-template',deleteTemplate)

const getMarkDownById = require('./routes/getMarkDownById')
app.use('/get-markdown/:id', (req, res, next)=>{
  console.log("Get request reached server to get markdown: ", req.params.id)
  res.locals.id = req.params.id;
  next();
})
app.use('/get-markdown/:id', getMarkDownById)

const updateMarkDownById = require('./routes/updateMarkDownById')
app.use('/update-markdown/:id', (req, res, next)=>{
  console.log("Update request reached server to update markdown : ", req.params.id)
  // console.log("File name : ",req.body.fileName);
  // console.log("Content : ",req.body.content);
  console.log("synapse : ",req.body.synapses);
  res.locals.id = req.params.id;
  res.locals.content = req.body.content;
  res.locals.fileName = req.body.fileName;
  res.locals.synapses = req.body.synapses;
  res.locals.userId = req.body.userId;
  next();
})
app.use('/update-markdown/:id', updateMarkDownById)

const deleteMarkDownById = require('./routes/deleteMarkDownById')
app.use('/delete-markdown/:id', (req, res, next)=>{
  console.log("Delete request reached server of id : ",req.params.id);
  res.locals.id = req.params.id;
  next();
})
app.use('/delete-markdown/:id',deleteMarkDownById)

const bookMarkMarkDownById = require('./routes/bookMarkMarkDownById')
app.use('/bookmark-markdown/:id', (req, res, next)=>{
  console.log("Bookmark request reached server of id : ",req.params.id);
  res.locals.id = req.params.id;
  res.locals.bookmark = req.body.bookmark;
  next();
})
app.use('/bookmark-markdown/:id',bookMarkMarkDownById)

const saveMarkDown = require('./routes/saveMarkdown');
app.use('/save-markdown',saveMarkDown);

const getMarkDownToLink = require('./routes/getMarkDownToLink');
app.use('/get-markdown-to-link',getMarkDownToLink);

const getMarkDownBySynapse = require('./routes/getMarkDownBySynapse');
app.use('/search-by-synapse',getMarkDownBySynapse);

const getBookMarkedMarkDown = require('./routes/getBookMarkedMarkDown');
app.use('/get-bookmarked-markdown',getBookMarkedMarkDown);


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

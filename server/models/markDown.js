const mdb=require('mongoose')
const markDown =mdb.Schema({
  fileName: { type: String, required: true },
  content: { type: String },
  bookmark: { type: Boolean, default: false },
  synapses : [String],
  createdAt: { type: Date, default: Date.now },
  userId : String
}, {collection: 'markdowns'})
var markdown_schema=mdb.model('markdowns',markDown)
module.exports = markdown_schema;
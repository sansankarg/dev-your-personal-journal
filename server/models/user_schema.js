const mdb=require('mongoose')
const bcrypt=require('bcrypt')
var userSchema=mdb.Schema({
    firstName:String,
    lastName:String,
    email: { type: String, unique: true, required: true},
    haven:String,
    password: { type: String, required: true, minlength: 6 },
    synapses: [String],
    templates: [{
        templateName: { type: String},
        templateLogo: String,
        fileName: { type: String, required: true },
        content: { type: String },
        synapses : [String],
        createdAt: { type: Date, default: Date.now },
      }]
})

userSchema.pre('save',async function(next){
    if (!this.isModified('password')) {
        return next();
    }
    const salt=await bcrypt.genSalt();
    this.password = await bcrypt.hash(this.password,salt);
    next();
})

var user_schema=mdb.model("User",userSchema)
module.exports=user_schema
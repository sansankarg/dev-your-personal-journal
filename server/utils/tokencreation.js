const jwt=require('jsonwebtoken')
const expiryTime=2*24*60*60;
const createToken=(id)=>{
    console.log("Token created");
    return jwt.sign({id},'ifyouarebadiamyourdadthenwhoisyourmothermywifey',{
        expiresIn:expiryTime
    })
}
module.exports=createToken

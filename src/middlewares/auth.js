const jwt = require("jsonwebtoken");
const bookModel = require("../models/booksModel");

////---------///-authentication-----/////

const authentication = async function(req, res, next){
    try{
        const token = req.headers["x-api-key"];
        // console.log(token)
        if(!token){
            return res.status(400).send({status:false, msg: "login is required, token set in header"})
        }
        const decodedtoken =jwt.verify(token, "him104")
        if(!decodedtoken){
            return res.status(400).send({status:false, msg: "token is invalid"})
        }

        next();
    }
    catch(error){
        return res.status(500).send({msg: error.message})
    }
}

let authorization = async function (req, res, next) {
    try {
        let token = req.headers["x-api-key"];
        let decodedtoken = jwt.verify(token, "him104")
        
        let bookId = req.params.bookId;
        
        let book = await bookModel.findById(bookId)
   
        if(!book){
            return res.status(404).send({ status: false, msg: "There is no data inside the database with this id" }) }

        if (decodedtoken.userId != book.userId) {
             return res.status(401).send({ status: false, msg: "You are not authorised" }) }
        next()
    }
    catch (error) {
        return res.status(500).send({ msg: error.message })
    }
}


module.exports.authentication= authentication
module.exports.authorization = authorization
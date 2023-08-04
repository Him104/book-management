const booksModel = require("../models/booksModel");
const validator = require("validator");
const reviewModel =require("../models/reviewModel")
const mongoose=require("mongoose")
const isValid = function(value){
    if(typeof (value) === 'undefined' || value === null) return false
    if(typeof (value) === 'string' && value.trim().length == 0) return false
    return true
}

        const isValidObjectId = function (objectId) {
            return mongoose.Types.ObjectId.isValid(objectId)}

let createBook = async function (req, res){
    try {
        const data = req.body;
        
        if (Object.keys(data).length == 0){
            return res.status(400).send({ status: false, msg: "Please, provide some data" }) }
//--------------checking of data comes to body---------------
        if (!isValid(data.title)) {
             return res.status(400).send({ status: false, message: "title is Required" }) }
        if (!isValid(data.excerpt)) {
             return res.status(400).send({status: false, message: "Excerpt is Requird" }) }
        if (!isValid(data.userId)) {
             return res.status(400).send({ status: false, message: "User id required!" }) }
    //   if (decodedtoken.userId != data.userId){
    // return res.status(400).send({status:false, msg:"userId not match current users"})
    //  }

        if (!isValid(data.ISBN)) {
             return res.status(400).send({ status: false, message: "ISBN is required" }) }
        if (!isValid(data.category)) {
             return res.status(400).send({ status: false, message: "Category is Required" }) }
        if (!isValid(data.subcategory)) {
             return res.status(400).send({ status: false, message: "Subcategory is Required" }) }

        
// -----check duplicate data---------/
        const duplicteTitle = await booksModel.findOne({ title: data.title })
        if (duplicteTitle) {
             return res.status(404).send({ status: false, message: "title already exists, title must be unique" }) }
        const duplicateISBN = await booksModel.findOne({ ISBN: data.ISBN })
        if (duplicateISBN) {
             return res.status(404).send({ status: false, message: "ISBN already exists, ISBN must be unique" }) }

        let savedData = await booksModel.create(data)
        res.status(201).send({ status: true, msg: 'created book sucssesfully', data: savedData })
    }
    catch (error) {
        return res.status(500).send({status:false, msg: error.message })
    }
}
let getBook = async function (req, res) {
    try {

        const data = req.query
        
        if (!isValidObjectId(data.userId)) { 
            return res.status(400).send({ status: false, msg: 'Please provide a valid user Id' }) }

        
        // if (Object.keys(data).length == 0){
        //      return res.status(400).send({ status: false, msg: "Please, provide some data" }) }
             if(!isValid(data.userId)){
                 return res.status(400).send({status:false,msg: "userId is invalid"})

            }
        const filter ={
            ...data,
            isDeleted: false
        }     
        const book = await booksModel.find(filter,{isDeleted:false})
         .select({  title: 1, excerpt: 1, userId: 1, category: 1, releasedAt: 1, reviews: 1 })
         .sort({ title: 1 })
        if (book.length === 0) { 
            return res.status(404).send({ status: false, message: "No book found according to your search" })
        }
        return res.status(200).send({ status: true, totalBooks: book.length, data: book })
    }
    catch (error) {
        return res.status(500).send({ status: false, message: error.message })
    }
}

const getBooksById = async function (req, res) {
    try {
        const bookId = req.params.bookId;

        if (!isValidObjectId(bookId)) { 
            return res.status(400).send({ status: false, msg: 'Please provide a valid Book Id' }) }
        if (Object.keys(bookId) == 0){
             return res.status(400).send({ status: false, msg: "BAD REQUEST provide some data in param" }) }

        const books = await booksModel.findOne({ _id: bookId, isDeleted: false }).lean();
        if (!books)
         return res.status(404).send({ status: false, message: "No book found according to your search" })

        const reviews = await reviewModel.find({ bookId: books._id, isDeleted: false })
    
        
        books["reviewsData"] = reviews
console.log(reviews)
        return res.status(200).send({ status: true, message: 'Book detailed', data: books });
    }
    catch (error) {
        res.status(500).send({ status: false, error: error.message })
    }
}
const updateBooks = async function (req, res) {
    try {
        const data = req.body
        
        
        if (Object.keys(data) == 0) {
             return res.status(400).send({ status: false, message: "Enter data to update" }) }

        let bookId = req.params.bookId;
        // if (!isValidObjectId(bookId)) { 
        //     return res.status(400).send({ status: false, msg: 'Please provide a valid Book Id' }) }

        const book = await booksModel.findById(bookId)
        if (!book){
             return res.status(400).send({ status: false, msg: "No book find with this id, Check your id." }) }
//------------ check duplication ----------////
        const dataDup = await booksModel.findOne({ title: data.title })
        if (dataDup){ 
            return res.status(400).send({ status: false, msg: "title cannot be duplicate" }) }

        const ISBNDup = await booksModel.findOne({ ISBN: data.ISBN })
        if (ISBNDup){
             return res.status(400).send({ status: false, msg: "ISBN cannot be duplicate" }) }

        if (book.isDeleted == true) { 
            return res.status(400).send({ status: false, msg: "book is already deleted." }) }

        const updatedBooks = await booksModel.findOneAndUpdate({ _id: bookId,isDeleted:false },
            
            { $set: { title: data.title, excerpt: data.excerpt,category: data.category,subcategory: data.subcategory, releasedAt: data.releasedAt, ISBN: data.ISBN } },
            { new: true })
            
        return res.status(201).send({ status: true, data: updatedBooks })
    }
    catch (error) {
        res.status(500).send({ status: false, error: error.message })
    }
}
const deleteBook = async function (req, res) {
    try {
        const bookId = req.params.bookId
       
        const book = await booksModel.findById(bookId)
        if (!book){
             return res.status(404).send({ status: false, message: "book is not found" }) }
        if (book.isDeleted == true){
             return res.status(400).send({ status: false, msg: "Books has already deleted" }) }

        const deletedBooks = await booksModel.findOneAndUpdate({ _id: bookId },
            { $set: { isDeleted: true } }, { new: true })
        return res.status(201).send({ status: true, msg: "Book Deleted Successfully" })
    }
    catch (err) { return res.status(500).send({ status: false, message: err.message }) }
}

module.exports.createBook=createBook
module.exports.getBook = getBook
module.exports.getBooksById = getBooksById 
module.exports.updateBooks = updateBooks
module.exports.deleteBook=deleteBook
const booksModel = require("../models/booksModel");
const reviewModel =require("../models/reviewModel")
const validator = require("validator");
const mongoose = require("mongoose")
const isValid = function(value){
    if(typeof (value) === 'undefined' || value === null) return false
    if(typeof (value) === 'string' && value.trim().length == 0) return false
    return true
}
const isValidObjectId = function (objectId) {
    return mongoose.Types.ObjectId.isValid(objectId)}


const isValidRequestBody = function (requestBody) {
    return Object.keys(requestBody).length > 0
}


const createReview = async function (req, res) {
    try {
        let bookID = req.params.bookId
        let data= req.body

        // if (!bookID)
        //     return res.status(400).send({ status: false, msg: "Bad Request, please provide BookId in params" })

        let checkbook = await booksModel.findOne({ _id: bookID, isDeleted: false })
        if (!checkbook){
            return res.status(404).send({ status: false, message: "No book found" })
        } 
            
    if (!isValid(data.reviewedby)) {
                return res.status(400).send({ status: false, msg: "Name should be a valid String " })
            }
            if (!isValid(data)) {
                return res.status(400).send({ status: false, msg: "please provide  details" })
            }

            let result = {}
            let bookId = bookID
            let reviewedby = data.reviewedby
            let rating = data.rating
            let reviewedAt = new Date()
            let review=data.review

            if (!(rating >= 1 && rating <= 5)) {
                return res.status(400).send({ status: false, msg: "Rating should be inbetween 1-5 " })
            }
            //DESTRUCTURE
            result = { bookId, reviewedby, rating, reviewedAt, review }
    
            //CREATE REVIEW DOCUMENT
            let ReviewCreate = await reviewModel.create(result)
            
            //FIND ID AND UPDATE REVIEW
    
            let UpdateCountReview = await booksModel.findByIdAndUpdate({ _id: bookID }, { $inc: { reviews: 1 } })
    
            //SELECT PARTICULAR KEY
            let ShowReview = await reviewModel.findOne({ _id: UpdateCountReview._id })
            .select({ _id: 1, bookId: 1, reviewedBy: 1, reviewedAt: 1, rating: 1, review: 1 }).populate("bookId")
    
            return res.status(201).send({ Status: true, message: 'Success', data: {ReviewCreate,ShowReview} })
          
        }
        
    
    catch (err) {
        console.log(err)
        res.status(500).send({ status: false, msg: "error", err: err.message })

    }
}
const updateReviews = async function (req, res){
    try {
        const bookId = req.params.bookId;
        if (!isValidObjectId(bookId)) { 
            return res.status(400).send({ status: false, msg: 'Please provide a valid Book Id' }) }
        if (!bookId)
            return res.status(400).send({ status: false, msg: "Bad Request, please provide BookId in params" })
        const reviewId = req.params.reviewId;
        if (!isValidObjectId(reviewId)) { 
            return res.status(400).send({ status: false, msg: 'Please provide a valid Review Id' }) }

       if (!reviewId)
            return res.status(400).send({ status: false, msg: "Bad Request, please provide reviewId in params" })
        const data = req.body;
        console.log(data)
        if(Object.keys(data)==0){
            return res.status(400).send({status: false, message: "Enter some data for update"})}
        if (!(data.rating >= 1 && data.rating <= 5)) {
             return res.status(400).send({ status: false, message: "Rating value should be between 1 to 5" }) }

        let book = await booksModel.findOne({ _id: bookId, isDeleted: false })
        if (!book) {
             return res.status(404).send({ status: false, message: "No book exist with this id" }) }

        let checkReviewId = await reviewModel.findOne({ _id: reviewId, isDeleted: false })
        if (!checkReviewId){ 
            return res.status(400).send({ status: false, message: "No review exist with this id" }) }

        let updateReview = await reviewModel.findOneAndUpdate({ _id: reviewId, bookId: bookId },
            { $set: { review: data.review, rating: data.rating, reviewedBy: data.reviewedBy, reviewedAt: data.reviewAt } }, { new: true })

        let result = {
            bookId: book._id,
            title: book.title,
            excerpt: book.excerpt,
            userId: book.userId,
            category: book.category,
            reviews: book.review,
            releasedAt: book.releasedAt,
            reviewsData: updateReview
        };
        return res.status(200).send({ status: true, message: "Review updated successfully", bookDetailsWithReview: result })
    }
    catch (error) {
        return res.status(500).send({ status: false, error: error.message })
    }
}
const deleteReview = async function(req, res) {
    try {
        let reviewId = req.params.reviewId
        if (!isValidObjectId(reviewId)) { 
            return res.status(400).send({ status: false, msg: 'Please provide a valid Review Id' }) }
        if (!reviewId)
            return res.status(400).send({ status: false, msg: "Bad Request, please provide reviewId in params" })
        let bookId = req.params.bookId
        if (!isValidObjectId(bookId)) { 
            return res.status(400).send({ status: false, msg: 'Please provide a valid Book Id' }) }
        if (!bookId)
            return res.status(400).send({ status: false, msg: "Bad Request, please provide BookId in params" })
        
        let book = await booksModel.findOne({ _id: bookId, isDeleted: false });
        if (!book) { return res.status(404).send({ status: false, message: "No book exist with this id" }) }

        let review = await reviewModel.findOne({ _id: reviewId, bookId: bookId });
        if (!review) {
             return res.status(400).send({ status: false, msg: "Review id should be checked, id is not from this book." }) }
        if (review.isDeleted == true) {
             return res.status(400).send({ status: false, msg: "Review has already been deleted" }) }

        let deleteRev = await reviewModel.findOneAndUpdate({ _id: review._id, bookId: review.bookId, isDeleted: false },
            { $set: { isDeleted: true } })
        let deleteReview = await booksModel.findOneAndUpdate({ _id: book._id },{ $inc: { review: -1 } })
        return res.status(200).send({ status: true, message: "Review deleted successfully",data:{deleteRev,deleteReview}})
    }
    catch (error) {
        return res.status(500).send({ status: false, error: error.message })
    }
}
module.exports.createReview=createReview
module.exports.updateReviews=updateReviews
module.exports.deleteReview =deleteReview




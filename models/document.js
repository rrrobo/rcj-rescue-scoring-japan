const mongoose = require('mongoose')
const validator = require('validator')
const Schema = mongoose.Schema
const ObjectId = Schema.Types.ObjectId

const logger = require('../config/logger').mainLogger


const reviewSchema = new Schema({
  team: {type: ObjectId, ref: 'Team'},
  competition: {type: ObjectId, ref: 'Competition'},
  reviewer: {type: ObjectId, ref: 'User'},
  name: {type: String, default: ''},
  comments: [[{type: String, default: ''}]]
})


const review = mongoose.model('review', reviewSchema)


/** Mongoose model {@link http://mongoosejs.com/docs/models.html} */
module.exports.review = review

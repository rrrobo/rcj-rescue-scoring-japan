const mongoose = require('mongoose')
const validator = require('validator')
const Schema = mongoose.Schema
const ObjectId = Schema.Types.ObjectId
const competitiondb = require('./competition');
const {LEAGUES} = competitiondb;
const QUESTION_TYPES = ['input', 'select', 'scale'];

const logger = require('../config/logger').mainLogger


const surveySchema = new Schema({
  competition: {type: ObjectId, ref: 'Competition'},
  i18n:[{
    language : {type: String, default: ''},
    name: {type: String, default: ''},
    topDescription: {type: String, default: ""},
  }],
  league: [{type: String, enum: LEAGUES}],
  team: [{type: ObjectId, ref: 'Team'}],
  deadline: {type: Date, default: Date.now},
  enable: {type: Boolean, default: false},
  reEdit: {type: Boolean, default: false},
  languages: [{
    language: {type: String, default: ''},
    enable: {type: Boolean, default: true}
  }],
  questions: [{
    questionId: {type: String, unique: true},
    type: {type: String, enum: QUESTION_TYPES},
    scale: {
      least: {type: Number, default: 1},
      most: {type: Number, default: 5}
    },
    i18n:[{
      language : {type: String, default: ''},
      title: {type: String, default: ''},
      description: {type: String, default: ''},
      options: [{
        value: {type: String, default: ''},
        text: {type: String, default: ''}
      }]
    }]
  }]
})

const surveyAnswerSchema = new Schema({
  competition: {type: ObjectId, ref: 'Competition'},
  team: {type: ObjectId, ref: 'Team'},
  survey: {type: ObjectId, ref: 'survey'},
  answer:[{
    questionId: {type: String},
    answer: {type: String, default: null}
  }]
})


const survey = mongoose.model('survey', surveySchema)
const surveyAnswer = mongoose.model('surveyAnswer', surveyAnswerSchema)


/** Mongoose model {@link http://mongoosejs.com/docs/models.html} */
module.exports.survey = survey
module.exports.surveyAnswer = surveyAnswer
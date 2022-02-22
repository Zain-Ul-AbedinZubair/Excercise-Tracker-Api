const express = require('express')
const app = express()
const cors = require('cors')
const mongoose = require('mongoose')
const mongodb = require ('mongodb')
const bodyParser = require('body-parser')
const { text } = require('body-parser')
require('dotenv').config()

app.use(cors())
app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});
const URL ='mongodb+srv://one:one123456789@cluster0.imlc6.mongodb.net/oneone?retryWrites=true&w=majority'
mongoose.connect(URL, { useNewUrlParser: true, useUnifiedTopology: true });




const listener = app.listen(process.env.PORT || 8000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})


// Creating a Schema
 let excerciseSessionSchema = new mongoose.Schema({
   description : {type: String, required:true},
   duration : {type: Number, required:true},
   date:String,
 }) 

//  Creating a new schema

let userSchema = new mongoose.Schema({
  username: {type: String , required:true},
  log:[excerciseSessionSchema]
})

// Create some models

let Session = mongoose.model('Session', excerciseSessionSchema) 
let User = mongoose.model('User', userSchema)
// api post user
app.post('/api/exercise/new-user', bodyParser.urlencoded({ extended: false }), (request,response) => {
// console.log(request.body);
let newUser =  new User({username: request.body.username})
newUser.save((error, savedUser) =>  {
  if(!error){
    let responseObject = {}
    responseObject['username'] = savedUser.username
    responseObject['_id'] = savedUser.id
    response.json(responseObject)
  }
  
})
 
})
 
// seting api userdata

app.get('/api/excercise/users', (request,response) => {
  //first we will find all the users in the mongodb
  User.find({}, (error,arraysofUsers) => {
    if(!error){
      response.json(arraysofUsers)
    }

  })

})
// API post
app.post('/api/exercise/add', bodyParser.urlencoded({ extended: false }) , (request,response) => {
let newSession = new Session({
  description: request.body.description,
  duration: parseInt(request.body.duration),
  date: request.body.date
})

if (newSession.date === ''){
  newSession.date = new Date().toISOString().substring(0,10)
}
// User.findByIdAndUpdate(
//   request.body.userId,
//   {$push:{log: newSession}},
//   {new:true},
//    {error, updatedUser} => [let responseObject = {}
//       responseObject [Obj.id] : updatedUser.id
//       responseObject ['username'] : updatedUser.username
//       responseObject ['date'] : new Date(newSession.date).toDateString()
//       responseObject ['description'] : newSession.description
//       responseObject ['duration'] : newSession.duration
//       response.json(responseObject)
//    ]

//  )
// })
User.findByIdAndUpdate(
  request.body.userId,
  {$push : {log: newSession}},
  {new: true},
  (error, updatedUser)=> {
    if(!error){
      let responseObject = {}
      responseObject['_id'] = updatedUser.id
      responseObject['username'] = updatedUser.username
      responseObject['date'] = new Date(newSession.date).toDateString()
      responseObject['description'] = newSession.description
      responseObject['duration'] = newSession.duration
      response.json(responseObject)
    }
  }
)
})


app.get('/api/excercise/log', (request,response) => {

  User.findById(request.query.userId, (error, result) => {
    if (!error) {
      let responseObject = result
      if (request.query.limit){
        responseObject.log = responseObject.log.slice(0, request.query.limit) 
      }
      if (request.query.from || request.query.to){
        let fromDate = new Date(0)
        let toDate = new Date()

      } 
      if (request.query.from) {
        fromDate = new Date(request.query.from);

      }
      if (request.query.to) {
        toDate = new Date(request.query.to)
      }
      fromDate = fromDate.getTime()
      toDate = toDate.getTime()
      requestObject.log = requestObject.log.filter((session ) => {
        let sessionDate = new Date(session.date).getTime()

        return sessionDate >= from && sessionDate <= toDate  
      })
      // let responseObject = result
      responseObject['count'] = result.log.length
      response.json(responseObject)
    }

  });
// response.json({})
} )
require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors')
const uuidv1 = require('uuid/v1');
const request = require('request');
const app = express();

const bcrypt = require('bcrypt');
const saltRounds = 10;
const myPlaintextPassword = 's0/\/\P4$$w0rD';
const someOtherPlaintextPassword = 'not_bacon';

const cookieSession = require('cookie-session')

const PORT = process.env.PORT || 3000;



app.use(cookieSession({
  name: 'session',
  keys: [uuidv1()],

  // Cookie Options
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}))

app.use(cors())

app.use(express.static('public'));

app.use(bodyParser.urlencoded({extended: false}));

app.use(bodyParser.json());

mongoose.connect('mongodb://heroku_k7rh272q:fvpv0hga5sdt55h80e657lb47r@ds261969.mlab.com:61969/heroku_k7rh272q');

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log('Database conntected!')
});

//SCHEMA
var Schema = mongoose.Schema;

var UserSchema = new Schema({
  email: {
    type: String,
    unique: true,
    required: true,
    trim: true
  },
  username: {
    type: String,
    unique: true,
    required: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
  },
  clanName: {
    type: String,
    required: false
  },
  motorbikeType: {
    type: String,
    required: false
  }
});

var ClanSchema = new Schema({
  clanName: {
    type: String,
    unique: true,
    required: true
  },
  clanImage: {
    type: String,
    unique: true,
    required: false
  },
  clanMembers: {
    type: Array,
    required: false,
  }
});

var LocationSchema = new Schema({
  locationName: {
    type: String,
    unique: true,
    required: true
  },
  locationMembers: {
    type: Array,
    unique: true,
    required: false
  },
  locationId: {
    type: String,
    unique: true,
    required: true
  }
});

UserSchema.pre('create', function(next) {
    var user = this;

    // generate a salt
    bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) {
        if (err) return next(err);

        // hash the password using our new salt
        bcrypt.hash(user.password, salt, function(err, hash) {
            if (err) return next(err);

            // override the cleartext password with the hashed one
            user.password = hash;
            next();
        });
    });
});

UserSchema.methods.comparePassword = function(candidatePassword, cb) {
    bcrypt.compare(candidatePassword, this.password, function(err, isMatch) {
        if (err) return cb(err);
        cb(null, isMatch);
    });
};

var User = mongoose.model('User', UserSchema);
module.exports = User;
var Clan = mongoose.model('Clan', ClanSchema);
module.exports = Clan;
var LocationName = mongoose.model('Location', LocationSchema);
module.exports = LocationName;

app.post('/register', function(req, res){

  if (req.body.email &&
    req.body.username &&
    req.body.password &&
    req.body.clanName &&
    req.body.motorbikeType) {

    let userData = {
      email: req.body.email,
      username: req.body.username,
      password: req.body.password,
      clanName: req.body.clanName,
      motorbikeType: req.body.motorbikeType
    }
    //use schema.create to insert data into the db
    User.create(userData, function (err, user) {
        if (err) return res.status(500).send(err);
        return res.sendStatus(201);
    });
  }
  else {
    return res.sendStatus(400)
  }
});

app.post('/login', function(req, res){
  if(req.session.email){
    console.log("User already logged in: " + req.session.email)
    return res.sendStatus(208)
  }
  if (
    req.body.email &&
    req.body.password) {
    let userData = {
      email: req.body.email,
      password: req.body.password
    }

    let queryObject = {};
    queryObject.email = userData.email
    //use schema.create to insert data into the db
    User.findOne(queryObject).exec(function (err, user) {
        if (err) return res.status(500).send(err);
        user.comparePassword(userData.password, function(err, isMatch){
          if (err) return res.status(500).send(err);
          if (isMatch){
            req.session.email = userData.email;
            res.sendStatus(200);
          } else {
            return res.sendStatus(403);
          }
        })
    });
  }
  else {
    return res.sendStatus(400)
  }
});

app.get('/login', function(req,res){
  let loginObj = {};
  if(req.session.email){
    loginObj.email = req.session.email;
    res.send(200).json(loginObj);
  }
  else{
    res.send(200).json(loginObj)
  }
})

app.get('/logout',function(req,res){
    req.session = null;
    return res.sendStatus(200);
});


app.post('/createClan', function(req, res){
  if(req.session.username === "admin"){
    if (req.body.clanName &&
      req.body.clanImage &&
      req.body.clanMembers) {

      let clanData = {
        clanName: req.body.clanName,
        clanImage: req.body.clanImage,
        clanMembers: req.body.clanMembers
      }
      //use schema.create to insert data into the db
      Clan.create(clanData, function (err, clan) {
          if (err) return res.status(500).send(err);
          return res.sendStatus(201);
      });
    }
  }else {
    return res.sendStatus(403);
  }
});


app.post('/checkin', function(req, res){
    if (req.body.locationId &&
        req.body.locationName) {

      let locationData = {
        locationId: req.body.locationId,
        locationName: req.body.locationName,
        locationMembers: []
      }

      let query = {};
      query.locationId = locationData.locationId;

      LocationName.findOne(query, function(err, location){
        if (err) return res.status(500).send(err);
        if (location) {
          console.log("CHECKIN: Checking into an existing location.")
          if (location.locationMembers.includes(req.session.email) ){
            console.log("CHECKIN: User already checking in to this location.")
            return res.sendStatus(208);
          }
          if (req.session.email){
            location.locationMembers.push(req.session.email)
            Location.update(location, function(err, updateRes){
              if (err) return res.status(500).send(err);
              return res.sendStatus(200);
            })
          } else {
            console.log("CHECKIN: User not authenticated.")
            return res.sendStatus(403);
          }

        } else {
          console.log("CHECKIN: Creating new location and checking in.")
          //use schema.create to insert data into the db
          if (req.session.email){
            locationData.locationMembers.push(req.session.email)
            LocationName.create(locationData, function (err, clan) {
                if (err) return res.status(500).send(err);
                return res.sendStatus(201);
            });
          } else {
            console.log("CHECKIN: User not authenticated.")
            return res.sendStatus(403);
          }
        }

      });
    }
    else {
      console.log("CHECKIN: Wrong data received from client.")
      return res.sendStatus(400)
    }
});

app.listen(PORT, () => {
  console.log(`Server running on ${PORT}/`);
});

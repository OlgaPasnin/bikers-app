require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors')
const uuidv1 = require('uuid/v1');

const app = express();

const bcrypt = require('bcrypt');
const saltRounds = 10;
const myPlaintextPassword = 's0/\/\P4$$w0rD';
const someOtherPlaintextPassword = 'not_bacon';

const cookieSession = require('cookie-session')

const PORT = process.env.PORT || 3000;
const SALT_WORK_FACTOR = 10;


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
// mongoose.connect('mongodb://localhost:27017/bikersApp')

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
    unique: false,
    required: false
  },
  locationId: {
    type: String,
    unique: true,
    required: true
  }
});

// Before creating User the password is converted to hash.
UserSchema.pre('validate', function(next) {
    var user = this;
    console.log("Generating password hash for user: " + user.email);

    // generate a salt
    bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) {
        console.log("Gen salt err: " + err)
        if (err) return next(err);

        // hash the password using our new salt
        bcrypt.hash(user.password, salt, function(err, hash) {
            console.log("Gen hash err: " + err)
            if (err) return next(err);

            // override the cleartext password with the hashed one
            user.password = hash;
            console.log("Generated hash is: " + user.password);
            next();
        });
    });
});

// This method is comparing submitted password with the hash form the database
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

    console.log("Submitted password is " + userData.password)
    //use schema.create to insert data into the db
    User.create(userData, function (err, user) {
        if (err) return res.status(500).send(err);
        console.log("Saved password is " + user.password)
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
            console.log("Created session entry: " + req.session.email);
            res.sendStatus(200);
          } else {
            return res.sendStatus(401);
          }
        })
    });
  }
  else {
    return res.sendStatus(400)
  }
});

app.get('/login', function(req,res){
  var loginObj = {};
  console.log("Login session checking for user: " + req.session.email);
  if(req.session.email){
    loginObj.email = req.session.email;
    console.log("Reporting the following session exists: " + loginObj.email);
    res.json(loginObj);
  }
  else{
    // loginObj.email = "empty"
    res.json(loginObj)
  }
})

app.get('/logout',function(req,res){

    var query = {};
    console.log("User to log out: " + req.session.email)
    LocationName.find(query, function(err, locations){
      if (err) return res.status(500).send(err);
      if (locations) {
        console.log(locations);
        locations.forEach(function(locationItem){
          console.log(locationItem);
          console.log(locationItem.locationMembers);
          locationItem.locationMembers.forEach(function(locationMembersItem, index, object){
            if(locationMembersItem.includes(req.session.email)){
              object.splice(index, 1);
            }
          });
          console.log(locationItem.locationMembers);
          locationItem.save();
        });
      }

      req.session = null;
      return res.sendStatus(200);
    });
});


app.post('/createClan', function(req, res){
  if(req.session.username === "admin"){
    if (req.body.clanName &&
      req.body.clanImage &&
      req.body.clanMembers) {

      var clanData = {
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

    console.log("Received CHECKIN request from user: " + req.session.email);

      var locationData = {
        locationId: req.body.locationId,
        locationName: req.body.locationName,
        locationMembers: []
      }

      var query = {};
      query.locationId = locationData.locationId;

      LocationName.findOne(query, function(err, location){
        if (err) return res.status(500).send(err);
        if (location) {
          console.log("CHECKIN: Checking into an existing location.")
          if (location.locationMembers.includes(req.session.email) ){
            console.log("CHECKIN: User already checked in to this location.")
            return res.sendStatus(208);
          }
          if (req.session.email){
            location.locationMembers.push(req.session.email)
            console.log("Checkin existing location object: ");
            console.log(location);
            // Location.update(location, function(err, updateRes){
            //   if (err) return res.status(500).send(err);
            //   return res.sendStatus(200);
            // })
            location.save();
            return res.sendStatus(200);
          } else {
            console.log("CHECKIN: User not authenticated.")
            return res.sendStatus(403);
          }

        } else {
          console.log("CHECKIN: Creating new location and checking in.")
          //use schema.create to insert data into the db
          if (req.session.email){
            locationData.locationMembers.push(req.session.email)
            console.log("Checkin creation object: ");
            console.log(locationData);
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

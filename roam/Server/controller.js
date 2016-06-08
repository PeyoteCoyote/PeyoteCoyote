var express = require('express');
var app = express();
var bodyParser = require('body-parser');
// var bcrypt = require('bcrypt');
// var crypto = require('crypto');
// var yelp = require('./App/Utils/api');
// var nodemailer = require('nodemailer');
// var gmailKeys = require('./App/Utils/apiKeys').gmailKeys;
// var formattedDateHtml = require('./App/Utils/dateFormatter');
// var generateEmail = require('./App/Utils/emailGenerator');
// var boundingBoxGenerator = require('./App/Utils/boundingBoxGenerator');
// var roamOffGenerator = require('./App/Utils/roamOffGenerator');
// var saltRounds = 10;

//Frantic_Rust Requires
var fetch = require('node-fetch');
const mongoDB_API_KEY = 'yjH4qEJR-Olag89IaUTXd06IpuVDZWx1';
const baseLink_users = 'https://api.mlab.com/api/1/databases/frantic-rust-roam/collections/users?apiKey=';
const baseLink_history = 'https://api.mlab.com/api/1/databases/frantic-rust-roam/collections/history?apiKey=';
const baseLink_roams = 'https://api.mlab.com/api/1/databases/frantic-rust-roam/collections/roams?apiKey=';

//config for email SMTP for gmail. We are send email notifications to users
// var smtpConfig = { 
//   host: 'smtp.gmail.com',
//   port: 465,
//   secure: true, // use SSL 
//   auth: {
//     user: 'roamincenterprises@gmail.com',
//     pass: 'roamroam'
//   }
// };

//transport vehicle for nodemailer to send out email
// var transporter = nodemailer.createTransport(smtpConfig); 

var getUser = (username, password, res) => {
  fetch(baseLink_users + mongoDB_API_KEY)
    .then((response) => response.json())
      .then((responseData) => {
        var flag = false;
        var id, name, usernameFetched, passwordFetched, currentlocation, phone;
        for (var i = 0; i < responseData.length; i++) {
          if (responseData[i].username === username && responseData[i].password === password) {
            id = responseData[i]._id.$oid;
            name = responseData[i].name;
            usernameFetched = responseData[i].username;
            passwordFetched = responseData[i].password;
            currentlocation = responseData[i].currentlocation;
            phone = responseData[i].phone;
            flag = true;
            break;
          }
        }
        const returnObj = {
          id: id,
          name: name,
          username: usernameFetched,
          password: passwordFetched,
          phone: phone,
          currentlocation: currentlocation
        };
        console.log('returnobj', returnObj);
        if (flag) {
          res.status(200).send(returnObj);
        } else {
          res.sendStatus(400);
        }
      });
};

module.exports = {
  
  signup: (req, res) => {
    const name = req.body.name;
    const username = req.body.username;
    const password = req.body.password;
    const phone = req.body.phone;
    const currentlocation = req.body.currentlocation;

    const obj = {
      name: name,
      username: username,
      password: password,
      phone: phone,
      currentlocation: currentlocation
    };
    console.log('obj.......', obj)
    //Hash password
    // bcrypt.genSalt(saltRounds, function(err, salt) {
    //   if (err) {
    //     console.log('Error generating salt', err);
    //   }
    //   bcrypt.hash(req.body.password, salt, function(err, hash) {
    //     if (err) {
    //       console.log('Error hashing password', err);
    //     }
    //     obj.password = hash;
    //   })
    // };

    fetch(baseLink_users + mongoDB_API_KEY,
    {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(obj)
    })
    .then( err => {
      getUser(obj.username, obj.password, res)
    }).catch((err) => {
        console.log('did not post user info')
        res.sendStatus(400);
    });
  },

  signin: (req, res) => {
    console.log('Logging in: ', req.body);
    const username = req.body.username;
    const password = req.body.password;
    getUser(username, password, res);
  },
}

  //Page to set up event between users, making API calls to YELP
//   roam: (req, res) => {
//     //if no match found create a pending roam node
//     if (matchResults[0].data.length === 0) {
//     console.log('nomatch');
//       var searchParams = {
//         term: 'Bars',
//         limit: 20,
//         sort: 0,
//         radius_filter: 3200, //2-mile radius
//         bounds: coords.maxLat + ',' + coords.minLong + '|' +  coords.minLat  + ',' + coords.maxLong
//       };      

//       //Creates the YELP object to make API request to yelp servers
//       yelp.searchYelp(searchParams, function(venue) {
        
//         var venueName = venue.name;
//         var venueAddress = venue.location.display_address.join(' ');

//         //Create a roam node if it doesn't exist
//         apoc.query('CREATE (m:Roam {creatorEmail: "%userEmail%", creatorLatitude: %userLatitude%, creatorLongitude: %userLongitude%, creatorRoamStart: %startRoam%, creatorRoamEnd: %roamOffAfter%, status: "Pending", venueName: "%venueName%", venueAddress: "%venueAddress%"})', { email: userEmail, userEmail: userEmail, userLatitude: coords.userLatitude, userLongitude: coords.userLongitude,
//       startRoam: times.startRoam, roamOffAfter: times.roamOffAfter, venueName: venueName, venueAddress: venueAddress }).exec().then(function(queryRes) {

//           // creates the relationship between creator of roam node and the roam node
//           apoc.query('MATCH (n:User {email:"%email%"}), (m:Roam {creatorEmail: "%creatorEmail%", creatorRoamStart: %roamStart%}) CREATE (n)-[:CREATED]->(m)', {email:userEmail, creatorEmail: userEmail, roamStart: times.startRoam} ).exec().then(function(relationshipRes) {
//              console.log('Relationship created', relationshipRes); 
//           });
//         });
//       });
//     } else { //Roam node found within a similar geographic location
//       console.log('Found a match', matchResults[0].data[0].meta[0].id);

//       var id = matchResults[0].data[0].meta[0].id;

//       //Grabs roam node between similar location, and creates the relationship between node and user
//       apoc.query('MATCH (n:User {email:"%email%"}), (m:Roam) WHERE id(m) = %id% SET m.status="Active" CREATE (n)-[:CREATED]->(m) RETURN m', {email:userEmail, id:id} ).exec().then(function(roamRes) {
//           console.log('Relationship created b/w Users created', roamRes[0].data[0].row[0]);
//           var roamInfo = roamRes[0].data[0].row[0];

//           var date = formattedDateHtml();

//           //Generates an automatic email message
//           var mailOptions = {
//             from: '"Roam" <Roamincenterprises@gmail.com>', // sender address 
//             bcc: roamInfo.creatorEmail + ',' + userEmail, // List of users who are matched
//             subject: 'Your Roam is Ready!', // Subject line 
//             text: 'Your Roam is at:' + roamInfo.venueName + ' Roam Address: ' + roamInfo.venueAddress, // plaintext body 
//             html: generateEmail(roamInfo.venueName, roamInfo.venueAddress, date) // html body 
//           };
           
//           // send mail with defined transport object 
//           transporter.sendMail(mailOptions, function(error, info){
//             if(error){
//               return console.log(error);
//             }
//             console.log('Message sent: ' + info.response);
//           });

//           res.send("You have been matched"); 
//         });
//       }
//   },

//   //Cancellation of roam; only the creator has cancellation abilities
//   cancel: (req, res) => {
//     var userEmail = req.body.userEmail;
//     console.log('useremail is:', userEmail);

//     //Finds roam node that user created and cancels it
//     apoc.query('MATCH (m:Roam {creatorEmail: "%userEmail%"}) WHERE m.status="Pending" SET m.status="Canceled" RETURN m', {userEmail: userEmail}).exec().then(function(cancelRes){

//       console.log('Roam canceled:', cancelRes[0].data[0].row[0]);

//       var roamInfo = cancelRes[0].data[0].row[0];

//       //Sends cancellation email
//       var mailOptions = {
//         from: '"Roam" <Roamincenterprises@gmail.com>', // sender address 
//         bcc: roamInfo.creatorEmail + ',' + userEmail,
//         subject: 'Your Roam has been canceled!', // Subject line 
//         text: 'Your Roam at:' + roamInfo.venueName + ' Roam Address: ' + roamInfo.venueAddress + ' has been canceled.', // plaintext body 
//         html: '<div><h3>Roam Venue: <br>' + roamInfo.venueName + '</h3></div><div><h3>Roam Address: ' + roamInfo.venueAddress + ' has been canceled.</h3></div>' // html body 
//       };
       
//       // send mail with defined transport object 
//       transporter.sendMail(mailOptions, function(error, info){
//         if(error){
//           return console.log(error);
//         }
//         console.log('Message sent: ' + info.response);
//       });

//       res.send("Your Roam has been canceled"); 
//     });
//   }

// };

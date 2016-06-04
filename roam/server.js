var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var apoc = require('apoc');
var bcrypt = require('bcrypt');
var crypto = require('crypto');
var request = require('request');
var saltRounds = 10;
var yelp = require('./App/Utils/api');

const offsetToDegrees = 0.02;

app.use(bodyParser.json());

app.get('/', function(req, res){
  res.send('Hello World!');
});

app.post('/signup', function(req, res){
  console.log('I got it!');
  console.log(req.body);
  var data = req.body;

  //Check database to see if incoming email on signup already exists
  apoc.query('MATCH (n:User {email: "%email%"}) RETURN n', { email: data.email }).exec().then(function(queryRes) {
    console.log('RES in SERVER FILE:', queryRes[0].data.length);
    //If there is no matching email in the database
    if (queryRes[0].data.length === 0) {
      //Hash password upon creation of account
      bcrypt.genSalt(saltRounds, function(err, salt) {
        if (err) {
          console.log('Error generating salt', err);
        }
        bcrypt.hash(req.body.password, salt, function(err, hash) {
          if (err) {
            console.log('Error hashing password', err);
          }
          data.password = hash;
          apoc.query('CREATE (newUser:User {firstName: "%firstName%", lastName: "%lastName%", password: "%password%", email: "%email%"});', data).exec().then(
            function(dbRes){
              console.log('saved to database:', dbRes);
              res.send(JSON.stringify({message: 'User created'}));
            },
            function(fail){
              console.log('issues saving to database:', fail);
            }
          );
        });
      }); //close genssalt
    } else {
      res.send(JSON.stringify({message: 'Email already exists!'}));
    }



  }); //closing 'then'


}); //close post request

app.post('/signin', function(req, res){
  console.log('Signing in');

  var data = req.body;
  console.log(data);

  apoc.query('MATCH (n:User {email: "%email%"}) RETURN n.password', {email: data.email}).exec().then(function(queryRes){

      console.log(JSON.stringify(queryRes));
      if(queryRes[0].data.length === 0) {
        res.send(JSON.stringify({message: 'Incorrect email/password combination!'}));
      } else {
        console.log(queryRes[0].data[0].row[0]);
        bcrypt.compare(data.password, queryRes[0].data[0].row[0], function(err, bcryptRes){
         if(err){
          console.log('error in comparing password:', err);
         }
          console.log('response is:', bcryptRes);
          if(bcryptRes){
            res.send(JSON.stringify({message: 'Password Match'}));
          } else {
            res.send(JSON.stringify({message: 'Incorrect email/password combination!'}));
          }
        });
      }
  });

});


app.post('/roam', function(req, res) {

	console.log('ROAM REQUEST POST>>>>>>>>>>>>>>>>', req.body);

	var dateMS = Date.now();
	var	userLatitude = Number(req.body.coordinates.coords.latitude);
	var	userLongitude = Number(req.body.coordinates.coords.longitude);
	var userEmail = req.body.userEmail;
	var startRoam = Number(req.body.coordinates.timestamp);
	var roamOffAfter = Number(startRoam);


	// console.log('ROAM REQUEST POST Location>>>>>>>>>>>>>>>>', userLocation);
	console.log('ROAM REQUEST POST Time >>>>>>>>>>>>>>>>', startRoam);
	console.log('ROAM REQUEST POST Email >>>>>>>>>>>>>>>>', userEmail);
	console.log('>>>>>>>>>>>>>>>>', typeof roamOffAfter);
	console.log('>>>>>>>>>>>>>>>>>>>>DATE', dateMS);
	if(req.body.time === '1 hour') {
		roamOffAfter += 	3600000;
	}
	if(req.body.time === '2 hours') {
		roamOffAfter += 	7200000;
	}
	if(req.body.time === '4 hours') {
		roamOffAfter += 	14400000;
	}
	if(req.body.time === 'Anytime today') {
		var today = new Date();
		var millisecondsUntilMidnight = (24 - today.getHours()) * 3600000;
		roamOffAfter += 	millisecondsUntilMidnight;
	}



// function createGeofence(lat, long, distInMiles) {
    
//     var dist = distInMiles * 1.60934; //convert to km
//     var R = 6371e3;

//     var northLat = Math.asin( Math.sin(lat)*Math.cos(dist/R) + Math.cos(lat)*Math.sin(dist/R)*Math.cos(0) );
//     var northLong = long + Math.atan2(Math.sin(0)*Math.sin(dist/R)*Math.cos(lat), Math.cos(dist/R)-Math.sin(lat)*Math.sin(northLat));

//     var southLat = Math.asin( Math.sin(lat)*Math.cos(dist/R) + Math.cos(lat)*Math.sin(dist/R)*Math.cos(180) );
//     var southLong = long + Math.atan2(Math.sin(180)*Math.sin(dist/R)*Math.cos(lat), Math.cos(dist/R)-Math.sin(lat)*Math.sin(southLat));

//     var eastLat = Math.asin( Math.sin(lat)*Math.cos(dist/R) + Math.cos(lat)*Math.sin(dist/R)*Math.cos(90) );
//     var eastLong = long + Math.atan2(Math.sin(90)*Math.sin(dist/R)*Math.cos(lat), Math.cos(dist/R)-Math.sin(lat)*Math.sin(eastLat));

//     var westLat = Math.asin( Math.sin(lat)*Math.cos(dist/R) + Math.cos(lat)*Math.sin(dist/R)*Math.cos(270) );
//     var westLong = long + Math.atan2(Math.sin(270)*Math.sin(dist/R)*Math.cos(lat), Math.cos(dist/R)-Math.sin(lat)*Math.sin(westLat));

//     return {
//       nLat: northLat,
//       nLong: northLong,
//       sLat: southLat,
//       sLong: southLong,
//       eLat: eastLat,
//       eLong: eastLong,
//       wLat: westLat,
//       wLong: westLong
//     }

//   }
  // var geofence = createGeofence(userLatitude, userLongitude, 10)
  // console.log(geofence);

  //
  // userLat < northLat && userLat > southLat
  // userLong > wLong && userLong < eLong

	//query based on time
  var maxLat = userLatitude + offsetToDegrees;
  var minLat = userLatitude - offsetToDegrees;
  var maxLong = userLongitude + offsetToDegrees;
  var minLong = userLongitude - offsetToDegrees;

  console.log(maxLat, minLat, maxLong, minLong);

	apoc.query('MATCH (n:Roam) WHERE n.creatorRoamEnd > %currentDate%  AND n.status = "Pending" AND n.creatorLatitude < %maxLat% AND n.creatorLatitude > %minLat% AND n.creatorLongitude < %maxLong% AND n.creatorLongitude > %minLong% RETURN n', {currentDate:dateMS, maxLat: maxLat, minLat: minLat, maxLong: maxLong, minLong: minLong}).exec().then(function(matchResults) {
		console.log(">>>>>>>>>>>>>>>>ROAM MATCHES", matchResults);
		if(matchResults[0].data.length === 0) {
    //if no match found create a pending roam node

      let searchParams = {
        term: 'Bars',
        limit: 10,
        sort: 0,
        radius_filter: 3200, //2-mile radius
        bounds: {
          sw_latitude: maxLat,
          sw_longitude: minLong, 
          ne_latitude: minLat,
          ne_longitude: maxLong
        }
      };      


      yelp.searchYelp(searchParams);
      console.log("<><><><><><><><>> This is loc", loc);
    // request(yelpUrl, function (error, response, body) {
    //   if (!error && response.statusCode == 200) {
    //     console.log(body) // Show the HTML for the Google homepage. 

    //   } else {
    //     console.log('Something went wrong ', error);
    //   }
    // })

      apoc.query('CREATE (m:Roam {creatorEmail: "%userEmail%", creatorLatitude: %userLatitude%, creatorLongitude: %userLongitude%, creatorRoamStart: %startRoam%, creatorRoamEnd: %roamOffAfter%, status: "Pending"})', { email: userEmail, userEmail: userEmail, userLatitude: userLatitude, userLongitude: userLongitude,
      startRoam: startRoam, roamOffAfter: roamOffAfter}).exec().then(function(queryRes) {
        console.log('I arrived here <<<<<<<<<<<<<<<<<');



        // return as response "Matched"
        apoc.query('MATCH (n:User {email:"%email%"}), (m:Roam {creatorEmail: "%creatorEmail%", creatorRoamStart: %roamStart%}) CREATE (n)-[:CREATED]->(m)', {email:userEmail, creatorEmail: userEmail, roamStart: startRoam} ).exec().then(function(relationshipRes) {
           console.log('Relationship created >>', relationshipRes); 
        })
			});
		} else {
      console.log("<<<<<<<<<<Found a match>>>>>>>>>>>>", matchResults[0].data[0].meta[0].id);

      var id = matchResults[0].data[0].meta[0].id;
      apoc.query('MATCH (n:User {email:"%email%"}), (m:Roam) WHERE id(m) = %id% SET m.status="Active" CREATE (n)-[:CREATED]->(m)', {email:userEmail, id:id} ).exec().then(function(roamRes) {
           console.log('Relationship created b/w Users created', roamRes);
           res.send("You have been matched"); 
        })
    }
	});



});

app.listen(3000, function(){
  console.log('Example app listening on port 3000!');
});



  // function distBetweenTwoCoordinates(a, b) {
  //   // var radius: 20
  //   // (x - userLatitude)^2 + (y - userLocation)^2 < radius^2;


  //   var R = 6371e3; // metres
  //   var aLat = a.lat.toRadians();
  //   var bLat = b.lat.toRadians();
  //   var diffLat = (b.lat-a.lat).toRadians();
  //   var diffLong = (b.long-a.long).toRadians();

  //   var a = Math.sin(diffLat/2) * Math.sin(diffLat/2) +
  //           Math.cos(aLat) * Math.cos(bLat) *
  //           Math.sin(diffLong/2) * Math.sin(diffLong/2);
  //   var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  //   var distInMiles = (R * c) * 0.000621371; //used meter to mile conversion

  //   return distInMiles < 20;
  //   maxDistNorth = a.lat + 20;
  //   minDistNorth = a.lat - 20;

  //   maxDistEast = a.long + 20;
  //   minDistWest = a.long - 20;

  //   // distlatLng = new google.maps.LatLng(dist.latlng[0],dist.latlng[1]);
  //   //  var latLngBounds = circle.getBounds();
  //   //  if(latLngBounds.contains(distlatLng)){
  //   //    dropPins(distlatLng,dist.f_addr);
  //   //  }

  // }
var firebase = require("firebase");
var Themeparks = require("themeparks");

// Initialize Firebase
var config = {
    apiKey: "AIzaSyBpI1qyqTi1jni0OBIGilac6SdWDmjX0_c",
    authDomain: "disney-908fd.firebaseapp.com",
    databaseURL: "https://disney-908fd.firebaseio.com",
    projectId: "disney-908fd",
    storageBucket: "disney-908fd.appspot.com",
    messagingSenderId: "935643963162"
};
firebase.initializeApp(config);

var disneyland = new Themeparks.Parks.DisneylandResortMagicKingdom();
var database = firebase.database();

console.log("Initializing DB");
disneyland.GetWaitTimes().then(function(rides) {
    for(var i=0, ride; ride=rides[i++];) {
        database.ref(ride.id).set({
            name: ride.name,
            time: 0,
            active: ride.active,
            fastPass: ride.fastPass,
            fastPassReturn: ride.fastPassReturnTime,
            status: ride.status
        })
        //console.log(ride.name + ": " + ride.waitTime + " minutes wait");
    }
}, console.error);


// get park opening times
disneyland.GetOpeningTimes().then(function(times) {
    for(var i=0, time; time=times[i++];) {
        if (time.type == "Operating") {
            database.ref("parkValues").set({
                time: disneyland.TimeNow(),
                date: disneyland.DateNow(),
                openingTime: time.openingTime,
                closingTime: time.closingTime
            })
            //console.log("[" + time.date + "] Open from " + time.openingTime + " until " + time.closingTime);
            break;
        }
    }
}, console.error);


var minutes = 1, the_interval = minutes * 60  * 1000;
setInterval(function(){
    console.log("Syncing");
    disneyland.GetOpeningTimes().then(function(times) {
        for(var i=0, time; time=times[i++];) {
            if (time.type == "Operating") {
                database.ref("parkValues").set({
                    time: disneyland.TimeNow(),
                    date: disneyland.DateNow(),
                    openingTime: time.openingTime,
                    closingTime: time.closingTime
                })
                //console.log("[" + time.date + "] Open from " + time.openingTime + " until " + time.closingTime);
                break;
            }
        }
    }, console.error);

    disneyland.GetWaitTimes().then(function(rides) {
    for(var i=0, ride; ride=rides[i++];) {
        database.ref(ride.id).set({
            name: ride.name,
            time: ride.waitTime,
            active: ride.active,
            fastPass: ride.fastPass,
            status: ride.status
        })
        //console.log(ride.name + ": " + ride.waitTime + " minutes wait");
    }
    }, console.error);
}, the_interval);

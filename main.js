var firebase = require("firebase");
var Themeparks = require("themeparks");
var disneyland = new Themeparks.Parks.DisneylandResortMagicKingdom();

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
var database = firebase.database();

// Get admin key and sign in
var adminId = process.env.ADMIN_KEY;
firebase.auth().signInWithCustomToken(adminId).catch(function(error) {
    var errorCode = error.code;
    var errorMessage = error.message;
});

// Pull data from Themeparks and upload to firebase every minute
var minutes = 1, the_interval = minutes * 60  * 1000;
setInterval(function(){
    console.log("Syncing");

    // Get Park date, time, and hours of operation
    disneyland.GetOpeningTimes().then(function(times) {
        for(var i=0, time; time=times[i++];) {
            if (time.type == "Operating") {
                database.ref("parkValues").update({
                    time: disneyland.TimeNow(),
                    date: disneyland.DateNow(),
                    openingTime: time.openingTime,
                    closingTime: time.closingTime
                })
                break;
            }
        }
    }, console.error);

    // Get wait times, ride status, and fastpass info for every ride
    disneyland.GetWaitTimes().then(function(rides) {
    for(var i=0, ride; ride=rides[i++];) {
        var fp = ride.fastPassReturnTime;
        if(fp != undefined ){
            fp = ride.fastPassReturnTime.startTime + ";" +
                 ride.fastPassReturnTime.endTime;
        }else{
            fp = "null"
        }
        database.ref(ride.id).update({
            name: ride.name,
            time: ride.waitTime,
            active: ride.active,
            fastPass: ride.fastPass,
            fastPassReturn: fp,
            status: ride.status
        })
    }
    }, console.error);
}, the_interval);

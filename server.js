"use strict";
 
const express = require("express"),
    CognitoExpress = require("cognito-express"),
    port = process.env.PORT || 8000;
 
const app = express(),
    authenticatedRoute = express.Router(); //I prefer creating a separate Router for authenticated requests
 
app.use(express.static('dist'))
app.use("/api", authenticatedRoute);
 
//Initializing CognitoExpress constructor
const cognitoExpress = new CognitoExpress({
    region: "ap-southeast-1",
    cognitoUserPoolId: "ap-southeast-1_KU7J3bTtj",
    tokenUse: "access", //Possible Values: access | id
    tokenExpiration: 3600000 //Up to default expiration of 1 hour (3600000 ms)
});
 
//Our middleware that authenticates all APIs under our 'authenticatedRoute' Router
authenticatedRoute.use(function(req, res, next) {
    
    //I'm passing in the access token in header under key accessToken
    let accessTokenFromClient = req.headers.accesstoken;
 
    //Fail if token not present in header. 
    if (!accessTokenFromClient) return res.status(401).send("Access Token missing from header");
 
    cognitoExpress.validate(accessTokenFromClient, function(err, response) {
        
        //If API is not authenticated, Return 401 with error message. 
        if (err) return res.status(401).send(err);
        
        //Else API has been authenticated. Proceed.
        res.locals.user = response;
        next();
    });
});
 
 
//Define your routes that need authentication check
authenticatedRoute.get("/myfirstapi", function(req, res, next) {
    res.send(`Hi ${res.locals.user.username}, your API call is authenticated!`);
});
 
app.listen(port, function() {
    console.log(`Live on port: ${port}!`);
});
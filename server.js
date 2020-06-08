"use strict";
 
const express = require("express"),
    CognitoExpress = require("cognito-express"),
    port = process.env.PORT || 8000;
 
const app = express(),
    authenticatedRoute = express.Router();
 
app.use(express.static('dist'))
app.use("/api", authenticatedRoute);
 
const cognitoExpress = new CognitoExpress({
    region: "ap-southeast-1",
    cognitoUserPoolId: "ap-southeast-1_ySxJ2ZP7c",
    tokenUse: "access", 
    tokenExpiration: 3600000 
});
 
authenticatedRoute.use(function(req, res, next) {
    let accessTokenFromClient = req.headers.accesstoken;
    if (!accessTokenFromClient) return res.status(401).send("Access Token missing from header");
 
    cognitoExpress.validate(accessTokenFromClient, function(err, response) {
        if (err) return res.status(401).send(err);
        res.locals.user = response;
        next();
    });
});
 
authenticatedRoute.get("/myfirstapi", function(req, res, next) {
    res.send(`Hi ${res.locals.user.username}, your API call is authenticated!`);
});
 
app.listen(port, function() {
    console.log(`Live on port: ${port}!`);
});

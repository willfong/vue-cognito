<template>
  <div class="container">
    <h1 class="title">AWS Cognito Test Application</h1>
    <hr />
    <h1 class="subtitle">Sign Up / Login</h1>
    <div class="field">
        <label class="label">Name</label>
        <div class="control">
            <input class="input" type="text" v-model="newUsername" placeholder="Username">
        </div>
    </div>
    <div class="field">
        <label class="label">Password</label>
        <div class="control">
            <input class="input" type="password" v-model="newPassword" placeholder="Password">
        </div>
    </div>
    <div class="field is-grouped">
        <div class="control">
            <button class="button is-link" @click="newUser">Signup</button>
        </div>
        <div class="control">
            <button class="button is-link is-light" @click="login">Login</button>
        </div>
    </div>
    <hr />
    <h1 class="subtitle">JWT Tokens</h1>
    <p>Access Token</p>
    <textarea class="textarea" v-model="jwtAccess" placeholder="Insert to set manually"></textarea>
    <p>Refresh Token</p>
    <textarea class="textarea" v-model="jwtRefresh" placeholder="Insert to set manually"></textarea>
    <p>ID Token</p>
    <textarea class="textarea" v-model="jwtId" placeholder="Insert to set manually"></textarea>
    <button class="button is-primary" @click="setJwtTokens">Set JWT Tokens</button>
    <hr />
    <h1 class="subtitle">Make API Call</h1>
    <button class="button is-primary" @click="makeApiCall">Call</button>
  </div>
</template>

<script>
import axios from 'axios';
import {
    AuthenticationDetails,
    CognitoUserPool,
    CognitoUser
} from 'amazon-cognito-identity-js';

var poolData = {
    UserPoolId: 'ap-southeast-1_ySxJ2ZP7c',
    ClientId: 'cdebuv61ntpleisf85tev0bei',
};
var userPool = new CognitoUserPool(poolData);

const getMethods = (obj) => {
  let properties = new Set()
  let currentObj = obj
  do {
    Object.getOwnPropertyNames(currentObj).map(item => properties.add(item))
  } while ((currentObj = Object.getPrototypeOf(currentObj)))
  return [...properties.keys()].filter(item => typeof obj[item] === 'function')
}

export default {
  name: 'Login',
  data() {
      return {
          newUsername: null,
          newPassword: null,
          jwtAccess: null,
          jwtId: null,
          jwtRefresh: null,
      }
  },
  methods: {
      newUser() {
          console.log('Setting up new user:');
          console.log(`Username: ${this.newUsername}`);
          console.log(`Password: ${this.newPassword}`);
          userPool.signUp(this.newUsername, this.newPassword, null, null, function(
            err,
            result
            ) {
                if (err) {
                    console.log('There was an error:');
                    console.log(err);
                    alert(err.message || JSON.stringify(err));
                    return;
                }
                var cognitoUser = result.user;
                console.log("Logged in:");
                /* Not sure why we can't get userdata???
                console.log(getMethods(cognitoUser));
                console.log(cognitoUser.getUserData());
                */
                console.log('user name is ' + cognitoUser.getUsername());
            });
      },
      login() {
          var authenticationDetails = new AuthenticationDetails({
                Username: this.newUsername,
                Password: this.newPassword,
          });
          var userData = {
            Username: this.newUsername,
            Pool: userPool,
            };
          var cognitoUser = new CognitoUser(userData);
          cognitoUser.authenticateUser(authenticationDetails, {
               onSuccess: result => {
                    console.log(getMethods(result));
                    console.log("Access Token: " + result.getAccessToken().getJwtToken());
                    this.jwtAccess = result.getAccessToken().getJwtToken();
                    console.log("Refresh Token: " + result.getRefreshToken().getToken());
                    this.jwtRefresh = result.getRefreshToken().getToken();
                    console.log("ID Token: " + result.getIdToken().getJwtToken());
                    this.jwtId = result.getIdToken().getJwtToken();
                    axios.defaults.headers.common['accesstoken'] = result.getAccessToken().getJwtToken();
                    this.makeApiCall();
               },
               
               onFailure: function(err) {
                    alert(err.message || JSON.stringify(err));
                },
          });
      },
      makeApiCall() {
        console.log("Hitting API");
        axios.get("/api/myfirstapi").then(response => {
            console.log(response.data);
        });
      },
      setJwtTokens() {
        axios.defaults.headers.common['accesstoken'] = this.jwtAccess;
      },
  }
}
</script>

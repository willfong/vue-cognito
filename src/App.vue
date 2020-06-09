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
    <pre class="is-family-code" v-if="decodedAccess">{{decodedAccess}}</pre>
    <p v-if="decodedAccess">Token Expired: {{jwtExpired(decodedAccess.exp)}}</p>
    <p>Refresh Token</p>
    <textarea class="textarea" v-model="jwtRefresh" placeholder="Insert to set manually"></textarea>
    <button class="button is-primary" v-if="jwtRefresh" @click="refreshJwt">Refresh JWT Tokens</button>
    <p>ID Token</p>
    <textarea class="textarea" v-model="jwtId" placeholder="Insert to set manually"></textarea>
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
    CognitoUser,
    CognitoRefreshToken,
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
  computed: {
    decodedAccess() {
      if (this.jwtAccess && this.jwtAccess.split('.').length > 1) {
        return JSON.parse(atob(this.jwtAccess.split('.')[1]));
      }
      return false;
    },
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
                    this.parseJwtResponse(result);
               },               
               onFailure: function(err) {
                    alert(err.message || JSON.stringify(err));
                },
          });
      },
      makeApiCall() {
        axios.defaults.headers.common['accesstoken'] = this.jwtAccess;
        console.log(`Using Access Token for API: ${this.jwtAccess}`);
        axios.get("/api/myfirstapi").then(response => {
            console.log(response.data);
        });
      },
      jwtExpired() {
        if (this.jwtAccess) {
          const tokenData = JSON.parse(atob(this.jwtAccess.split('.')[1]))
          if ( tokenData.exp > Math.floor(Date.now() / 1000)) {
            return false
          }
          return true
        }
      },
      refreshJwt() {
        /*
        We need the username to make the connection to CognitoUser.
        For the purpose of this example, we are extracting that from
        the access token. But in a real application, it can probably
        parse it from a different source, so the access token won't
        be necessary
        */
        var userData = {
          Username: this.decodedAccess.username,
          Pool: userPool,
        };
        var cognitoUser = new CognitoUser(userData);
        var refreshToken = new CognitoRefreshToken({
          RefreshToken: this.jwtRefresh
        });
        cognitoUser.refreshSession(refreshToken, (err, data) => {
          if (err) console.log(err, err.stack); // an error occurred
          console.log(data);
          this.parseJwtResponse(data);
        });
      },
      parseJwtResponse(r) {
        const accessToken = r.getAccessToken().getJwtToken();
        const refreshToken = r.getRefreshToken().getToken();
        const idToken = r.getIdToken().getJwtToken();
        this.jwtAccess = accessToken;
        this.jwtRefresh = refreshToken;
        this.jwtId = idToken;
      },
  }
}
</script>

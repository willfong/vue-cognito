<template>
  <div class="Login">
    <h1>Signup</h1>
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

  </div>
</template>

<script>

import {
    AuthenticationDetails,
    CognitoUserPool,
    CognitoUser
} from 'amazon-cognito-identity-js';

var poolData = {
    UserPoolId: 'ap-southeast-1_KU7J3bTtj',
    ClientId: '116nlv03ridenjqct1t5q8fapn',
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
      }
  },
  methods: {
      newUser() {
          userPool.signUp(this.newUsername, this.newPassword, null, null, function(
            err,
            result
            ) {
                if (err) {
                    alert(err.message || JSON.stringify(err));
                    return;
                }
                var cognitoUser = result.user;
                console.log(getMethods(cognitoUser));
                console.log(cognitoUser.getUserData());
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
               onSuccess: function(result) {
                    console.log(getMethods(result));
                    console.log("Access Token: " + result.getAccessToken().getJwtToken());
                    console.log("Refresh Token: " + result.getRefreshToken().getToken());
                    console.log("ID Token: " + result.getIdToken().getJwtToken());
               },
               
               onFailure: function(err) {
                    alert(err.message || JSON.stringify(err));
                },
          });
      },

  }
}
</script>

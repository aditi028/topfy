//spotify endpoints
const express = require('express')
const router = express.Router()

const {LocalStorage} = require("node-localstorage")
const generateRandomString = require('generate-random-string')
const querystring = require('querystring')


router.get('/login',(req,res)=>{
    if(localStorage.getItem('isSpotifyAuthorized')==='true'){
      return res.status(200).send({status:'ok', link:process.env.LOCALHOST})
    }
    const state = generateRandomString(16);
    const scope = 'user-read-private user-read-email';
    const url = 'https://accounts.spotify.com/authorize?' +
      querystring.stringify({
        response_type: 'code',
        client_id: process.env.SPOTIFY_CLIENT_ID,
        scope: scope,
        redirect_uri: process.env.REDIRECT_FROM_SPOTIFY,
        state: state
      })
    return res.status(200).send({status:'ok', link:url})
  })
  
router.post('/callback/',(req,res)=>{
    const code  = req.body.code || null
    const state  = req.body.state || null
  
    if (state === null) {
      return res.status(400).send({status:'state null'});
      // return res.redirect('/#' +
      //   querystring.stringify({
      //     error: 'state_mismatch'
      //   }));
    } else {
      fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': 'Basic ' + Buffer.from(
            `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
          ).toString('base64')
        },
        body: 'grant_type=authorization_code&code=' + code + '&redirect_uri=' + encodeURIComponent(process.env.REDIRECT_FROM_SPOTIFY)
        })
        .then(response => response.json())
        .then(async data => {
          // Store the access token and refresh token in local storage or a cookie
          const accessToken = data.access_token;
          const refreshToken = data.refresh_token;
          console.log('Access Token>>', accessToken);
          console.log('Refresh Token>>', refreshToken);
          localStorage.setItem('isSpotifyAuthorized','true')
          localStorage.setItem('spotify_access_token',accessToken)
          localStorage.setItem('spotify_refresh_token',refreshToken)
          localStorage.setItem('spotify_access_token_expiry',Date.now() + (3600 * 1000))
          const tokenstatus = await refreshAccessToken();
          if(tokenstatus == 200){
            // refreshAccessTokenIntervals()
            return res.status(200).send({status:'200', loggedInToSpotify:'spotifyloggedin'})
          }
          else{
            return res.status(400).send({status:'some error'})
          }
        })
        .catch(error => {
          console.error('Error:', error);
          return res.status(400).send({status:error})
        });
      }
})
  
function refreshAccessTokenIntervals(){
  setInterval(refreshAccessToken,  localStorage.getItem('spotify_access_token_expiry'))
}
  
function refreshAccessToken() {
   return fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': 'Basic ' + Buffer.from(
        `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
      ).toString('base64')
    },
    body: 'grant_type=refresh_token&refresh_token=' + localStorage.getItem('spotify_refresh_token')
  })
  .then(response => response.json())
  .then(data => {
    // Store the new access token and its expiration time
    accessToken = data.access_token;
    expirationTime = Date.now() + (data.expires_in * 1000);
    console.log('New Access Token:', accessToken);
    console.log('Expiration Time:', expirationTime);
    localStorage.setItem('spotify_access_token',accessToken)
    localStorage.setItem('spotify_access_token_expiry',expirationTime)
    return 200
  })
  .catch(error => {
    console.error('Error:', error);
    return 400
  });


}
  
const EXPIRY_THRESHOLD = 60000; // Refresh token if expiry time is within 60 seconds
function checkAccessToken() {
  if (Date.now() > localStorage.getItem('spotify_access_token_expiry') - EXPIRY_THRESHOLD) {
    refreshAccessToken();
  }
}
setInterval(checkAccessToken, 500);

router.get('/logout',(req,res)=>{
  if(localStorage.getItem('isSpotifyAuthorized')==='true'){
    localStorage.setItem('isSpotifyAuthorized','false')
    localStorage.removeItem('spotify_access_token')
    localStorage.removeItem('spotify_refresh_token')
    localStorage.removeItem('spotify_access_token_expiry')
    return res.status(200).send({status:200})
  }
  return res.status(400).send({status:400})
})

module.exports = router;
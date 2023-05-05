require('dotenv').config()
const express = require('express')
const app = express() 
const cors = require('cors')
const needle = require('needle')
const { TwitterApi } =  require('twitter-api-v2')
const {LocalStorage} = require("node-localstorage")
const generateRandomString = require('generate-random-string')
const querystring = require('node:querystring')
const session = require('express-session')

localStorage = new LocalStorage('./space')
localStorage.clear(); 

app.use(cors()) //we use cors as middleware. middleware modifies the response & passes it to next function
app.use(express.json()) //we use express.json() as middleware to let express know that body should be parsed as json.
// app.use(session({ //we use server-side sessions to save data
//   secret: 'keyboard cat',
//   resave: false,
//   saveUninitialized: true
// }))

app.get('/api/twitterLogin', async(req,res)=>{
    if(localStorage.getItem('isTwitterAuthorized')=='true'){
      return res.status(200).send({status:'ok', link:process.env.LOCALHOST})
    }
    // if(req.session.istwitterLoggedIn === true){
    //   return res.status(200).send({status:'ok', link:process.env.LOCALHOST})
    // }
    
    const client = new TwitterApi({ appKey: process.env.CONSUMER_KEY, appSecret: process.env.CONSUMER_SECRET })
    const authLink = await client.generateAuthLink(process.env.CALLBACK_URL, { linkMode: 'authorize' })
    const url = authLink.url
    const oauth_token = authLink.oauth_token
    const oauth_token_secret = authLink.oauth_token_secret
    localStorage.setItem('twitter_oauth_token', oauth_token)
    localStorage.setItem('twitter_oauth_token_secret', oauth_token_secret)
    // req.session.twitter_oauth_token = oauth_token
    // req.session.twitter_oauth_token_secret = oauth_token_secret
    //returns redirect auth link
    return res.status(200).send({status:'ok', link:url})
})


app.post('/api/callback', (req, res) => {
  const oauth_token  = req.body.token
  const oauth_verifier = req.body.verifier
  const oauth_token_secret  = localStorage.getItem('twitter_oauth_token_secret')
  // const oauth_token_secret = req.session.twitter_oauth_token_secret
  if (!oauth_token || !oauth_verifier || !oauth_token_secret) {
    return res.status(400).send({status:'You denied the app or your session expired!'});
  }
  const client = new TwitterApi({
    appKey: process.env.CONSUMER_KEY,
    appSecret: process.env.CONSUMER_SECRET,
    accessToken: oauth_token,
    accessSecret: oauth_token_secret,
  });

  client.login(oauth_verifier)
    .then(({ client: loggedClient, accessToken, accessSecret }) => {
      localStorage.setItem('isTwitterAuthorized', 'true')
      localStorage.setItem('accessToken',accessToken)
      localStorage.setItem('accessSecret',accessSecret)
      // req.session.istwitterLoggedIn = true;
      // req.session.twitterAccessToken = accessToken
      // req.session.twitterAccessSecret = accessSecret
      //returns login confirmation
      return res.status(200).send({status:'twitterloggedin'});
    })
    .catch(() => res.status(403).send({status:'Invalid verifier or access tokens!'}));

});

app.post('/api/uploadBanner',async (req,res)=>{
  const client = new TwitterApi({
    appKey: process.env.CONSUMER_KEY,
    appSecret: process.env.CONSUMER_SECRET,
    // accessToken: req.session.twitterAccessToken,
    // accessSecret: req.session.twitterAccessSecret
    accessToken: localStorage.getItem('accessToken'),
    accessSecret: localStorage.getItem('accessSecret')
  });

  try{
    // Upload from a path (the same sources as .uploadMedia are accepted)
    await client.v1.updateAccountProfileBanner('./output.jpg', { width: 450, height: 150, offset_left: 20 });
    const updatedProfile = await client.currentUser();
    const allBannerSizes = await client.v1.userProfileBannerSizes({ user_id: updatedProfile.id_str });
    console.log('New banner! Max size at URL:', allBannerSizes.sizes['1500x500'].url);
  }
  catch(e){
    console.error('error fetching hometimeline =>', e)
  }
  
  return res.json({status:200})
})

//spotify endpoints

app.get('/api/spotifyLogin',(req,res)=>{
  if(localStorage.getItem('isSpotifyAuthorized')=='true'){
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

app.post('/api/spotify/callback/',(req,res)=>{

  const code  = req.body.code || null
  const state  = req.body.state || null

  if (state === null) {
    console.log("null state")
    return res.status(400).send({status:'state null'});
    // return res.redirect('/#' +
    //   querystring.stringify({
    //     error: 'state_mismatch'
    //   }));
  } else {
    console.log("fetching auth process")
    fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': 'Basic ' + btoa(process.env.SPOTIFY_CLIENT_ID + ':' + process.env.SPOTIFY_CLIENT_SECRET)
      },
      body: 'grant_type=authorization_code&code=' + code + '&redirect_uri=' + encodeURIComponent(process.env.REDIRECT_FROM_SPOTIFY)
      })
      .then(response => response.json())
      .then(async data => {
        console.log(data)
        // Store the access token and refresh token in local storage or a cookie
        const accessToken = data.access_token;
        const refreshToken = data.refresh_token;
        console.log('Access Token>>', accessToken);
        console.log('Refresh Token>>', refreshToken);
        localStorage.setItem('spotify_access_token',accessToken)
        localStorage.setItem('spotify_refresh_token',refreshToken)
        localStorage.setItem('spotify_access_token_expiry',Date.now() + (3600 * 1000))
        const tokenstatus = await refreshAccessToken();
        console.log("token"+tokenstatus)
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
      'Authorization': 'Basic ' + btoa(process.env.SPOTIFY_CLIENT_ID + ':' + process.env.SPOTIFY_CLIENT_SECRET)
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




app.get('/api/generateTopfy', async(req,res)=>{

  //generates and uploads to twitter
  fetch('https://api.spotify.com/v1/me/top/tracks?limit=10', {
    headers: {
      'Authorization': 'Bearer ' + localStorage.getItem('spotify_access_token')
    }
  })
  .then(response => response.json())
  .then(data => {
    // Print the list of songs to the console
    console.log('Top 50 Songs:', data);
    const tracks = data.items.map(track=>track.name)
    console.log('tracks',tracks)
    //now upload tracks! template is ready already!
    //token only crashes when I update code and save. I can add extra check to see if tokens are undefined, in that case I need to relogin
    //or I can change the way I save locally. can use cookies directly instead of server local file.
    
  })
  .catch(error => {
    console.error('Error:', error);
  });
  return res.status(200).send({status:'ok'})

})

app.listen(1337, ()=>{
    console.log("server started on 1337")
})

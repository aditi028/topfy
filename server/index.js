require('dotenv').config()
const express = require('express')
const app = express() 
const cors = require('cors')
const needle = require('needle')
const { TwitterApi } =  require('twitter-api-v2')
const {LocalStorage} = require("node-localstorage")
const generateRandomString = require('generate-random-string')
const querystring = require('querystring')
const session = require('express-session')
const jimp = require('jimp')
const path = require('path')

localStorage = new LocalStorage('./space')
localStorage.clear(); 

app.use(cors()) //we use cors as middleware. middleware modifies the response & passes it to next function
app.use(express.json()) //we use express.json() as middleware to let express know that body should be parsed as json.
// app.use(session({ //we use server-side sessions to save data
//   secret: 'keyboard cat',
//   resave: false,
//   saveUninitialized: true
// }))
app.use(express.static('static')) //PROD

app.get('/api/twitterLogin', async(req,res)=>{
    if(localStorage.getItem('isTwitterAuthorized')=='true'){
      return res.status(200).send({status:'ok', link:process.env.LOCALHOST})
    }   
    const client = new TwitterApi({ 
          appKey: process.env.CONSUMER_KEY, 
          appSecret: process.env.CONSUMER_SECRET})
    try{
      const authLink = await client.generateAuthLink(process.env.CALLBACK_URL, { linkMode: 'authorize' })
      const url = authLink.url
      const oauth_token = authLink.oauth_token
      const oauth_token_secret = authLink.oauth_token_secret
      localStorage.setItem('twitter_oauth_token', oauth_token)
      localStorage.setItem('twitter_oauth_token_secret', oauth_token_secret)
      return res.status(200).send({status:'ok', link:url}) //returns redirect auth link
    }
    catch(error){
      return res.status(403).send({status:'ok', link:'Forbidden Access'}) //returns redirect auth link
    }
})


app.post('/api/twitter/callback', (req, res) => {
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
      refreshTwitterAccessToken();
      return res.status(200).send({status:'twitterloggedin'});
    })
    .catch(() => res.status(403).send({status:'Invalid verifier or access tokens!'}));

});

async function refreshTwitterAccessToken(){
  
  const client = new TwitterApi({
    appKey: process.env.CONSUMER_KEY,
    appSecret: process.env.CONSUMER_SECRET,
    accessToken: localStorage.getItem('accessToken'),
    accessSecret:localStorage.getItem('accessSecret')
  })

  try {
    // Get a new bearer token for authentication
    const bearerToken = await client.getBearerToken();
    // Invalidate the existing access token and obtain a new one
    const { data } = await client.invalidateToken();
    const newAccessToken = data.access_token;
    const newAccessTokenSecret = data.access_token_secret;
    localStorage.setItem('accessToken',newAccessToken)
    localStorage.setItem('accessSecret',newAccessTokenSecret)
    console.log('Access token refreshed successfully:', newAccessToken);
    setInterval(refreshTwitterAccessToken,500)
  } catch (error) {
    console.error('Error refreshing access token:', error);
  }
}

async function uploadTwitterBanner(){
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
    await client.v1.updateAccountProfileBanner(process.env.outputImage, { width: 450, height: 150, offset_left: 20 });
    const updatedProfile = await client.currentUser();
    const allBannerSizes = await client.v1.userProfileBannerSizes({ user_id: updatedProfile.id_str });
    console.log('New banner! Max size at URL:', allBannerSizes.sizes['1500x500'].url);
  }
  catch(e){
    console.error('error fetching hometimeline =>', e)
  }
  
  return 200
}

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
        'Authorization': 'Basic ' + btoa(process.env.SPOTIFY_CLIENT_ID + ':' + process.env.SPOTIFY_CLIENT_SECRET)
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
  .then(async data => {
    // Print the list of songs to the console
    const tracks = data.items.map(track=>track.name)
    console.log('tracks',tracks)
    generateImage(tracks)
    .then((res)=>{
      if(res==200){
        console.log("uploading to twitter")
        const upload_status = uploadTwitterBanner();
        if(upload_status==200){
          console.log("uploaded to twitter")
        }
      }
      else{
        console.log("error creating image. not uploaded to twitter.")
      }
    })
    
  })
  .catch(error => {
    console.error('Error:', error);
  });
  return res.status(200).send({status:'ok'})

})

function generateImage(input_tracks) {

  return jimp.loadFont(jimp.FONT_SANS_32_WHITE).then(
    (font)=>{
  
      return jimp.read(process.env.inputImage)
      .then(img=>{ 
        img
        .print(font,500,45,{text: `${input_tracks[0]}`})
        .print(font,500,135,{text: `${input_tracks[1]}`})
        .print(font,500,225,{text: `${input_tracks[2]}`})
        .print(font,500,315,{text: `${input_tracks[3]}`})
        .print(font,500,405,{text: `${input_tracks[4]}`})
        .write(process.env.outputImage);
        
      })
      .then(()=>{
        console.log("image creation successful. returning 200")
        setInterval(generateImage,432000000)
        return 200
      })
      .catch(err=>{
        console.log("error creating image. ",err)
        return 400
      })
      
    }
  )

  console.log("did not return 200 yet")
  
}
//PROD
// app.get('*',(req,res)=>{
//   //send index.html from build folder
//   res.sendFile(path.join(__dirname,'static/index.html'))
// })

//local:1337, PROD:80
app.listen(1337, ()=>{
    console.log("server started on 1337")
})

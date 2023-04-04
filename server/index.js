require('dotenv').config()
const express = require('express')
const app = express() 
const cors = require('cors')
const needle = require('needle')
const { TwitterApi } =  require('twitter-api-v2');
const {LocalStorage} = require("node-localstorage")

localStorage = new LocalStorage('./space');
localStorage.clear(); 

app.use(cors()) //we use cors as middleware. middleware modifies the response & passes it to next function
app.use(express.json()) //we use express.json() as middleware to let express know that body should be parsed as json.


app.get('/api/login', async(req,res)=>{
    if(localStorage.getItem('isUserSignedIn')=='yes'){
      return res.status(200).send({status:'ok'});
    }
    localStorage.setItem('isUserSignedIn', '')
    const client = new TwitterApi({ appKey: process.env.CONSUMER_KEY, appSecret: process.env.CONSUMER_SECRET })
    const authLink = await client.generateAuthLink(process.env.CALLBACK_URL, { linkMode: 'authorize' })
    const url = authLink.url
    const oauth_token = authLink.oauth_token
    const oauth_token_secret = authLink.oauth_token_secret
    localStorage.setItem('oauth_token', oauth_token)
    localStorage.setItem('oauth_token_secret', oauth_token_secret)
    return res.json({status:'ok', link:url})
})


app.post('/api/callback', (req, res) => {
  const oauth_token  = req.body.token
  const oauth_verifier = req.body.verifier
  const oauth_token_secret  = localStorage.getItem('oauth_token_secret')

  if (!oauth_token || !oauth_verifier || !oauth_token_secret) {
    return res.status(400).send('You denied the app or your session expired!');
  }
  
  const client = new TwitterApi({
    appKey: process.env.CONSUMER_KEY,
    appSecret: process.env.CONSUMER_SECRET,
    accessToken: oauth_token,
    accessSecret: oauth_token_secret,
  });

  if(localStorage.getItem('isUserSignedIn')=='yes'){
    return res.status(200).send({status:'ok'});
  }

  client.login(oauth_verifier)
    .then(({ client: loggedClient, accessToken, accessSecret }) => {
      // loggedClient is an authenticated client in behalf of some user
      // Store accessToken & accessSecret somewhere
      localStorage.setItem('isUserSignedIn', 'yes')
      localStorage.setItem('accessToken',accessToken)
      localStorage.setItem('accessSecret',accessSecret)
      return res.status(200).send({status:'ok'});
    })
    .catch(() => res.status(403).send({status:'Invalid verifier or access tokens!'}));

});

app.post('/api/uploadBanner',async (req,res)=>{
  const client = new TwitterApi({
    appKey: process.env.CONSUMER_KEY,
    appSecret: process.env.CONSUMER_SECRET,
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


app.listen(1337, ()=>{
    console.log("server started on 1337")
})
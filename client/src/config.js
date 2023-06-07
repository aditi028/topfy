const config = {
    URLS: {
       LOCALHOST: 'http://localhost:3000',

    },
    ENDPOINTS: {
      TWITTER_LOGIN :'http://localhost:1337/api/twitterLogin',
      SPOTIFY_LOGIN : 'http://localhost:1337/api/spotify/login',
      SPOTIFY_LOGOUT: 'http://localhost:1337/api/spotify/logout',
      SPOTIFY_CALLBACK : 'http://localhost:1337/api/spotify/callback',
      TWITTER_CALLBACK: 'http://localhost:1337/api/twitter/callback',
      GENERATE_TOPFY : 'http://localhost:1337/api/generateTopfy',
      TRACKS_IMAGE_ASSET : 'http://localhost:1337/assets/output.png'
    }
 }
 
 export default config;
 
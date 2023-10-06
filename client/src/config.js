// dev
const server = "http://localhost:3001/"
const client = "http://localhost:3000/"

// //prod
// const server = "https://topfy-server.onrender.com/"
// const client = "https://topfysongs.netlify.app/"

const config = {
    URLS: {
       LOCALHOST: client,

    },
    ENDPOINTS: {
      TWITTER_LOGIN : `${server}api/twitterLogin`,
      SPOTIFY_LOGIN : `${server}api/spotifyLogin`,
      SPOTIFY_CALLBACK : `${server}api/spotify/callback`,
      GENERATE_TOPFY : `${server}api/generateTopfy`,
    }
 }
 
 export default config;
 
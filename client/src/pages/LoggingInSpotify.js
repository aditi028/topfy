import { useState, useEffect } from "react";

function LoggingInSpotify() {

    const [spotifyLoggedin, setSpotifyLoggedIn] = useState()

    useEffect(()=>{
        if(!spotifyLoggedin){
            spotifyLogin();
        }
    },[])

    async function getTopFy(){
        console.log("gettopfy")
        // const res = await fetch('https://api.spotify.com/v1/me/top/tracks',{
        //     method: "GET", headers: { Authorization: `Bearer ${localStorage.getItem('spotify_access_token')}` }
        // })
        // const data = await res.json()
        // console.log(data)
    }

    async function spotifyLogin(){
            let search = window.location.search 
            let params = new URLSearchParams(search)
            const response = await fetch('http://localhost:1337/api/spotify/callback',{
            method: 'POST',
            headers:{
                'Content-Type': 'application/json', //to send data as json
            },
            body: JSON.stringify({
                code: params.get('code'),
                state: params.get('state')
            }),
            })
            const data = await response.json()
            if(data.loggedInToSpotify=='spotifyloggedin'){
                setSpotifyLoggedIn(true)
                localStorage.setItem('isSpotifyAuthorized','true')
                window.location.href = '/'
            }
   }

    return ( 
    <div>
        {
        !spotifyLoggedin?
        <h1>Logging you into Spotify</h1>
        :
        <h1>Logged in to Spotify</h1>
        }
    </div> );
}

export default LoggingInSpotify;
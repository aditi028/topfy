import { useState, useEffect } from "react";

function LoggingInSpotify() {

    const [spotifyLoggedin, setSpotifyLoggedIn] = useState()

    useEffect(()=>{
        if(!spotifyLoggedin){
            console.log("logging in")
            spotifyLogin();
        }
    },[])


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
            console.log("did log in?",data)
            if(data.loggedInToSpotify=='spotifyloggedin'){
                setSpotifyLoggedIn(true)
                localStorage.setItem('isSpotifyAuthorized','true')
                window.location.href = '/'
            }
            else{
                console.log("some error  with spotify",data)
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
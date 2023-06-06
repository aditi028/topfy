import { useState, useEffect } from "react"
import config from '../config.js'
import styles from './logginginspotify.module.css'

function LoggingInSpotify() {

    const [spotifyLoggedin, setSpotifyLoggedIn] = useState()

    useEffect(()=>{
        if(!spotifyLoggedin){
            spotifyLogin();
        }
    },[])


    async function spotifyLogin(){
            let search = window.location.search 
            let params = new URLSearchParams(search)
            const response = await fetch(config.ENDPOINTS.SPOTIFY_CALLBACK,{
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
    <div className={styles.container}>
        {
        !spotifyLoggedin?
        <h1>Logging you into Spotify...</h1>
        :
        <h1>Logged in to Spotify!</h1>
        }
    </div> );
}

export default LoggingInSpotify;
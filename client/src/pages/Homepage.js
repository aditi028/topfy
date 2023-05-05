import { useEffect, useState } from "react"

function Homepage() {

    const [isTwitterAuthorized, setisTwitterAuthorized] = useState(false)
    const [isSpotifyAuthorized, setisSpotifyAuthorized] = useState(false)
    
    useEffect(()=>{
        if(localStorage.getItem('isTwitterAuthorized') == 'true'){
            setisTwitterAuthorized(true)
        }
        if(localStorage.getItem('isSpotifyAuthorized') == 'true'){
            setisSpotifyAuthorized(true)
        }
    },[isTwitterAuthorized,isSpotifyAuthorized])

    async function connectToTwitter(event){
        event.preventDefault()
        const res = await fetch('http://localhost:1337/api/twitterLogin')
        const data = await res.json()
        //redirect to auth link
        if(data.link==='http://localhost:3000'){
            setisTwitterAuthorized(true)
            return
        }
        window.location.assign(data.link)
    }

    async function connectToSpotify(event){
        event.preventDefault()
        const res = await fetch('http://localhost:1337/api/spotifyLogin')
        const data = await res.json()
        //redirect to auth link
        if(data.link==='http://localhost:3000'){
            setisSpotifyAuthorized(true)
            return
        }
        window.location.assign(data.link)
    }

    async function generateTopfySongs(event){
        event.preventDefault()
        console.log("click")
        const res = await fetch('http://localhost:1337/api/generateTopfy')
        const data = await res.json()
    }

    return ( 
        <div className="App">
        {
            isTwitterAuthorized?
            <h1>Twitter Connected</h1>
            :
            <form onSubmit={connectToTwitter}>
            <h1>Connect to Twitter</h1>
            <input type="submit" value="Connect to twitter"/>     
            </form>
        }
        {
            isSpotifyAuthorized?
            <h1>Spotify connected</h1>
            :
            <form onSubmit={connectToSpotify}>
            <h1>Connect to Spotify</h1>
            <input type="submit" value="Connect to spotify"/>     
            </form>
        }
        {
            isTwitterAuthorized && isSpotifyAuthorized &&
            <form onSubmit={generateTopfySongs}>
            <h3>Generate my topfy</h3>
            <input type="submit" value="generate & upload"/>     
            </form>
        }
        </div>
     );
}

export default Homepage;
import { useState } from "react"

function Homepage() {

    const [isTwitterAuthrized, setisTwitterAuthrized] = useState(false)
    const [isSpotifyAuthrized, setisSpotifyAuthrized] = useState(false)
    

    async function connectToTwitter(event){
        event.preventDefault()
        const res = await fetch('http://localhost:1337/api/login')
        const data = await res.json()
        window.location.assign(data.link)
       //now get the query parameters and then do a post request to the server on callback + query parameters
    }

    async function connectToSpotify(event){
        event.preventDefault()
        const res = await fetch('http://localhost:1337/api/spotifylogin')
        const data = await res.json()
        window.location.assign(data.link)
    }

    return ( 
        <div className="App">
        <form onSubmit={connectToTwitter}>
            <h1>Connect to Twitter</h1>
            <input type="submit" value="Connect to twitter"/>     
        </form>
        <form onSubmit={connectToSpotify}>
            <h1>Connect to Spotify</h1>
            <input type="submit" value="Connect to spotify"/>     
        </form>
        </div>
     );
}

export default Homepage;
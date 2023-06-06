import { useEffect, useState } from "react"
import config from '../config.js'
import styles from './homepage.module.css'
import spotifyIcon from '../assets/images/spotify.png'
import twitterIcon from '../assets/images/twitterlogo.png'

function Homepage() {

    const [isSpotifyAuthorized, setisSpotifyAuthorized] = useState(false)
    const [showTracksImage, setShowTracksImage] = useState(false)
    
    useEffect(()=>{
        if(localStorage.getItem('isSpotifyAuthorized') === 'true'){
            setisSpotifyAuthorized(true)
        }
    },[isSpotifyAuthorized])

    async function connectToSpotify(event){
        event.preventDefault()
        const res = await fetch(config.ENDPOINTS.SPOTIFY_LOGIN)
        const data = await res.json()
        //redirect to auth link
        if(data.link===config.URLS.LOCALHOST){
            setisSpotifyAuthorized(true)
            return
        }
        window.location.assign(data.link)
    } 

    async function disconnectSpotify(event){
        event.preventDefault()
        const res = await fetch(config.ENDPOINTS.SPOTIFY_LOGOUT)
        const data = await res.json()
        if(data.status===200){
            console.log("logut")
            localStorage.setItem('isSpotifyAuthorized','false')
            setisSpotifyAuthorized(false)
        }
    }

    async function generateTopfySongs(event){
        event.preventDefault()
        const res = await fetch(config.ENDPOINTS.GENERATE_TOPFY)
        const data = await res.json()
        if(data.status==200){
            setShowTracksImage(true)
        }
        else{
            window.alert("Error. Please Try Again After Sometime.")
        }
    }

    return ( 
        <div className="App">
            <div className={styles.nav}>
                <div className={styles.navItems}></div>
                <div className={styles.title+" "+styles.navItems}>
                    <div className={styles.titleTop}>Top</div><div className={styles.titleFy}>fy</div>
                </div>
                <div className={styles.navItems}>
                    <div className={styles.logoutWrapper}>
                        {//placeholder
                        }
                    </div>
                    <div className={styles.logoutWrapper}>
                        {//placeholder
                        }
                    </div> 
                    {isSpotifyAuthorized && 
                       <div className={styles.logoutWrapper}>
                            <div onClick={disconnectSpotify} className={styles.logoutButton}> 
                            <div>
                                <img src={spotifyIcon} className={styles.logoutButton}></img> 
                            </div>            
                            </div>
                            <span onClick={disconnectSpotify} className={styles.logoutText}>Logout</span> 
                       </div>
                    }
                </div>             
            </div>
        {
            isSpotifyAuthorized?
            <div className={styles.container}>
                <div>                    
                    <form onSubmit={generateTopfySongs}>
                    <input type="submit" value="generate my topfy songs!" className={styles.login}/>     
                    </form>
                </div>
                <div>
                {showTracksImage && (
                    <div className={styles.tracksContainer}>
                    <img src={config.ENDPOINTS.TRACKS_IMAGE_ASSET} alt="Image" className={styles.tracksImage}/>
                    </div>
                )}
                </div>
            </div>
            :
            <div className={styles.container}>
                <form onSubmit={connectToSpotify}>
                <input type="submit" value="Connect to spotify" className={styles.login}/>     
                </form>
            </div>
        }
        </div>
     );
}

export default Homepage;
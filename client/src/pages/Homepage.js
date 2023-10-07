import { useEffect, useState } from "react"
import config from '../config.js'
import TopfyList from "../component/TopfyList.js"
import styles from "./homepage.module.css"
import people from "../assets/people-min.jpg"

function Homepage() {

    const [topfy_list, set_topfy_list] = useState(null)
    // const [isTwitterAuthorized, setisTwitterAuthorized] = useState(false)
    const [isSpotifyAuthorized, setisSpotifyAuthorized] = useState(false)
    
    useEffect(()=>{
        // if(localStorage.getItem('isTwitterAuthorized') == 'true'){
        //     setisTwitterAuthorized(true)
        // }
        if(localStorage.getItem('isSpotifyAuthorized') == 'true'){
            setisSpotifyAuthorized(true)
        }
    },[isSpotifyAuthorized])

    // async function connectToTwitter(event){
    //     event.preventDefault()
    //     const res = await fetch(config.ENDPOINTS.TWITTER_LOGIN)
    //     const data = await res.json()
    //     //redirect to auth link
    //     if(data.link===config.URLS.LOCALHOST){
    //         setisTwitterAuthorized(true)
    //         return
    //     }
    //     window.location.assign(data.link)
    // }

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

    async function generateTopfySongs(event){
        event.preventDefault()
        console.log("generating songs")
        const res = await fetch(config.ENDPOINTS.GENERATE_TOPFY)
        const data = await res.json()
        // console.log("status ",data.status)
    //    console.log(data.songsdata)
       set_topfy_list(data.songsdata);
    }

    return ( 
        <div className={styles.appcontainer}>
            <div className={styles.sideHeader}>
            <h1 className={styles.userName}>Welcome, mate!</h1>
            
           <div>
            {
                        isSpotifyAuthorized?
                            <form onSubmit={generateTopfySongs}>
                            <input type="submit" value="show my topfy" className={styles.showButton}/>     
                            </form>
                        :
                            <form onSubmit={connectToSpotify}>
                            <input type="submit" value="Connect to spotify" className={styles.showButton}/>     
                            </form>
                }
           </div>
           <img src={people} className={styles.sideHeaderImg}></img>

            </div>

            <div className={styles.content}>
                {/* {
                    isTwitterAuthorized?
                    <h1>Twitter Connected</h1>
                    :
                    <form onSubmit={connectToTwitter}>
                    <h1>Connect to Twitter</h1>
                    <input type="submit" value="Connect to twitter"/>     
                    </form>
                } */}
                
                {
                    topfy_list!=null ?
                    <TopfyList topfy={topfy_list}/>  :
                    <h1 className={styles.contentShowTopfy}>click on show topfy!</h1>
                }
            </div>
        
        </div>
     );
}

export default Homepage;
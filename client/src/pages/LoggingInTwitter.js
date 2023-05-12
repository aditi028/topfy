import { useEffect, useState } from "react";

function LoggingInTwitter() {

    const [isUserSignedIn, setIsUserSignedIn] = useState(false);

    useEffect(()=>{
        if(!isUserSignedIn)Login()
    },[isUserSignedIn])

    async function Login(){
        let search = window.location.search;     
        let params = new URLSearchParams(search);   
        const response = await fetch('http://localhost:1337/api/twitter/callback',{
                                    method: 'POST',
                                    headers:{
                                        'Content-Type': 'application/json', //to send data as json
                                    },
                                    body: JSON.stringify({
                                        token: params.get('oauth_token'),
                                        verifier: params.get('oauth_verifier')
                                    }),
                                })
        const data = await response.json() //note
        //this check is required.
        if(data.status=='twitterloggedin'){
            setIsUserSignedIn(true)
            localStorage.setItem('isTwitterAuthorized','true')
            window.location.href = '/'
        }
        else{
            window.alert(data.status)
        }
    } 

    // async function uploadBanner(){
    //     const response = await fetch('http://localhost:1337/api/uploadBanner',{
    //     method: 'POST',
    //     headers:{
    //         'Content-Type': 'application/json', //to send data as json
    //     },
    //     body: JSON.stringify({
    //         banner: 'banner'
    //     }),
    //     })
    //     const data = await response.json() //note
    // }

    return (
    <div>
        {
            !isUserSignedIn?
             <h1>"Logging you in.."</h1>:
             <h1>Logged In!</h1>

        }
    </div> );
}

export default LoggingInTwitter;
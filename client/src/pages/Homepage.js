function Homepage() {

    // const [searchParams, setSearchParams] = useSearchParams();
    

    async function connectToTwitter(event){
        event.preventDefault();
        const res = await fetch('http://localhost:1337/api/login')
        const data = await res.json()
        window.location.assign(data.link)
       //now get the query parameters and then do a post request to the server on callback + query parameters
    }

    async function connectToSpotify(event){
        event.preventDefault();
    }

    return ( 
        <div className="App">
        <form onSubmit={connectToTwitter}>
            <h1>Upload Twitter Banner</h1>
            <input type="submit" value="Upload"/>     
        </form>
        <form onSubmit={connectToSpotify}>
            <h1>Connect to spotify</h1>
            <input type="submit" value="Upload"/>     
        </form>
        </div>
     );
}

export default Homepage;
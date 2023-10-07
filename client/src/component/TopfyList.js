import styles from './topfyList.module.css'
import madeForYou from '../assets/madeForYou.png'
function TopfyList(props) {
    return ( 
        <div>
            {/* <div className={styles.topfylist_header}>
                
            </div> */}
            <div className={styles.topfy_list_heading}>
                <img src={madeForYou} className={styles.topfy_list_headingImage}></img>
                <div className={styles.topfy_list_headingTextContent}>
                    <h1 className={styles.topfy_list_headingText}>Topfy</h1>
                    <h2 className={styles.topfy_list_headingsubText}>your top five spotify songs for the week</h2>
                </div>
                
            </div>
            <div className={styles.topfylist_container}>
                {props.topfy.map((item, index) => (
                            <li key={index} className={styles.topfylist_li}>
                                <div className={styles.topfylist_li_song}>
                                    {item.track_name}
                                </div>
                                <div className={styles.topfylist_li_songInfo}>
                                    {item.track_album}
                                </div>  
                            </li>
                ))}
            </div>
        </div>
    );
}

export default TopfyList;
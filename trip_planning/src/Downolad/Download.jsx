import assets from "../assets/assets"
import './Donwload.css'
const Donwload=()=>{
    return(
        <>
        <hr className="break" />
     <div className="app-download"> 
        <p>
                for Bettter Expriance Download <br /> JournyVibe App
            </p>
            <div className='app-download-platforms'>
                <img src={assets.playStore} alt="" />
                <img src={assets.app_Store} alt="" />

            </div>
     </div>
     </>
    )
}

export default Donwload
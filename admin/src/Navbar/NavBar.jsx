
import "./Navbar.css"
import assets from "../assets/assets"
const Navbar=()=>{
return(
    <>
    <div className="navbar">
        <img className="logo" alt="Travogenie Admin" />
        <img className="profile"  src={assets.Logo} alt="" />
    </div>
    </>
)
}
export default Navbar
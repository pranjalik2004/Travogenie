import assets from '../assets/assets'
import './Footer.css'
const Footer =()=>{
return(
    <>
    <div className='footer' id='footer'>
        <div className="footer-content">
            <div className="footer-content-left">
                <img className='fot' src={assets.logo} alt="" />
                <p>"Explore the beauty of India with our personalized travel planning. From serene natural spots to thrilling trekking adventures, we help you create unforgettable journeys. Plan your trips effortlessly with advanced filters, budget-friendly options, and free booking links. Let us turn your travel dreams into cherished memories – your adventure starts here!"</p>
                <div className='footer-socail-icons'>
                    <img src={assets.facebook_icon} alt="" />
                    <img src={assets.twitter_icon} alt="" />
                    <img src={assets.linkdin}alt="" />
                </div>
            </div>
            <div className="footer-content-center" >
                <h2>Company</h2>
                <ul>
                    <li>Home</li>
                    <li>About us</li>
                  
                    <li>Privacy Policy</li>
                </ul>
            </div>
            <div className="footer-content-right">
                <h2>GET IN TOUCH </h2>
                <ul>
                    <li>+91 9579961664</li>
                    <li>contatc@travogenie.com</li>
                </ul>
            </div>

        </div>
        <hr />
        <p className="footer-copyright">
            copyright 2025 @ak.com -All Right Reserved
        </p>
    </div>
    </>
)
}
export default Footer
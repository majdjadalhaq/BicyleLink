import { Link } from "react-router-dom";
import "../styles/Footer.css";

const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="footer-content">
        <div className="footer-section brand">
          <h3>BiCycleL</h3>
          <p>The premium marketplace for second-hand bicycles.</p>
        </div>

        <div className="footer-section links">
          <h4>Explore</h4>
          <ul>
            <li>
              <Link to="/">Home</Link>
            </li>
            <li>
              <Link to="/listing/create">Sell a Bike</Link>
            </li>
            <li>
              <Link to="/user">Community</Link>
            </li>
          </ul>
        </div>

        <div className="footer-section legal">
          <h4>Legal</h4>
          <ul>
            <li>
              <span className="disabled-link">Terms of Service</span>
            </li>
            <li>
              <span className="disabled-link">Privacy Policy</span>
            </li>
            <li>
              <span className="disabled-link">Cookie Policy</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; {year} BiCycleL. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;

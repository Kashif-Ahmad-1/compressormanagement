// src/components/Navbar.js
import "./../dist/styles.css";
import { Link } from "react-router-dom";

import { useState } from "react";

function Navbar() {
  const [nav, setNav] = useState(false);

  const openNav = () => {
    setNav(!nav);
  };

  return (
    <>
      <nav>
        <div className="navbar">
          {/* Uncomment if you want the logo */}
          {/* <div className="navbar__img">
            <Link to="/" onClick={() => window.scrollTo(0, 0)}>
              <img src={Logo} alt="logo-img" />
            </Link>
          </div> */}
          <ul className="navbar__links">
            <li>
              <Link className="home-link" to="/">
                Home
              </Link>
            </li>
            {/* <li>
              <Link className="about-link" to="/about">
                About
              </Link>
            </li>
            <li>
              <Link className="contact-link" to="/contact">
                Contact
              </Link>
            </li> */}
          </ul>
          <div className="navbar__buttons">
            {/* <Link className="navbar__buttons__sign-in" to="/login">
              Sign In
            </Link> */}
            <Link className="navbar__buttons__register" to="/login">
              Sign In
            </Link>
          </div>

          {/* mobile */}
          <div className="mobile-hamb" onClick={openNav}>
            <i className="fa-solid fa-bars"></i>
          </div>
        </div>
      </nav>
    </>
  );
}

export default Navbar;


import "./../dist/styles.css";
import { Link } from "react-router-dom";
import BgShape from "../images/hero/hero-bg.png";
import HeroCar from "../images/hero/main-car.png";
import { useEffect, useState } from "react";
import Navbar from "./Navbar";

function Hero() {
  const [goUp, setGoUp] = useState(false);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  useEffect(() => {
    const onPageScroll = () => {
      if (window.pageYOffset > 600) {
        setGoUp(true);
      } else {
        setGoUp(false);
      }
    };
    window.addEventListener("scroll", onPageScroll);

    return () => {
      window.removeEventListener("scroll", onPageScroll);
    };
  }, []);

  return (
    <>
      <Navbar />
      <section id="home" className="hero-section">
        <div className="container">
          <img className="bg-shape" src={BgShape} alt="bg-shape" />
          <div className="hero-content">
            <div className="hero-content__text">
              <h4>Your Trusted Auto</h4>
              <h1>
                <span>Repair Shop</span>
              </h1>
              <p>
                Lorem ipsum dolor sit amet consectetur adipisicing elit. Eius
                rerum sed voluptates? Aspernatur fugiat iusto sapiente suscipit,
                unde, esse sint, consectetur necessitatibus atque perferendis
                quidem! Ut vero quibusdam modi laboriosam.
              </p>
              <div className="hero-content__text__btns">
                <Link
                  className="hero-content__text__btns__book-ride"
                  to="/login"
                >
                  Sign In &nbsp;
                  <i className="fa-solid fa-circle-check"></i>
                </Link>
                
              </div>
            </div>

            {/* img */}
            <img
              src={HeroCar}
              alt="car-img"
              className="hero-content__car-img"
            />
          </div>
        </div>

        {/* page up */}
        <div
          onClick={scrollToTop}
          className={`scroll-up ${goUp ? "show-scroll" : ""}`}
        >
          <i className="fa-solid fa-angle-up"></i>
        </div>
      </section>
    </>
  );
}

export default Hero;

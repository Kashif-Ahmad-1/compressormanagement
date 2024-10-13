import React, { useState, useContext } from "react";
import HeroCar from "./../../images/company logo/comp-logo.jpeg";
import { FaEye, FaEyeSlash } from "react-icons/fa6";
import styles from './Login.module.css';
import { useNavigate } from "react-router-dom";
import AuthContext from "./../../Store/AuthContext";
import ForgotPasswordModal from "./ForgotPasswordModal";
import {API_BASE_URL} from './../../config';

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      if (response.ok) {
        login(data.token, data.role);
        
        switch (data.role) {
          case "admin":
            navigate("/admin");
            break;
          case "engineer":
            navigate("/engineerservice");
            break;
          case "accountant":
            navigate("/accountspage");
            break;
          default:
            navigate("/");
        }
      } else {
        alert(data.message || "Login failed!");
      }
    } catch (error) {
      console.error("Error logging in:", error);
      alert("An error occurred, please try again.");
    }
  };

  return (
    <div className={styles.loginMain}>
      <div className={styles.loginLeft}>
        <img src={HeroCar} alt="Hero Car" />
      </div>
      <div className={styles.loginRight}>
        <div className={styles.loginRightContainer}>
          <div className={styles.loginLogo}></div>
          <div className={styles.loginCenter}>
            <h2>Welcome back!</h2>
            <p>Please enter your details</p>
            <form onSubmit={handleLogin}>
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <div className={styles.passInputDiv}>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                {showPassword ? (
                  <FaEyeSlash onClick={() => setShowPassword(!showPassword)} />
                ) : (
                  <FaEye onClick={() => setShowPassword(!showPassword)} />
                )}
              </div>
              <div className={styles.loginCenterButtons}>
                <button className="login-button" type="submit">Log In</button>
                <button className="forgot-button" type="button" onClick={() => setIsModalOpen(true)}>
                  Forgot Password?
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      {isModalOpen && <ForgotPasswordModal onClose={() => setIsModalOpen(false)} />}
    </div>
  );
};

export default Login;

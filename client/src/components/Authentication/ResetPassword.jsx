import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import styles from './ResetPassword.module.css'; // Assuming you have a CSS module for styling
import {API_BASE_URL} from './../../config';
const ResetPassword = () => {
  const { token } = useParams(); // Get token from URL
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/reset`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, newPassword }),
      });

      const data = await response.json();
      if (response.ok) {
        setMessage(data.message); // Notify user of success
      } else {
        setError(data.message || 'Error resetting password.');
      }
    } catch (error) {
      console.error('Error resetting password:', error);
      setError('An error occurred, please try again.');
    }
  };

  return (
    <div className={styles.container}>
      <h2>Reset Your Password</h2>
      <form onSubmit={handleResetPassword} className={styles.form}>
        <input
          type="password"
          placeholder="New Password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
          className={styles.input}
        />
        <button type="submit" className={styles.button}>Reset Password</button>
      </form>
      {message && <p className={styles.success}>{message}</p>}
      {error && <p className={styles.error}>{error}</p>}
    </div>
  );
};

export default ResetPassword;

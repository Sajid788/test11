import React, { useState, useEffect } from 'react';
import './App.css';
import api, { setTokens, getTokens, clearTokens } from './api/axios';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [user, setUser] = useState(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  // Check if user is already logged in on mount
  useEffect(() => {
    const tokens = getTokens();
    if (tokens.accessToken && tokens.refreshToken) {
      setIsLoggedIn(true);
      // Try to fetch user info
      fetchProtectedData();
    }
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const response = await api.post('/login', { username, password });
      const { accessToken, refreshToken, user: userData } = response.data;

      // Store tokens
      setTokens(accessToken, refreshToken);
      setUser(userData);
      setIsLoggedIn(true);
      setMessage('Login successful!');
    } catch (error) {
      setMessage(error.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    clearTokens();
    setIsLoggedIn(false);
    setUser(null);
    setMessage('Logged out successfully');
  };

  const fetchProtectedData = async () => {
    setLoading(true);
    setMessage('');

    try {
      const response = await api.get('/protected');
      setMessage(response.data.message);
      setUser(response.data.user);
    } catch (error) {
      setMessage(error.response?.data?.error || 'Failed to fetch protected data');
      if (error.response?.status === 401 || error.response?.status === 403) {
        setIsLoggedIn(false);
        setUser(null);
      }
    } finally {
      setLoading(false);
    }
  };

  if (isLoggedIn) {
    return (
      <div className="App">
        <div className="container">
          <h1>Welcome!</h1>
          <div className="user-info">
            <p>Logged in as: <strong>{user?.username}</strong></p>
            <p>User ID: {user?.id}</p>
          </div>
          <div className="button-group">
            <button onClick={fetchProtectedData} disabled={loading}>
              {loading ? 'Loading...' : 'Fetch Protected Data'}
            </button>
            <button onClick={handleLogout}>Logout</button>
          </div>
          {message && (
            <div className={`message ${message.includes('error') || message.includes('Failed') ? 'error' : 'success'}`}>
              {message}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="App">
      <div className="container">
        <h1>Login</h1>
        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label>Username:</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Password:</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        {message && (
          <div className={`message ${message.includes('error') || message.includes('Invalid') ? 'error' : 'success'}`}>
            {message}
          </div>
        )}
        <div className="hint">
          <p>Try: admin/password123 or user/user123</p>
        </div>
      </div>
    </div>
  );
}

export default App;


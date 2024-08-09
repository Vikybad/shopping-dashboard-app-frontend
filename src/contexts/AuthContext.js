import { createContext, useState, useEffect } from 'react';

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(null);

  // Load the token from local storage on component mount
  useEffect(() => {
    const savedToken = localStorage.getItem('authToken');
    console.log('Loaded token from localStorage:', savedToken);
    if (savedToken) {
      setToken(savedToken);
    }
  }, []);

  const login = (token) => {
    console.log(`Setting token: `, token);
    setToken(token);

    // Save token to local storage to use on page refresh
    localStorage.setItem('authToken', token);
  };

  const logout = () => {
    setToken(null);
    // Remove token from local storage on logout and generate new token on login again
    localStorage.removeItem('authToken');
  };

  return (
    <AuthContext.Provider value={{ token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export { AuthProvider, AuthContext };

import React, { createContext, useState, useEffect } from "react";
import axios from "axios";

export const UserContext = createContext();

const fetchUserData = async (email) => {
  const response = await axios.post(
    "https://fsywgygjrg.execute-api.us-east-1.amazonaws.com/dev/login/userDetails",
    { email: email }
  );
  return JSON.parse(response.data.body);
};

export const UserProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const email = localStorage.getItem("userEmail");
    if (email) {
      setIsLoggedIn(true);
      fetchUserData(email).then((data) => setUserData(data));
    }
  }, []);

  const loginUser = (email) => {
    localStorage.setItem("userEmail", email);
    setIsLoggedIn(true);
    fetchUserData(email).then((data) => setUserData(data));
  };

  const logoutUser = () => {
    localStorage.removeItem("userEmail");
    setIsLoggedIn(false);
    setUserData(null);
  };

  return (
    <UserContext.Provider
      value={{ isLoggedIn, userData, loginUser, logoutUser }}
    >
      {children}
    </UserContext.Provider>
  );
};

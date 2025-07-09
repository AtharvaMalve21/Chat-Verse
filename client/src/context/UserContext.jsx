import { createContext, useEffect, useState } from "react";
import axios from "axios";

export const UserContext = createContext({});

export const UserContextProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const URI = import.meta.env.VITE_BACKEND_URI;

  const fetchUserDetails = async () => {
    try {
      const { data } = await axios.get(URI + "/api/v1/user/profile", { withCredentials: true });
      if (data.success) {
        setUser(data.data);
        setIsLoggedIn(true);
      }
    } catch (err) {
      console.log(err.response.data.message)
    }
  };

  useEffect(() => {
    fetchUserDetails();
  }, [isLoggedIn]);

  const value = {
    user,
    setUser,
    isLoggedIn,
    setIsLoggedIn,
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};

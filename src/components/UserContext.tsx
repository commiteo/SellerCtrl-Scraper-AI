
import React, { createContext, useContext, useState } from "react";

type User = {
  name: string;
  email: string;
  avatar: string | null;
};

type UserContextType = {
  user: User;
  setAvatar: (url: string) => void;
};

const defaultUser: User = {
  name: "Ali Hassan",
  email: "3lol@sellerctrl.com",
  avatar: "https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?auto=format&fit=facearea&w=128&q=80",
};

const UserContext = createContext<UserContextType>({
  user: defaultUser,
  setAvatar: () => {},
});

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User>(defaultUser);

  const setAvatar = (avatarUrl: string) => {
    setUser(current => ({ ...current, avatar: avatarUrl }));
  };

  return (
    <UserContext.Provider value={{ user, setAvatar }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);


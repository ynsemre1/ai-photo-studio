import React, { createContext, useContext, useEffect, useState } from "react";
import { getAuth } from "firebase/auth";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../firebase/config";

type UserData = {
  name?: string;
  surname?: string;
  email?: string;
};

type UserContextType = {
  userData: UserData | null;
  loading: boolean;
};

const UserContext = createContext<UserContextType>({
  userData: null,
  loading: true,
});

export const useUser = () => useContext(UserContext);

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const user = getAuth().currentUser;

  useEffect(() => {
    if (!user) return;

    const docRef = doc(db, "users", user.uid);
    const unsubscribe = onSnapshot(docRef, (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        setUserData({
          name: data.name ?? "",
          surname: data.surname ?? "",
          email: data.email ?? user.email ?? "",
        });
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  return (
    <UserContext.Provider value={{ userData, loading }}>
      {children}
    </UserContext.Provider>
  );
};
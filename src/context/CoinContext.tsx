import React, { createContext, useContext, useEffect, useState } from "react";
import { getAuth } from "firebase/auth";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../firebase/config";

type CoinContextType = {
  coin: number;
  loading: boolean;
};

const CoinContext = createContext<CoinContextType>({
  coin: 0,
  loading: true,
});

export const useCoin = () => useContext(CoinContext);

export const CoinProvider = ({ children }: { children: React.ReactNode }) => {
  const [coin, setCoin] = useState(0);
  const [loading, setLoading] = useState(true);
  const user = getAuth().currentUser;

  useEffect(() => {
    if (!user) return;

    const docRef = doc(db, "users", user.uid);
    const unsubscribe = onSnapshot(docRef, (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        setCoin(data.coin ?? 0);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  return (
    <CoinContext.Provider value={{ coin, loading }}>
      {children}
    </CoinContext.Provider>
  );
};
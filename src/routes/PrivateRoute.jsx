import React, { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase";
import { toast } from 'react-toastify';

const PrivateRoute = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showedToast, setShowedToast] = useState(false); // 👈 agar tidak spam

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser && !showedToast) {
        toast.warning("Silakan login terlebih dahulu untuk mengakses halaman ini.");
        setShowedToast(true);
      }
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [showedToast]);

  if (loading) return <div>Loading...</div>;

  return user ? children : <Navigate to="/login" />;
};

export default PrivateRoute;

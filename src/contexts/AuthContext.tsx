import React, { createContext, useContext, useEffect, useState } from "react";
<<<<<<< HEAD
import { onAuthStateChanged, doc, getDoc, auth, db, type AuthUser } from "../auth";
import { UserProfile, Role } from "../types";
import { api } from "../lib/api";

interface AuthContextType {
  user: AuthUser | null;
=======
import { onAuthStateChanged, User } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../firebase";
import { UserProfile, Role } from "../types";

interface AuthContextType {
  user: User | null;
>>>>>>> 07d88a3f94376a0edfc22f9304ff5f7dd0cf413f
  profile: UserProfile | null;
  loading: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  isAdmin: false,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
<<<<<<< HEAD
  const [user, setUser] = useState<AuthUser | null>(null);
=======
  const [user, setUser] = useState<User | null>(null);
>>>>>>> 07d88a3f94376a0edfc22f9304ff5f7dd0cf413f
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
<<<<<<< HEAD
      setLoading(false);

=======
      
>>>>>>> 07d88a3f94376a0edfc22f9304ff5f7dd0cf413f
      if (firebaseUser) {
        try {
          const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
          if (userDoc.exists()) {
            setProfile(userDoc.data() as UserProfile);
          } else {
            setProfile(null);
          }
<<<<<<< HEAD

          const response = await api.syncProfile({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName,
            photoURL: firebaseUser.photoURL,
          });
          const { token } = response as { token?: string };
          if (token) {
            localStorage.setItem("civicmitra:token", token);
          }
=======
>>>>>>> 07d88a3f94376a0edfc22f9304ff5f7dd0cf413f
        } catch (error) {
          console.error("Error fetching user profile:", error);
          setProfile(null);
        }
      } else {
<<<<<<< HEAD
        localStorage.removeItem("civicmitra:token");
        setProfile(null);
      }
=======
        setProfile(null);
      }
      
      setLoading(false);
>>>>>>> 07d88a3f94376a0edfc22f9304ff5f7dd0cf413f
    });

    return () => unsubscribe();
  }, []);

  const isAdmin = profile?.role === Role.ADMIN || user?.email === "arcadeabhi6@gmail.com";

  return (
    <AuthContext.Provider value={{ user, profile, loading, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
};

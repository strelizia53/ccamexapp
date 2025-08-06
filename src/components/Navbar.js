"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { auth, db } from "@/firebase/config";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

export default function Navbar() {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null); // For username & userType

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);

        // Fetch additional user info from Firestore
        const userRef = doc(db, "users", firebaseUser.uid);
        const docSnap = await getDoc(userRef);
        if (docSnap.exists()) {
          setUserData(docSnap.data());
        }
      } else {
        setUser(null);
        setUserData(null);
      }
    });

    return () => unsubscribe(); // Cleanup on unmount
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    setUser(null);
    setUserData(null);
  };

  const getDashboardPath = () => {
    if (!userData) return "/";
    const role = userData.userType?.toLowerCase();
    if (role === "admin") return "/admin";
    if (role === "trainer") return "/trainer";
    if (role === "trainee") return "/trainee";
    return "/";
  };

  return (
    <nav style={styles.nav}>
      <div style={styles.left}>
        <Link href="/" style={styles.brand}>
          Amex
        </Link>
      </div>
      <ul style={styles.right}>
        {!user ? (
          <>
            <li>
              <Link href="/login">Login</Link>
            </li>
            <li>
              <Link href="/register">Register</Link>
            </li>
          </>
        ) : (
          <>
            <li>
              <Link href={getDashboardPath()} style={styles.link}>
                Dashboard
              </Link>
            </li>
            <li style={styles.username}>{userData?.username || "User"}</li>
            <li>
              <button onClick={handleLogout} style={styles.logoutButton}>
                Logout
              </button>
            </li>
          </>
        )}
      </ul>
    </nav>
  );
}

const styles = {
  nav: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "1rem 2rem",
    backgroundColor: "#121212",
    borderBottom: "1px solid #1f1f1f",
  },
  left: {
    flex: 1,
  },
  brand: {
    fontSize: "1.5rem",
    fontWeight: "bold",
    color: "#00e6c2",
    textDecoration: "none",
  },
  right: {
    flex: 1,
    display: "flex",
    justifyContent: "flex-end",
    gap: "1.5rem",
    listStyle: "none",
    alignItems: "center",
  },
  link: {
    color: "#e0fdfb",
    textDecoration: "none",
    fontWeight: "bold",
  },
  username: {
    color: "#00e6c2",
    fontWeight: "bold",
  },
  logoutButton: {
    backgroundColor: "#00bfa5",
    color: "#0d0d0d",
    border: "none",
    padding: "8px 16px",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "bold",
  },
};

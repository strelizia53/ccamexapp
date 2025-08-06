"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { auth } from "@/firebase/config";
import { onAuthStateChanged, signOut } from "firebase/auth";

export default function Navbar() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
    });

    return () => unsubscribe(); // Cleanup listener on unmount
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    setUser(null);
  };

  return (
    <nav style={styles.nav}>
      <div style={styles.left}>
        <span style={styles.brand}>Amex</span>
      </div>
      <ul style={styles.right}>
        <li>
          <Link href="/">Home</Link>
        </li>
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
            <li style={styles.username}> {user.email}</li>
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
  },
  right: {
    flex: 1,
    display: "flex",
    justifyContent: "flex-end",
    gap: "1.5rem",
    listStyle: "none",
    alignItems: "center",
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

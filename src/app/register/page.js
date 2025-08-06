"use client";

import { useState } from "react";
import { auth, db } from "@/firebase/config";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    userType: "trainee",
  });

  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { username, email, password, userType } = formData;

    if (!username || !email || !password) {
      alert("Please fill in all fields.");
      return;
    }

    try {
      // Register user with Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      const uid = userCredential.user.uid;

      // Store additional user info in Firestore
      await setDoc(doc(db, "users", uid), {
        username,
        email,
        userType,
      });

      setSubmitted(true);
    } catch (error) {
      console.error("Registration error:", error.message);
      alert("Registration failed: " + error.message);
    }
  };

  if (submitted) {
    return (
      <div style={styles.container}>
        <h1>✅ Registered!</h1>
        <p>
          Welcome, {formData.username}! You registered as a{" "}
          <strong>{formData.userType}</strong>.
        </p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <h1>Register</h1>
      <form onSubmit={handleSubmit} style={styles.form}>
        <label style={styles.label}>
          Username:
          <input
            style={styles.input}
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
          />
        </label>

        <label style={styles.label}>
          Email:
          <input
            style={styles.input}
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
          />
        </label>

        <label style={styles.label}>
          Password:
          <input
            style={styles.input}
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
          />
        </label>

        <label style={styles.label}>
          User Type:
          <select
            style={styles.input}
            name="userType"
            value={formData.userType}
            onChange={handleChange}
          >
            <option value="trainer">Trainer</option>
            <option value="trainee">Trainee</option>
          </select>
        </label>

        <button type="submit" className="button">
          Register
        </button>
      </form>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: "500px",
    margin: "0 auto",
    padding: "2rem",
    backgroundColor: "#121212",
    borderRadius: "10px",
    boxShadow: "0 0 20px rgba(0,255,255,0.05)",
    color: "#e0fdfb",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "1.5rem",
  },
  label: {
    display: "flex",
    flexDirection: "column",
    fontWeight: "bold",
    fontSize: "1rem",
    color: "#00e6c2",
  },
  input: {
    marginTop: "0.5rem",
    padding: "0.7rem",
    fontSize: "1rem",
    borderRadius: "6px",
    border: "1px solid #00bfa5",
    backgroundColor: "#0d0d0d",
    color: "#e0fdfb",
  },
};

"use client"; // Enables client-side interactivity

import { useState } from "react";

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Simple validation
    if (!formData.email || !formData.password) {
      alert("Please fill in all fields.");
      return;
    }

    // Placeholder for actual login logic
    console.log("Logging in with:", formData);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div style={styles.container}>
        <h1>✅ Logged In</h1>
        <p>Welcome back!</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <h1>Login</h1>
      <form onSubmit={handleSubmit} style={styles.form}>
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

        <button type="submit" className="button">
          Login
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

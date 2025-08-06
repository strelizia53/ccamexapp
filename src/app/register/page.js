"use client"; // Enables client-side interactivity

import { useState } from "react";

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    userType: "trainee",
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
    if (!formData.username || !formData.email) {
      alert("Please fill in all fields.");
      return;
    }

    // Placeholder for submit logic (e.g. API call)
    console.log("Registering user:", formData);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div>
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

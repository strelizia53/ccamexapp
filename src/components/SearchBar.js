// src/components/SearchBar.js
"use client";

export default function SearchBar({ searchQuery, setSearchQuery }) {
  return (
    <input
      type="text"
      placeholder="Search by training area..."
      value={searchQuery}
      onChange={(e) => setSearchQuery(e.target.value)}
      style={styles.input}
    />
  );
}

const styles = {
  input: {
    width: "100%",
    padding: "0.75rem",
    fontSize: "1rem",
    borderRadius: "8px",
    border: "1px solid #00bfa5",
    marginBottom: "2rem",
    backgroundColor: "#0d0d0d",
    color: "#e0fdfb",
  },
};

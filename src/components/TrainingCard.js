// components/TrainingCard.js
"use client";

import Link from "next/link";

export default function TrainingCard({ program }) {
  return (
    <Link href={`/programs/${program.id}`} style={styles.link}>
      <div style={styles.card}>
        <h3>{program.trainingArea}</h3>
        <p>
          <strong>Trainer:</strong> {program.trainerName}
        </p>
        <p>
          <strong>Schedule:</strong>{" "}
          {new Date(program.schedule).toLocaleString()}
        </p>
        <p>
          <strong>Venue:</strong> {program.venue}
        </p>
      </div>
    </Link>
  );
}

const styles = {
  link: {
    textDecoration: "none",
  },
  card: {
    backgroundColor: "#1a1a1a",
    padding: "1rem",
    borderRadius: "8px",
    border: "1px solid #00bfa5",
    cursor: "pointer",
    transition: "transform 0.2s ease, box-shadow 0.2s ease",
    color: "#e0fdfb",
  },
};

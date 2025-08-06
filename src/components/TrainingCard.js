// src/components/TrainingCard.js
export default function TrainingCard({ program }) {
  return (
    <div style={styles.card}>
      <h3 style={styles.title}>{program.trainingArea}</h3>
      <p>
        <strong>Trainer:</strong> {program.trainerName}
      </p>
      <p>
        <strong>Schedule:</strong> {new Date(program.schedule).toLocaleString()}
      </p>
      <p>
        <strong>Venue:</strong> {program.venue}
      </p>
      {program.prerequisites && (
        <p>
          <strong>Prerequisites:</strong> {program.prerequisites}
        </p>
      )}
    </div>
  );
}

const styles = {
  card: {
    backgroundColor: "#1a1a1a",
    padding: "1.5rem",
    borderRadius: "10px",
    border: "1px solid #00bfa5",
    marginBottom: "1.5rem",
    boxShadow: "0 0 15px rgba(0,255,255,0.05)",
  },
  title: {
    fontSize: "1.5rem",
    marginBottom: "0.5rem",
    color: "#00e6c2",
  },
};

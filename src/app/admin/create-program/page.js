"use client";

import { useState, useEffect } from "react";
import { db } from "@/firebase/config";
import { collection, getDocs, addDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";

export default function CreateTrainingProgram() {
  const [formData, setFormData] = useState({
    trainingArea: "",
    trainerId: "",
    trainerName: "",
    schedule: "",
    venue: "",
    prerequisites: "",
  });

  const [trainers, setTrainers] = useState([]);
  const router = useRouter();

  useEffect(() => {
    const fetchTrainers = async () => {
      const querySnapshot = await getDocs(collection(db, "users"));
      const trainerList = querySnapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }))
        .filter((user) => user.userType === "trainer");

      setTrainers(trainerList);
    };

    fetchTrainers();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "trainerId") {
      const selectedTrainer = trainers.find((trainer) => trainer.id === value);
      setFormData((prev) => ({
        ...prev,
        trainerId: value,
        trainerName: selectedTrainer ? selectedTrainer.username : "",
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !formData.trainingArea ||
      !formData.trainerId ||
      !formData.schedule ||
      !formData.venue
    ) {
      alert("Please fill in all required fields.");
      return;
    }

    try {
      await addDoc(collection(db, "trainings"), {
        ...formData,
        createdAt: new Date().toISOString(),
        registeredUsers: [],
        feedback: [],
      });

      alert("Training program created!");
      router.push("/admin"); // Go back to dashboard
    } catch (error) {
      console.error("Error creating training:", error.message);
      alert("Failed to create training.");
    }
  };

  return (
    <div style={styles.container}>
      <h1>Create Training Program</h1>
      <form onSubmit={handleSubmit} style={styles.form}>
        <label style={styles.label}>
          Training Area:
          <input
            style={styles.input}
            type="text"
            name="trainingArea"
            value={formData.trainingArea}
            onChange={handleChange}
          />
        </label>

        <label style={styles.label}>
          Trainer:
          <select
            style={styles.input}
            name="trainerId"
            value={formData.trainerId}
            onChange={handleChange}
          >
            <option value="">Select Trainer</option>
            {trainers.map((trainer) => (
              <option key={trainer.id} value={trainer.id}>
                {trainer.username} ({trainer.email})
              </option>
            ))}
          </select>
        </label>

        <label style={styles.label}>
          Schedule:
          <input
            style={styles.input}
            type="datetime-local"
            name="schedule"
            value={formData.schedule}
            onChange={handleChange}
          />
        </label>

        <label style={styles.label}>
          Venue:
          <input
            style={styles.input}
            type="text"
            name="venue"
            value={formData.venue}
            onChange={handleChange}
          />
        </label>

        <label style={styles.label}>
          Prerequisites:
          <textarea
            style={styles.input}
            name="prerequisites"
            value={formData.prerequisites}
            onChange={handleChange}
          />
        </label>

        <button type="submit" className="button">
          Create Program
        </button>
      </form>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: "600px",
    margin: "0 auto",
    padding: "2rem",
    backgroundColor: "#121212",
    borderRadius: "12px",
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
    color: "#00e6c2",
    fontWeight: "bold",
  },
  input: {
    marginTop: "0.5rem",
    padding: "0.7rem",
    borderRadius: "6px",
    border: "1px solid #00bfa5",
    backgroundColor: "#0d0d0d",
    color: "#e0fdfb",
    fontSize: "1rem",
  },
};

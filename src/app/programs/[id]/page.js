"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { db } from "@/firebase/config";
import { doc, getDoc } from "firebase/firestore";

export default function ProgramDetails() {
  const { id } = useParams();
  const [program, setProgram] = useState(null);

  useEffect(() => {
    const fetchProgram = async () => {
      const docRef = doc(db, "trainings", id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setProgram(docSnap.data());
      }
    };

    fetchProgram();
  }, [id]);

  if (!program) return <p>Loading...</p>;

  return (
    <div style={styles.container}>
      <h1>{program.trainingArea}</h1>
      <p>
        <strong>Trainer:</strong> {program.trainerName}
      </p>
      <p>
        <strong>Schedule:</strong> {new Date(program.schedule).toLocaleString()}
      </p>
      <p>
        <strong>Venue:</strong> {program.venue}
      </p>
      <p>
        <strong>prerequisites:</strong>{" "}
        {program.prerequisites || "No prerequisites provided."}
      </p>
    </div>
  );
}

const styles = {
  container: {
    padding: "2rem",
    color: "#e0fdfb",
    backgroundColor: "#121212",
  },
};

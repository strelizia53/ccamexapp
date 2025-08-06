"use client";

import { useEffect, useState } from "react";
import { auth, db } from "@/firebase/config";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";
import {
  collection,
  getDocs,
  doc,
  getDoc,
  query,
  where,
} from "firebase/firestore";

export default function TrainerDashboard() {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [programs, setPrograms] = useState([]);
  const [traineeLists, setTraineeLists] = useState({});
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        router.push("/login");
        return;
      }

      setUser(firebaseUser);

      const userRef = doc(db, "users", firebaseUser.uid);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        setUserData(userSnap.data());
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchTrainerPrograms = async () => {
      if (!user) return;
      const q = query(
        collection(db, "trainings"),
        where("trainerId", "==", user.uid)
      );
      const snapshot = await getDocs(q);
      const programData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setPrograms(programData);

      // Load trainees for each program
      const traineeMap = {};

      for (let program of programData) {
        const regQ = query(
          collection(db, "registrations"),
          where("trainingId", "==", program.id)
        );
        const regSnap = await getDocs(regQ);
        const traineeIds = regSnap.docs.map((doc) => doc.data().traineeId);

        const trainees = [];
        for (let id of traineeIds) {
          const traineeDoc = await getDoc(doc(db, "users", id));
          if (traineeDoc.exists()) {
            trainees.push(traineeDoc.data().username || id);
          }
        }

        traineeMap[program.id] = trainees;
      }

      setTraineeLists(traineeMap);
    };

    fetchTrainerPrograms();
  }, [user]);

  return (
    <div style={styles.container}>
      <h1 style={styles.heading}>👋 Trainer Dashboard</h1>
      {userData && <p style={styles.welcome}>Welcome, {userData.username}</p>}

      <h2 style={styles.section}>📋 Your Training Programs</h2>
      {programs.length === 0 ? (
        <p>You have not created any training programs.</p>
      ) : (
        <div style={styles.grid}>
          {programs.map((program) => (
            <div key={program.id} style={styles.card}>
              <h3>{program.trainingArea}</h3>
              <p>
                <strong>Schedule:</strong>{" "}
                {new Date(program.schedule).toLocaleString()}
              </p>
              <p>
                <strong>Venue:</strong> {program.venue}
              </p>

              <details style={styles.details}>
                <summary>
                  View Trainees ({traineeLists[program.id]?.length || 0})
                </summary>
                <ul>
                  {traineeLists[program.id]?.length > 0 ? (
                    traineeLists[program.id].map((name, idx) => (
                      <li key={idx}>{name}</li>
                    ))
                  ) : (
                    <li>No trainees registered yet.</li>
                  )}
                </ul>
              </details>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    padding: "2rem",
    backgroundColor: "#121212",
    color: "#e0fdfb",
    minHeight: "100vh",
    width: "100%",
  },
  heading: {
    fontSize: "2.5rem",
    color: "#00e6c2",
  },
  welcome: {
    fontSize: "1.2rem",
    color: "#00bfa5",
    marginBottom: "2rem",
  },
  section: {
    fontSize: "1.5rem",
    marginBottom: "1rem",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
    gap: "1.5rem",
  },
  card: {
    backgroundColor: "#1a1a1a",
    padding: "1rem",
    borderRadius: "10px",
    border: "1px solid #00bfa5",
  },
  details: {
    marginTop: "1rem",
    backgroundColor: "#191919",
    padding: "0.5rem 1rem",
    borderRadius: "6px",
  },
};

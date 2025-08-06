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

export default function TraineeDashboard() {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [enrolledPrograms, setEnrolledPrograms] = useState([]);
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
    const fetchEnrolledPrograms = async () => {
      if (!user) return;

      const q = query(
        collection(db, "registrations"),
        where("traineeId", "==", user.uid)
      );
      const regSnap = await getDocs(q);

      const trainingIds = regSnap.docs.map((doc) => doc.data().trainingId);

      const trainingPromises = trainingIds.map(async (id) => {
        const trainingDoc = await getDoc(doc(db, "trainings", id));
        return { id, ...trainingDoc.data() };
      });

      const trainings = await Promise.all(trainingPromises);
      trainings.sort((a, b) => new Date(a.schedule) - new Date(b.schedule));
      setEnrolledPrograms(trainings);
    };

    fetchEnrolledPrograms();
  }, [user]);

  return (
    <div style={styles.container}>
      <h1 style={styles.heading}> Trainee Dashboard</h1>
      {userData && <p style={styles.welcome}>Welcome, {userData.username}!</p>}

      <h2 style={styles.sectionTitle}> Enrolled Programs</h2>

      {enrolledPrograms.length === 0 ? (
        <p>You are not enrolled in any training programs yet.</p>
      ) : (
        <div style={styles.grid}>
          {enrolledPrograms.map((program) => (
            <div key={program.id} style={styles.card}>
              <h3>{program.trainingArea}</h3>
              <p>
                <strong>Trainer:</strong> {program.trainerName}
              </p>
              <p>
                <strong>Venue:</strong> {program.venue}
              </p>
              <p>
                <strong>Schedule:</strong>{" "}
                {new Date(program.schedule).toLocaleString()}
              </p>

              {new Date(program.schedule) > new Date() && (
                <p style={styles.upcoming}>⏰ Upcoming</p>
              )}
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
  },
  heading: {
    fontSize: "2.5rem",
    color: "#00e6c2",
    marginBottom: "1rem",
  },
  welcome: {
    fontSize: "1.2rem",
    color: "#00bfa5",
    marginBottom: "2rem",
  },
  sectionTitle: {
    fontSize: "1.5rem",
    marginBottom: "1rem",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: "1.5rem",
  },
  card: {
    backgroundColor: "#1a1a1a",
    padding: "1rem",
    borderRadius: "10px",
    border: "1px solid #00bfa5",
  },
  upcoming: {
    marginTop: "0.5rem",
    color: "#00e6c2",
    fontWeight: "bold",
  },
};

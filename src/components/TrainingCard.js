"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { auth, db } from "@/firebase/config";
import {
  collection,
  addDoc,
  getDoc,
  getDocs,
  query,
  where,
  doc,
  Timestamp,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

export default function TrainingCard({ program }) {
  const [user, setUser] = useState(null);
  const [userType, setUserType] = useState(null);
  const [alreadyEnrolled, setAlreadyEnrolled] = useState(false);
  const [enrolling, setEnrolling] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);

        // Fetch userType
        const userRef = doc(db, "users", firebaseUser.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          const data = userSnap.data();
          setUserType(data.userType);

          // Check if already enrolled
          const q = query(
            collection(db, "registrations"),
            where("traineeId", "==", firebaseUser.uid),
            where("trainingId", "==", program.id)
          );
          const regSnap = await getDocs(q);
          if (!regSnap.empty) setAlreadyEnrolled(true);
        }
      }
    });

    return () => unsubscribe();
  }, [program.id]);

  const handleEnroll = async () => {
    if (!user || alreadyEnrolled || enrolling) return;
    try {
      setEnrolling(true);
      await addDoc(collection(db, "registrations"), {
        traineeId: user.uid,
        trainingId: program.id,
        registeredAt: Timestamp.now(),
      });
      setAlreadyEnrolled(true);
      alert("Enrolled successfully!");
    } catch (err) {
      console.error("Enrollment failed:", err);
      alert("Enrollment failed. Please try again.");
    } finally {
      setEnrolling(false);
    }
  };

  return (
    <div style={styles.card}>
      <Link href={`/programs/${program.id}`} style={styles.link}>
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
      </Link>

      {userType === "trainee" && (
        <button
          onClick={handleEnroll}
          disabled={alreadyEnrolled || enrolling}
          style={{
            ...styles.enrollButton,
            backgroundColor: alreadyEnrolled ? "#444" : "#00bfa5",
            cursor: alreadyEnrolled ? "not-allowed" : "pointer",
          }}
        >
          {alreadyEnrolled ? "Enrolled" : enrolling ? "Enrolling..." : "Enroll"}
        </button>
      )}
    </div>
  );
}

const styles = {
  card: {
    backgroundColor: "#1a1a1a",
    padding: "1rem",
    borderRadius: "8px",
    border: "1px solid #00bfa5",
    color: "#e0fdfb",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    height: "100%",
  },
  link: {
    textDecoration: "none",
    color: "#e0fdfb",
    marginBottom: "1rem",
  },
  enrollButton: {
    marginTop: "1rem",
    padding: "10px 16px",
    border: "none",
    borderRadius: "6px",
    color: "#0d0d0d",
    fontWeight: "bold",
  },
};

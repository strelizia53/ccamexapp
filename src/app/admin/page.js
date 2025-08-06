"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/firebase/config";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { collection, getDocs } from "firebase/firestore";

import SearchBar from "@/components/SearchBar";
import TrainingCard from "@/components/TrainingCard";

export default function AdminDashboard() {
  const [trainings, setTrainings] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const cardsPerPage = 9;

  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (!firebaseUser) {
        router.push("/login");
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchTrainings = async () => {
      const querySnapshot = await getDocs(collection(db, "trainings"));
      const trainingList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setTrainings(trainingList);
    };

    fetchTrainings();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/login");
  };

  const filteredPrograms = trainings.filter((p) =>
    p.trainingArea.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const indexOfLastCard = currentPage * cardsPerPage;
  const indexOfFirstCard = indexOfLastCard - cardsPerPage;
  const currentCards = filteredPrograms.slice(
    indexOfFirstCard,
    indexOfLastCard
  );
  const totalPages = Math.ceil(filteredPrograms.length / cardsPerPage);

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.heading}>Admin Dashboard</h1>
        <div>
          <button onClick={handleLogout} style={styles.logoutButton}>
            Logout
          </button>
          <button
            style={styles.createButton}
            onClick={() => router.push("/admin/create-program")}
          >
            ➕ Create New Training Program
          </button>
        </div>
      </header>

      <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

      <section style={styles.gridContainer}>
        {currentCards.length === 0 ? (
          <p>No training programs found.</p>
        ) : (
          currentCards.map((program) => (
            <div key={program.id} style={styles.cardWrapper}>
              <TrainingCard program={program} />
            </div>
          ))
        )}
      </section>

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={styles.pagination}>
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              onClick={() => setCurrentPage(i + 1)}
              style={{
                ...styles.pageButton,
                backgroundColor:
                  currentPage === i + 1 ? "#00bfa5" : "transparent",
                color: currentPage === i + 1 ? "#0d0d0d" : "#e0fdfb",
              }}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    width: "100%",
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "4rem 2rem",
    backgroundColor: "#121212",
    color: "#e0fdfb",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "2rem",
    flexWrap: "wrap",
    gap: "1rem",
  },
  heading: {
    fontSize: "2.5rem",
    color: "#00e6c2",
  },
  logoutButton: {
    backgroundColor: "#00bfa5",
    color: "#0d0d0d",
    padding: "8px 16px",
    borderRadius: "6px",
    border: "none",
    cursor: "pointer",
    fontWeight: "bold",
    marginRight: "1rem",
  },
  createButton: {
    backgroundColor: "#00bfa5",
    color: "#0d0d0d",
    padding: "8px 16px",
    borderRadius: "6px",
    border: "none",
    cursor: "pointer",
    fontWeight: "bold",
  },
  gridContainer: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
    gap: "1.5rem",
    marginTop: "2rem",
  },
  cardWrapper: {
    width: "100%",
  },
  pagination: {
    display: "flex",
    justifyContent: "center",
    gap: "10px",
    marginTop: "2rem",
  },
  pageButton: {
    padding: "8px 16px",
    borderRadius: "6px",
    border: "1px solid #00bfa5",
    cursor: "pointer",
    fontWeight: "bold",
    background: "transparent",
    transition: "all 0.2s ease",
  },
};

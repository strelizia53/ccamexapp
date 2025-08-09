"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams } from "next/navigation";
import { auth, db } from "@/firebase/config";
import {
  doc,
  getDoc,
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

export default function ProgramDetails() {
  const { id } = useParams();

  const [program, setProgram] = useState(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [feedbackList, setFeedbackList] = useState([]);
  const [comment, setComment] = useState("");
  const [rating, setRating] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  // fetch program
  useEffect(() => {
    const fetchProgram = async () => {
      try {
        const docRef = doc(db, "trainings", id);
        const snap = await getDoc(docRef);
        if (snap.exists()) setProgram(snap.data());
      } catch (err) {
        console.error("Error fetching program:", err);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchProgram();
  }, [id]);

  // auth & user profile
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser || null);
      if (firebaseUser) {
        try {
          const uref = doc(db, "users", firebaseUser.uid);
          const usnap = await getDoc(uref);
          if (usnap.exists()) setUserProfile(usnap.data());
        } catch (err) {
          console.error("Error fetching user profile:", err);
        }
      } else {
        setUserProfile(null);
      }
    });
    return () => unsub();
  }, []);

  // live feedback listener (newest first)
  useEffect(() => {
    if (!id) return;
    const qRef = query(
      collection(db, "trainings", id, "feedback"),
      orderBy("submittedAt", "desc")
    );
    const unsub = onSnapshot(qRef, (snap) => {
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setFeedbackList(list);
    });
    return () => unsub();
  }, [id]);

  const stars = useMemo(() => [1, 2, 3, 4, 5], []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user || !userProfile) {
      alert("Please log in to leave feedback.");
      return;
    }
    if (!rating || comment.trim().length === 0) {
      alert("Please add a rating and a comment.");
      return;
    }
    try {
      setSubmitting(true);
      await addDoc(collection(db, "trainings", id, "feedback"), {
        userId: user.uid,
        username: userProfile.username || user.email,
        userType: userProfile.userType || "trainee",
        comment: comment.trim(),
        rating,
        submittedAt: serverTimestamp(),
      });
      setComment("");
      setRating(0);
    } catch (err) {
      console.error("Failed to submit feedback:", err);
      alert("Failed to submit feedback. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p style={styles.loadingText}>Loading program details...</p>
      </div>
    );
  }

  if (!program) {
    return (
      <div style={styles.errorContainer}>
        <h2 style={styles.errorTitle}>Program Not Found</h2>
        <p style={styles.errorText}>
          The requested training program could not be found.
        </p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>{program.trainingArea}</h1>
        <div style={styles.headerMeta}>
          <span style={styles.metaBadge}>{program.trainerName}</span>
          <span style={styles.metaBadge}>
            {new Date(program.schedule).toLocaleDateString()}
          </span>
        </div>
      </div>

      <div style={styles.contentGrid}>
        <div style={styles.detailsCard}>
          <h2 style={styles.cardTitle}>Program Details</h2>
          <div style={styles.detailsGrid}>
            <div style={styles.detailItem}>
              <h3 style={styles.detailLabel}>Trainer</h3>
              <p style={styles.detailValue}>{program.trainerName}</p>
            </div>
            <div style={styles.detailItem}>
              <h3 style={styles.detailLabel}>Schedule</h3>
              <p style={styles.detailValue}>
                {new Date(program.schedule).toLocaleString()}
              </p>
            </div>
            <div style={styles.detailItem}>
              <h3 style={styles.detailLabel}>Venue</h3>
              <p style={styles.detailValue}>{program.venue}</p>
            </div>
            <div style={styles.detailItem}>
              <h3 style={styles.detailLabel}>Prerequisites</h3>
              <p style={styles.detailValue}>
                {program.prerequisites || "None specified"}
              </p>
            </div>
          </div>
        </div>

        {/* Feedback form */}
        <div style={styles.feedbackSection}>
          <div style={styles.feedbackFormCard}>
            <h2 style={styles.cardTitle}>Leave Feedback</h2>
            {!user ? (
              <div style={styles.authPrompt}>
                <p style={styles.authText}>Please log in to submit feedback.</p>
                <button style={styles.authButton}>Sign In</button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={styles.form}>
                <div style={styles.ratingContainer}>
                  <label style={styles.ratingLabel}>Your Rating:</label>
                  <div style={styles.starsContainer}>
                    {stars.map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setRating(s)}
                        style={{
                          ...styles.starButton,
                          ...(s <= rating ? styles.starActive : {}),
                        }}
                        aria-label={`${s} star${s > 1 ? "s" : ""}`}
                      >
                        {s <= rating ? "★" : "☆"}
                      </button>
                    ))}
                  </div>
                </div>

                <div style={styles.commentContainer}>
                  <label style={styles.commentLabel}>Your Feedback:</label>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    rows={4}
                    placeholder="Share your thoughts about this session..."
                    style={styles.textarea}
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  style={styles.submitButton}
                >
                  {submitting ? (
                    <>
                      <span style={styles.spinnerSmall}></span>
                      Submitting...
                    </>
                  ) : (
                    "Submit Feedback"
                  )}
                </button>
              </form>
            )}
          </div>

          {/* Feedback list */}
          <div style={styles.feedbackListContainer}>
            <h2 style={styles.cardTitle}>
              Participant Feedback ({feedbackList.length})
            </h2>
            {feedbackList.length === 0 ? (
              <div style={styles.emptyFeedback}>
                <p style={styles.emptyText}>
                  No feedback yet. Be the first to share your experience!
                </p>
              </div>
            ) : (
              <div style={styles.feedbackList}>
                {feedbackList.map((f) => {
                  const isTrainer =
                    (f.userType || "").toLowerCase() === "trainer";
                  return (
                    <div
                      key={f.id}
                      style={{
                        ...styles.feedbackCard,
                        ...(isTrainer ? styles.trainerCard : {}),
                      }}
                    >
                      <div style={styles.feedbackHeader}>
                        <div style={styles.userInfo}>
                          <span style={styles.userAvatar}>
                            {isTrainer ? "👨‍🏫" : "👤"}
                          </span>
                          <span style={styles.username}>
                            {f.username || "Anonymous"}
                          </span>
                          {isTrainer && (
                            <span style={styles.trainerBadge}>Trainer</span>
                          )}
                        </div>
                        <div style={styles.ratingDisplay}>
                          {Array.from({ length: 5 }).map((_, i) => (
                            <span
                              key={i}
                              style={{
                                ...styles.ratingStar,
                                color:
                                  i < (f.rating || 0) ? "#00e6c2" : "#4a5568",
                              }}
                            >
                              {i < (f.rating || 0) ? "★" : "☆"}
                            </span>
                          ))}
                        </div>
                      </div>
                      <p style={styles.feedbackText}>{f.comment}</p>
                      <div style={styles.feedbackFooter}>
                        <span style={styles.timestamp}>
                          {f.submittedAt?.toDate
                            ? f.submittedAt.toDate().toLocaleString()
                            : "Just now"}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  loadingContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "100vh",
    backgroundColor: "#121212",
  },
  spinner: {
    border: "4px solid rgba(255, 255, 255, 0.1)",
    borderLeftColor: "#00e6c2",
    borderRadius: "50%",
    width: "40px",
    height: "40px",
    animation: "spin 1s linear infinite",
    marginBottom: "1rem",
  },
  loadingText: {
    color: "#e0fdfb",
    fontSize: "1.1rem",
  },
  errorContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "100vh",
    backgroundColor: "#121212",
    padding: "2rem",
    textAlign: "center",
  },
  errorTitle: {
    color: "#ff6b6b",
    fontSize: "2rem",
    marginBottom: "1rem",
  },
  errorText: {
    color: "#e0fdfb",
    fontSize: "1.1rem",
    maxWidth: "500px",
  },
  container: {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "2rem 1rem",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    backgroundColor: "#121212",
    minHeight: "100vh",
    color: "#e0fdfb",
  },
  header: {
    marginBottom: "2rem",
    paddingBottom: "1rem",
    borderBottom: "1px solid #1f1f1f",
  },
  title: {
    fontSize: "2.5rem",
    fontWeight: "600",
    color: "#00e6c2",
    marginBottom: "0.5rem",
  },
  headerMeta: {
    display: "flex",
    gap: "0.5rem",
    flexWrap: "wrap",
  },
  metaBadge: {
    backgroundColor: "#1a1a1a",
    color: "#00e6c2",
    padding: "0.3rem 0.8rem",
    borderRadius: "20px",
    fontSize: "0.9rem",
    fontWeight: "500",
    border: "1px solid #00bfa5",
  },
  contentGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 2fr",
    gap: "2rem",
    "@media (max-width: 768px)": {
      gridTemplateColumns: "1fr",
    },
  },
  detailsCard: {
    backgroundColor: "#1a1a1a",
    borderRadius: "8px",
    border: "1px solid #00bfa5",
    padding: "1.5rem",
    height: "fit-content",
  },
  cardTitle: {
    fontSize: "1.5rem",
    fontWeight: "600",
    color: "#00e6c2",
    marginBottom: "1.5rem",
    paddingBottom: "0.5rem",
    borderBottom: "1px solid #1f1f1f",
  },
  detailsGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "1.5rem",
    "@media (max-width: 480px)": {
      gridTemplateColumns: "1fr",
    },
  },
  detailItem: {
    marginBottom: "0.5rem",
  },
  detailLabel: {
    fontSize: "0.85rem",
    color: "#9ad7cf",
    fontWeight: "600",
    marginBottom: "0.25rem",
    textTransform: "uppercase",
  },
  detailValue: {
    fontSize: "1rem",
    color: "#e0fdfb",
    fontWeight: "500",
  },
  feedbackSection: {
    display: "flex",
    flexDirection: "column",
    gap: "2rem",
  },
  feedbackFormCard: {
    backgroundColor: "#1a1a1a",
    borderRadius: "8px",
    border: "1px solid #00bfa5",
    padding: "1.5rem",
  },
  authPrompt: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "1.5rem",
    backgroundColor: "#1f1f1f",
    borderRadius: "8px",
    textAlign: "center",
  },
  authText: {
    color: "#e0fdfb",
    marginBottom: "1rem",
    fontSize: "1rem",
  },
  authButton: {
    backgroundColor: "#00bfa5",
    color: "#121212",
    border: "none",
    padding: "0.6rem 1.2rem",
    borderRadius: "6px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "background-color 0.2s",
    ":hover": {
      backgroundColor: "#00e6c2",
    },
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "1.5rem",
  },
  ratingContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "0.5rem",
  },
  ratingLabel: {
    fontSize: "0.95rem",
    fontWeight: "600",
    color: "#00e6c2",
  },
  starsContainer: {
    display: "flex",
    gap: "0.5rem",
  },
  starButton: {
    backgroundColor: "transparent",
    border: "1px solid #00bfa5",
    borderRadius: "6px",
    width: "40px",
    height: "40px",
    fontSize: "1.2rem",
    cursor: "pointer",
    color: "#00bfa5",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.2s",
    ":hover": {
      borderColor: "#00e6c2",
      color: "#00e6c2",
    },
  },
  starActive: {
    backgroundColor: "#00bfa5",
    borderColor: "#00bfa5",
    color: "#121212",
  },
  commentContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "0.5rem",
  },
  commentLabel: {
    fontSize: "0.95rem",
    fontWeight: "600",
    color: "#00e6c2",
  },
  textarea: {
    padding: "0.8rem",
    borderRadius: "6px",
    border: "1px solid #00bfa5",
    backgroundColor: "#1f1f1f",
    color: "#e0fdfb",
    fontSize: "1rem",
    resize: "vertical",
    minHeight: "120px",
    transition: "border-color 0.2s",
    ":focus": {
      outline: "none",
      borderColor: "#00e6c2",
      boxShadow: "0 0 0 2px rgba(0, 230, 194, 0.2)",
    },
  },
  submitButton: {
    backgroundColor: "#00bfa5",
    color: "#121212",
    border: "none",
    padding: "0.8rem 1.5rem",
    borderRadius: "6px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "background-color 0.2s",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "0.5rem",
    alignSelf: "flex-start",
    ":hover": {
      backgroundColor: "#00e6c2",
    },
    ":disabled": {
      backgroundColor: "#4a5568",
      cursor: "not-allowed",
    },
  },
  spinnerSmall: {
    border: "2px solid rgba(0, 0, 0, 0.3)",
    borderTopColor: "#121212",
    borderRadius: "50%",
    width: "16px",
    height: "16px",
    animation: "spin 1s linear infinite",
  },
  feedbackListContainer: {
    backgroundColor: "#1a1a1a",
    borderRadius: "8px",
    border: "1px solid #00bfa5",
    padding: "1.5rem",
  },
  emptyFeedback: {
    padding: "2rem",
    textAlign: "center",
    backgroundColor: "#1f1f1f",
    borderRadius: "8px",
  },
  emptyText: {
    color: "#9ad7cf",
    fontSize: "1rem",
  },
  feedbackList: {
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
  },
  feedbackCard: {
    backgroundColor: "#1f1f1f",
    border: "1px solid #00bfa5",
    borderRadius: "8px",
    padding: "1.25rem",
    transition: "box-shadow 0.2s",
    ":hover": {
      boxShadow: "0 0 10px rgba(0, 230, 194, 0.1)",
    },
  },
  trainerCard: {
    borderLeft: "4px solid #FFD700",
    backgroundColor: "#1a1a1a",
  },
  feedbackHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "0.75rem",
  },
  userInfo: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
  },
  userAvatar: {
    fontSize: "1.2rem",
  },
  username: {
    fontWeight: "600",
    color: "#e0fdfb",
  },
  trainerBadge: {
    backgroundColor: "#FFD700",
    color: "#5a4a00",
    fontSize: "0.7rem",
    fontWeight: "600",
    padding: "0.2rem 0.5rem",
    borderRadius: "10px",
    marginLeft: "0.5rem",
  },
  ratingDisplay: {
    display: "flex",
    gap: "0.2rem",
  },
  ratingStar: {
    fontSize: "1rem",
  },
  feedbackText: {
    color: "#e0fdfb",
    lineHeight: "1.6",
    marginBottom: "0.75rem",
  },
  feedbackFooter: {
    display: "flex",
    justifyContent: "flex-end",
  },
  timestamp: {
    fontSize: "0.8rem",
    color: "#9ad7cf",
  },
};

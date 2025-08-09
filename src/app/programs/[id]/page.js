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

  // auth + user profile (username, userType)
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);

  // feedback state
  const [feedbackList, setFeedbackList] = useState([]);
  const [comment, setComment] = useState("");
  const [rating, setRating] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  // fetch program
  useEffect(() => {
    const fetchProgram = async () => {
      const docRef = doc(db, "trainings", id);
      const snap = await getDoc(docRef);
      if (snap.exists()) setProgram(snap.data());
    };
    if (id) fetchProgram();
  }, [id]);

  // auth & user profile
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser || null);
      if (firebaseUser) {
        const uref = doc(db, "users", firebaseUser.uid);
        const usnap = await getDoc(uref);
        if (usnap.exists()) setUserProfile(usnap.data());
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

  if (!program) return <p style={styles.loading}>Loading...</p>;

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>{program.trainingArea}</h1>

      <div style={styles.meta}>
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
        <p>
          <strong>Prerequisites:</strong>{" "}
          {program.prerequisites || "No prerequisites provided."}
        </p>
      </div>

      {/* Feedback form */}
      <section style={styles.section}>
        <h2 style={styles.sectionTitle}>Leave Feedback</h2>
        {!user ? (
          <p style={styles.note}>Please log in to submit feedback.</p>
        ) : (
          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.ratingRow}>
              <span style={styles.label}>Rating:</span>
              <div style={styles.stars}>
                {stars.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setRating(s)}
                    style={{
                      ...styles.starBtn,
                      ...(s <= rating ? styles.starActive : {}),
                    }}
                    aria-label={`${s} star${s > 1 ? "s" : ""}`}
                  >
                    {s <= rating ? "★" : "☆"}
                  </button>
                ))}
              </div>
            </div>

            <label style={styles.label}>
              Comment:
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={4}
                placeholder="Share your thoughts about this session..."
                style={styles.textarea}
              />
            </label>

            <button
              type="submit"
              disabled={submitting}
              className="button"
              style={styles.submitBtn}
            >
              {submitting ? "Submitting..." : "Submit Feedback"}
            </button>
          </form>
        )}
      </section>

      {/* Feedback list */}
      <section style={styles.section}>
        <h2 style={styles.sectionTitle}>Feedback</h2>
        {feedbackList.length === 0 ? (
          <p style={styles.note}>No feedback yet. Be the first to comment!</p>
        ) : (
          <div style={styles.feedbackList}>
            {feedbackList.map((f) => {
              const isTrainer = (f.userType || "").toLowerCase() === "trainer";
              return (
                <div
                  key={f.id}
                  style={{
                    ...styles.feedbackCard,
                    ...(isTrainer ? styles.trainerCard : {}),
                  }}
                >
                  <div style={styles.feedbackHeader}>
                    <span style={styles.feedbackUser}>
                      {isTrainer ? "👨‍🏫" : "👤"} {f.username || "User"}
                    </span>
                    <span style={styles.feedbackStars}>
                      {"★".repeat(f.rating || 0)}
                      {"☆".repeat(Math.max(0, 5 - (f.rating || 0)))}
                    </span>
                  </div>
                  <p style={styles.feedbackComment}>{f.comment}</p>
                  <span style={styles.feedbackTime}>
                    {f.submittedAt?.toDate
                      ? f.submittedAt.toDate().toLocaleString()
                      : "Just now"}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

const styles = {
  loading: { padding: "2rem", color: "#e0fdfb" },
  container: {
    padding: "2rem",
    color: "#e0fdfb",
    backgroundColor: "#121212",
    minHeight: "100vh",
    maxWidth: 900,
    margin: "0 auto",
  },
  title: { fontSize: "2rem", color: "#00e6c2", marginBottom: "1rem" },
  meta: {
    background: "#171717",
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: "#1f1f1f",
    borderRadius: 12,
    padding: "1rem 1.25rem",
    marginBottom: "2rem",
  },
  section: { marginTop: "2rem" },
  sectionTitle: {
    fontSize: "1.3rem",
    marginBottom: "0.75rem",
    color: "#00e6c2",
  },
  note: { color: "#9ad7cf" },

  form: {
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
    background: "#151515",
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: "#1f1f1f",
    borderRadius: 12,
    padding: "1rem",
  },
  ratingRow: { display: "flex", alignItems: "center", gap: "0.75rem" },
  label: { fontWeight: "bold", color: "#00e6c2" },
  stars: { display: "flex", gap: "0.25rem" },
  starBtn: {
    background: "transparent",
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: "#00bfa5",
    borderRadius: 6,
    width: 36,
    height: 36,
    fontSize: 18,
    cursor: "pointer",
    color: "#e0fdfb",
  },
  starActive: {
    background: "#00bfa5",
    color: "#0d0d0d",
    borderColor: "#00bfa5",
  },
  textarea: {
    marginTop: "0.5rem",
    padding: "0.7rem",
    borderRadius: 8,
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: "#00bfa5",
    backgroundColor: "#0d0d0d",
    color: "#e0fdfb",
    fontSize: "1rem",
  },
  submitBtn: { alignSelf: "flex-start" },

  feedbackList: {
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
  },
  feedbackCard: {
    background: "#1a1a1a",
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: "#00bfa5",
    borderRadius: 10,
    padding: "0.9rem 1rem",
  },
  trainerCard: {
    borderColor: "#ffd166", // only override color; no shorthand
    boxShadow:
      "0 0 0 1px rgba(255,209,102,0.25) inset, 0 0 20px rgba(255,209,102,0.08)",
    background:
      "linear-gradient(180deg, rgba(255,209,102,0.08), rgba(0,0,0,0))",
  },
  feedbackHeader: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "0.4rem",
  },
  feedbackUser: { fontWeight: "bold", color: "#00e6c2" },
  feedbackStars: { letterSpacing: 1 },
  feedbackComment: { margin: "0.4rem 0" },
  feedbackTime: { fontSize: "0.85rem", color: "#9ad7cf" },
};

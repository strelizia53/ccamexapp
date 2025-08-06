import Link from "next/link";

export default function Home() {
  return (
    <div style={styles.container}>
      <h1 style={styles.heading}>Welcome to AMEX</h1>
      <p style={styles.description}>
        This is your placeholder homepage. Start building your application here.
      </p>
      <div style={styles.links}>
        <Link href="/login" style={styles.link}>
          Login
        </Link>
        <Link href="/register" style={styles.link}>
          Register
        </Link>
      </div>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: "600px",
    margin: "80px auto",
    padding: "2rem",
    textAlign: "center",
    backgroundColor: "#121212",
    borderRadius: "12px",
    boxShadow: "0 0 30px rgba(0, 191, 165, 0.1)",
    border: "1px solid #1f1f1f",
  },
  heading: {
    fontSize: "2.5rem",
    marginBottom: "1rem",
    color: "#00e6c2",
  },
  description: {
    fontSize: "1.2rem",
    marginBottom: "2rem",
    color: "#e0fdfb",
  },
  links: {
    display: "flex",
    justifyContent: "center",
    gap: "20px",
  },
  link: {
    padding: "10px 20px",
    background: "#00bfa5",
    color: "#0d0d0d",
    borderRadius: "6px",
    textDecoration: "none",
    fontWeight: "bold",
    transition: "background 0.2s ease",
  },
};

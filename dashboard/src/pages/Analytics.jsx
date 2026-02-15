import MainLayout from "../layout/MainLayout";

export default function Analytics() {
  return (
    <MainLayout>
      <div style={styles.container}>
        <div style={styles.card}>
          <h2 style={styles.title}>📊 Advanced Analytics</h2>
          <p style={styles.text}>
            We're building powerful price trend insights, brand analytics,
            historical comparisons and AI-based predictions.
          </p>
          <p style={styles.subtext}>
            🚀 This feature will be available very soon.
          </p>
        </div>
      </div>
    </MainLayout>
  );
}

const styles = {
  container: {
    padding: "40px",
    display: "flex",
    justifyContent: "center",
  },
  card: {
    background: "rgba(30,41,59,0.6)",
    border: "1px solid #334155",
    padding: "50px",
    borderRadius: "16px",
    maxWidth: "700px",
    textAlign: "center",
    backdropFilter: "blur(10px)",
  },
  title: {
    color: "#fff",
    fontSize: "22px",
    marginBottom: "20px",
  },
  text: {
    color: "#CBD5E1",
    fontSize: "15px",
    marginBottom: "15px",
  },
  subtext: {
    color: "#38BDF8",
    fontSize: "14px",
  },
};

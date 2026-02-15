import MainLayout from "../layout/MainLayout";

export default function Settings() {
  return (
    <MainLayout>
      <div style={styles.container}>
        <div style={styles.card}>
          <h2 style={styles.title}>⚙ Account & System Settings</h2>
          <p style={styles.text}>
            Soon you will be able to manage:
          </p>

          <ul style={styles.list}>
            <li>✔ Alert thresholds</li>
            <li>✔ Email notifications</li>
            <li>✔ Scraper frequency</li>
            <li>✔ Role-based access</li>
          </ul>

          <p style={styles.subtext}>
            🚧 Settings panel coming soon.
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
    marginBottom: "10px",
  },
  list: {
    listStyle: "none",
    padding: 0,
    color: "#94A3B8",
    marginBottom: "20px",
  },
  subtext: {
    color: "#38BDF8",
    fontSize: "14px",
  },
};

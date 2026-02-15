import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

export default function MainLayout({ children }) {
  return (
    <div style={styles.wrapper}>
      <Sidebar />
      <div style={styles.contentArea}>
        <Navbar />
        <div style={styles.pageContent}>{children}</div>
      </div>
    </div>
  );
}

const styles = {
  wrapper: {
    display: "flex",
    minHeight: "100vh",
    //width: "100%",
    background: "linear-gradient(135deg, #0f172a, #0b1220)",
	overflowX: "hidden",
  },
  contentArea: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
  },
  pageContent: {
    flex: 1,
    padding: 30,
   // width: "100%",
  },
};

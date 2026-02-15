import MainLayout from "../layout/MainLayout";
import AlertsSection from "../components/AlertsSection";

export default function Alerts() {
  return (
    <MainLayout>
      <div style={{ padding: "30px" }}>
        <h2 style={{ marginBottom: "20px" }}>Alerts Center</h2>
        <AlertsSection />
      </div>
    </MainLayout>
  );
}

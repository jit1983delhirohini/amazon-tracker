import { theme } from "../theme";

export default function KpiCard({ title, value, color }) {
  return (
    <div style={{ ...styles.card, borderLeft: `4px solid ${color}` }}>
      <div style={styles.title}>{title}</div>
      <div style={styles.value}>{value}</div>
    </div>
  );
}

const styles = {
  card: {
    background: theme.colors.card,
    padding: 20,
    borderRadius: 14,
    flex: 1,
  },
  title: {
    color: theme.colors.textSecondary,
    fontSize: 13,
  },
  value: {
    color: "#fff",
    fontSize: 24,
    fontWeight: 600,
    marginTop: 8,
  },
};

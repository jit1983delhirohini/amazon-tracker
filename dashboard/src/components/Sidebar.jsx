import { theme } from "../theme";
import { LayoutDashboard, BarChart3, Settings, Bell } from "lucide-react";
import { NavLink } from "react-router-dom";


export default function Sidebar() {
  return (
    <div style={styles.sidebar}>
      <div style={styles.logo}>TWBP Analytics</div>

      <div style={styles.menu}>
<MenuItem icon={<LayoutDashboard size={18} />} label="Dashboard" to="/" />
<MenuItem icon={<Bell size={18} />} label="Alerts" to="/alerts" />
<MenuItem icon={<BarChart3 size={18} />} label="Analytics" to="/analytics" />
<MenuItem icon={<Settings size={18} />} label="Settings" to="/settings" />

      </div>
    </div>
  );
}

function MenuItem({ icon, label, to }) {
  return (
    <NavLink
      to={to}
      style={({ isActive }) => ({
        ...styles.menuItem,
        background: isActive ? "#1E293B" : "transparent",
        textDecoration: "none",
        color: "white",
      })}
    >
      {icon}
      <span>{label}</span>
    </NavLink>
  );
}


const styles = {
  sidebar: {
    width: 240,
    minHeight: "100vh",
    background: "#0B1624",
    borderRight: "1px solid #1e293b",
  },
  logo: {
    color: "#fff",
    fontWeight: 600,
    fontSize: 18,
    marginBottom: 30,
  },
  menu: {
    display: "flex",
    flexDirection: "column",
    gap: 10,
  },
  menuItem: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "10px 12px",
    borderRadius: 10,
    cursor: "pointer",
    color: "#CBD5E1",
    fontSize: 14,
  },
};

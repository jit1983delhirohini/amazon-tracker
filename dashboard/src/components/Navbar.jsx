import { theme } from "../theme";
import { LogOut } from "lucide-react";
import { supabase } from "../supabase";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user } = useAuth();

  const logout = async () => {
    await supabase.auth.signOut();
    window.location.reload();
  };

  return (
    <div style={styles.navbar}>
      <div>
        <div style={styles.title}>Amazon Price Intelligence</div>
        <div style={styles.subtitle}>
          Welcome, {user?.user_metadata?.full_name || "User"}
        </div>
      </div>

      <button style={styles.logout} onClick={logout}>
        <LogOut size={16} />
        Logout
      </button>
    </div>
  );
}

const styles = {
  navbar: {
    height: 70,
    background: theme.colors.card,
    borderBottom: `1px solid ${theme.colors.border}`,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "0 30px",
  },
  title: {
    color: "#fff",
    fontSize: 18,
    fontWeight: 600,
  },
  subtitle: {
    color: theme.colors.textSecondary,
    fontSize: 13,
  },
  logout: {
    background: "transparent",
    border: "1px solid #334155",
    color: "#CBD5E1",
    padding: "6px 12px",
    borderRadius: 8,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: 6,
  },
};

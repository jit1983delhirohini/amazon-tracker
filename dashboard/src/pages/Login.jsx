import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabase";
import { motion } from "framer-motion";
import logo from "../assets/twbp-logo.png";
import { Eye, EyeOff } from "lucide-react";

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      alert(error.message);
      setLoading(false);
      return;
    }

    setSuccess(true);

    setTimeout(() => {
      navigate("/");
    }, 1200);
  };

  return (
    <div style={styles.wrapper}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        style={styles.card}
      >
        <motion.img
          src={logo}
          alt="TWBP"
          style={styles.logo}
          animate={{ rotate: [0, 2, -2, 0] }}
          transition={{ repeat: Infinity, duration: 3 }}
        />

        <p style={styles.tagline}>Building Bonds, Beyond Business</p>

        <h2 style={styles.title}>Amazon Price Portal</h2>
        <p style={styles.subtitle}>
          Secure access to price intelligence
        </p>

        <form onSubmit={handleLogin} style={{ width: "100%" }}>
          <input
            type="email"
            placeholder="Email address"
            style={styles.input}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <div style={styles.passwordWrapper}>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              style={styles.input}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <div
              style={styles.eyeIcon}
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </div>
          </div>

          <button style={styles.button} disabled={loading}>
            {loading
              ? "Logging in..."
              : success
              ? "Success ✓"
              : "Login"}
          </button>
        </form>
      </motion.div>
    </div>
  );
}

const styles = {
  wrapper: {
    width: "100vw",
    height: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "linear-gradient(135deg, #0f172a, #020617)",
    margin: 0,
  },
  card: {
    width: 400,
    padding: 45,
    borderRadius: 20,
    background: "rgba(15, 23, 42, 0.95)",
    backdropFilter: "blur(20px)",
    boxShadow: "0 20px 60px rgba(0,0,0,0.6)",
    textAlign: "center",
  },
  logo: {
    width: 110,
    marginBottom: 10,
  },
  tagline: {
    color: "#ffffff",
    fontSize: 13,
    marginBottom: 25,
  },
  title: {
    color: "#ffffff",
    marginBottom: 5,
  },
  subtitle: {
    color: "#94a3b8",
    fontSize: 14,
    marginBottom: 25,
  },
  input: {
    width: "100%",
    padding: 14,
    marginBottom: 18,
    borderRadius: 12,
    border: "1px solid #334155",
    background: "#0f172a",
    color: "#ffffff",
    outline: "none",
  },
  passwordWrapper: {
    position: "relative",
  },
  eyeIcon: {
    position: "absolute",
    right: 15,
    top: 14,
    cursor: "pointer",
    color: "#94a3b8",
  },
  button: {
    width: "100%",
    padding: 14,
    borderRadius: 14,
    border: "none",
    background: "linear-gradient(90deg,#7F5AF0,#2CB67D)",
    color: "#ffffff",
    fontWeight: "bold",
    cursor: "pointer",
    fontSize: 15,
  },
};

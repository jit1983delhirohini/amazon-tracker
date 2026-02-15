import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Alerts from "./pages/Alerts";
import Analytics from "./pages/Analytics";
import Settings from "./pages/Settings";


function App() {
  const { session, loading } = useAuth();

  if (loading) return <div>Loading...</div>;

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            session ? <Dashboard /> : <Navigate to="/login" />
          }
        />

        <Route
          path="/alerts"
          element={
            session ? <Alerts /> : <Navigate to="/login" />
          }
        />

<Route
  path="/analytics"
  element={
    session ? <Analytics /> : <Navigate to="/login" />
  }
/>

<Route
  path="/settings"
  element={
    session ? <Settings /> : <Navigate to="/login" />
  }
/>

        <Route
          path="/login"
          element={!session ? <Login /> : <Navigate to="/" />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

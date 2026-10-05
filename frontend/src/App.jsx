import { useState, useEffect } from "react";

import Sidebar from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";
import Repairs from "./pages/Repairs";
import Login from "./pages/Login";
import Tracking from "./pages/Tracking";

import "./App.css";

import {
  getRepairs,
  createRepair,
  updateRepair,
  deleteRepair,
  checkStaffSession,
  logoutStaff,
} from "./services/api";

function App() {
  const isTrackingPage =
    window.location.pathname.replace(/\/$/, "") === "/track";

  const [activePage, setActivePage] = useState("dashboard");

  const [repairs, setRepairs] = useState([]);
  const [editingRepair, setEditingRepair] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [loadError, setLoadError] = useState("");

  const [staff, setStaff] = useState(null);
  const [checkingSession, setCheckingSession] = useState(!isTrackingPage);
  const [authError, setAuthError] = useState("");
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    if (isTrackingPage) {
      return;
    }

    function handleSessionExpired() {
      setStaff(null);
      setRepairs([]);
      setEditingRepair(null);

      setLoading(false);
      setError("");
      setLoadError("");
      setActivePage("dashboard");

      setAuthError("Your session has expired. Please sign in again.");
    }

    window.addEventListener("fixtrack:session-expired", handleSessionExpired);

    return () => {
      window.removeEventListener(
        "fixtrack:session-expired",
        handleSessionExpired,
      );
    };
  }, [isTrackingPage]);

  useEffect(() => {
    if (isTrackingPage) {
      return;
    }

    let active = true;

    async function verifySession() {
      try {
        const account = await checkStaffSession();

        if (active) {
          setStaff(account);
        }
      } catch (err) {
        if (active) {
          setAuthError(err.message);
        }
      } finally {
        if (active) {
          setCheckingSession(false);
        }
      }
    }

    verifySession();

    return () => {
      active = false;
    };
  }, [isTrackingPage]);

  useEffect(() => {
    if (!staff) {
      return;
    }

    let active = true;

    async function loadRepairs() {
      setLoading(true);
      setLoadError("");

      try {
        const records = await getRepairs();

        if (active) {
          setRepairs(records);
        }
      } catch (err) {
        if (active) {
          setLoadError(err.message);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadRepairs();

    return () => {
      active = false;
    };
  }, [staff]);

  function handleLogin(account) {
    setAuthError("");
    setError("");
    setLoadError("");
    setActivePage("dashboard");
    setStaff(account);
  }

  async function handleLogout() {
    if (loggingOut) {
      return;
    }

    setLoggingOut(true);
    setAuthError("");

    try {
      await logoutStaff();

      setStaff(null);
      setRepairs([]);
      setEditingRepair(null);
      setError("");
      setLoadError("");
      setActivePage("dashboard");
    } catch (err) {
      setAuthError(err.message);
    } finally {
      setLoggingOut(false);
    }
  }

  async function handleAddRepair(formData) {
    try {
      setError("");

      const newRepair = await createRepair(formData);

      setRepairs((previous) => [newRepair, ...previous]);

      return true;
    } catch (err) {
      setError(err.message);
      return false;
    }
  }

  function handleEditRepair(repair) {
    setEditingRepair(repair);
    setActivePage("repairs");

    requestAnimationFrame(() => {
      document.getElementById("repair-form")?.scrollIntoView({
        behavior: "smooth",
      });
    });
  }

  async function handleUpdateRepair(id, updatedData) {
    try {
      setError("");

      const savedRepair = await updateRepair(id, updatedData);

      setRepairs((previous) =>
        previous.map((repair) => (repair.id === id ? savedRepair : repair)),
      );

      setEditingRepair(null);

      return true;
    } catch (err) {
      setError(err.message);
      return false;
    }
  }

  async function handleDeleteRepair(id) {
    try {
      setError("");

      await deleteRepair(id);

      setRepairs((previous) => previous.filter((repair) => repair.id !== id));

      if (editingRepair?.id === id) {
        setEditingRepair(null);
      }
    } catch (err) {
      setError(err.message);
    }
  }

  if (isTrackingPage) {
    return <Tracking />;
  }

  if (checkingSession) {
    return <main className="portal-message">Checking staff session...</main>;
  }

  if (!staff) {
    return (
      <>
        {authError && (
          <p role="alert" className="form-error">
            {authError}
          </p>
        )}

        <Login onLogin={handleLogin} />
      </>
    );
  }

  return (
    <div
      className={
        activePage === "dashboard"
          ? "app-layout dashboard-layout"
          : "app-layout"
      }
    >
      <Sidebar activePage={activePage} onNavigate={setActivePage} />

      <main className="main-content">
        <div className="staff-toolbar">
          <a
            href="/track"
            target="_blank"
            rel="noopener noreferrer"
            className="staff-tracking-link"
          >
            Customer Tracking
          </a>

          <span>Welcome, {staff.username}</span>

          <button type="button" onClick={handleLogout} disabled={loggingOut}>
            {loggingOut ? "Logging out..." : "Logout"}
          </button>
        </div>

        {authError && (
          <p role="alert" className="form-error">
            {authError}
          </p>
        )}

        {loading && <p className="portal-message">Loading repair records...</p>}

        {!loading && loadError && (
          <p role="alert" className="form-error">
            {loadError}
          </p>
        )}

        {!loading && !loadError && (
          <>
            {activePage === "dashboard" && (
              <Dashboard repairs={repairs} onNavigate={setActivePage} />
            )}

            {activePage === "repairs" && (
              <Repairs
                repairs={repairs}
                editingRepair={editingRepair}
                onAddRepair={handleAddRepair}
                onUpdateRepair={handleUpdateRepair}
                onEditRepair={handleEditRepair}
                onDeleteRepair={handleDeleteRepair}
                onCancelEdit={() => setEditingRepair(null)}
                error={error}
              />
            )}
          </>
        )}
      </main>
    </div>
  );
}

export default App;

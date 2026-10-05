import "../styles/components/Sidebar.css";

function Sidebar({ activePage, onNavigate }) {
  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <img
          src="/WINCORE.svg"
          alt="Wincore Enterprises Logo"
          className="brand-logo"
        />

        <div>
          <h2>Wincore</h2>
          <p>Enterprises</p>
        </div>
      </div>

      <nav className="sidebar-nav" aria-label="Staff navigation">
        <button
          type="button"
          className={activePage === "dashboard" ? "active" : ""}
          onClick={() => onNavigate("dashboard")}
          aria-current={activePage === "dashboard" ? "page" : undefined}
        >
          Dashboard
        </button>

        <button
          type="button"
          className={activePage === "repairs" ? "active" : ""}
          onClick={() => onNavigate("repairs")}
          aria-current={activePage === "repairs" ? "page" : undefined}
        >
          Repair Management
        </button>
      </nav>

      <div className="sidebar-footer">Staff Dashboard</div>
    </aside>
  );
}

export default Sidebar;

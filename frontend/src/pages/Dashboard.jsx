import "../styles/pages/dashboard.css";

// Small built-in icons: no extra packages required.
function DashboardIcon({ type }) {
  return (
    <svg
      width="23"
      height="23"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {type === "layers" && (
        <>
          <path d="m12 2 9 5-9 5-9-5 9-5Z" />
          <path d="m3 12 9 5 9-5" />
          <path d="m3 17 9 5 9-5" />
        </>
      )}

      {type === "clock" && (
        <>
          <circle cx="12" cy="12" r="9" />
          <path d="M12 7v5l3 2" />
        </>
      )}

      {type === "wrench" && (
        <path d="M14.7 6.3a5 5 0 0 0-6.4 6.4L3 15.9a2.1 2.1 0 0 0 3 3l5.3-5.3a5 5 0 0 0 6.4-6.4l-3.1 3.1-3.5-.7-.7-3.5 3.1-3.1Z" />
      )}

      {type === "package" && (
        <>
          <path d="m3 7 9-4 9 4v10l-9 4-9-4V7Z" />
          <path d="m3 7 9 5 9-5" />
          <path d="M12 12v9" />
          <path d="m8 15 2 2 4-4" />
        </>
      )}
    </svg>
  );
}

function Dashboard({ repairs, onNavigate }) {
  // EXISTING DATABASE-DRIVEN STATISTICS
  const total = repairs.length;

  const pending = repairs.filter(
    (repair) => repair.status === "Pending",
  ).length;

  const repairing = repairs.filter(
    (repair) => repair.status === "Under Repair",
  ).length;

  const ready = repairs.filter(
    (repair) => repair.status === "Ready for Pickup",
  ).length;

  const recentRepairs = [...repairs].sort((a, b) => b.id - a.id).slice(0, 5);

  // CARD INFORMATION
  const stats = [
    {
      label: "Total Repairs",
      value: total,
      description: "All registered repairs",
      icon: "layers",
      featured: true,
    },
    {
      label: "Pending",
      value: pending,
      description: "Awaiting service",
      icon: "clock",
    },
    {
      label: "Under Repair",
      value: repairing,
      description: "Currently being serviced",
      icon: "wrench",
    },
    {
      label: "Ready for Pickup",
      value: ready,
      description: "Awaiting collection",
      icon: "package",
    },
  ];

  // TABLE STATUS STYLING
  function getStatusClass(status) {
    const classes = {
      Pending: "pending",
      "Under Repair": "repairing",
      "Ready for Pickup": "ready",
      Claimed: "claimed",
    };

    return classes[status] || "neutral";
  }

  return (
    <section className="dashboard">
      {/* DASHBOARD HEADING */}
      <div className="dashboard-heading">
        <div>
          <span className="dashboard-eyebrow">WINCORE ENTERPRISES</span>

          <h1>Operational Overview</h1>

          <p>Monitor your repair operations at a glance.</p>
        </div>

        <button
          type="button"
          className="btn-primary"
          onClick={() => onNavigate("repairs")}
        >
          Manage Repairs
          <span aria-hidden="true">↗</span>
        </button>
      </div>

      {/* STATISTICS CARDS */}
      <div className="stats-grid">
        {stats.map((stat) => (
          <article
            key={stat.label}
            className={
              stat.featured ? "stat-card stat-card--featured" : "stat-card"
            }
          >
            <div className="stat-card-top">
              <span className="stat-card-label">{stat.label}</span>

              <span className="stat-card-icon">
                <DashboardIcon type={stat.icon} />
              </span>
            </div>

            <div className="stat-card-bottom">
              <h2>{stat.value}</h2>

              <p className="stat-card-description">{stat.description}</p>
            </div>
          </article>
        ))}
      </div>

      {/* RECENT REPAIR RECORDS */}
      <div className="recent-section">
        <div className="recent-section-header">
          <div>
            <h2>Recent Repair Records</h2>
            <p>Most recently registered repairs</p>
          </div>

          <button
            type="button"
            className="recent-view-all"
            onClick={() => onNavigate("repairs")}
          >
            View All
            <span aria-hidden="true">→</span>
          </button>
        </div>

        {recentRepairs.length === 0 ? (
          <div className="dashboard-empty">
            No repair records available yet.
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="recent-table">
              <thead>
                <tr>
                  <th scope="col">Tracking Number</th>
                  <th scope="col">Gadget</th>
                  <th scope="col">Status</th>
                </tr>
              </thead>

              <tbody>
                {recentRepairs.map((repair) => (
                  <tr key={repair.id}>
                    <td className="tracking-cell">{repair.trackingNumber}</td>

                    <td>
                      <span className="gadget-name">
                        {repair.brand} {repair.model}
                      </span>
                    </td>

                    <td>
                      <span
                        className={
                          "status-badge status-badge--" +
                          getStatusClass(repair.status)
                        }
                      >
                        <span className="status-dot" aria-hidden="true" />
                        {repair.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}

export default Dashboard;

import { useState } from "react";
import { trackRepair } from "../services/api";
import "../styles/pages/tracking.css";

const progressSteps = [
  "Pending",
  "Under Repair",
  "Ready for Pickup",
  "Claimed",
];

function Tracking() {
  const [trackingNumber, setTrackingNumber] = useState("");
  const [contactNumber, setContactNumber] = useState("");

  const [result, setResult] = useState(null);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function resetSearch() {
    setSearched(false);
    setResult(null);
    setError("");
  }

  async function handleSearch(event) {
    event.preventDefault();

    const searchValue = trackingNumber.trim().toUpperCase();
    const contactValue = contactNumber.trim();

    if (!searchValue || !contactValue || loading) {
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);
    setSearched(false);

    try {
      const repair = await trackRepair(searchValue, contactValue);

      setResult(repair);
    } catch (err) {
      setError(err.message || "Unable to track repair.");
    } finally {
      setLoading(false);
      setSearched(true);
    }
  }

  const currentStep = result ? progressSteps.indexOf(result.status) : -1;

  return (
    <div className="tracking-page">
      <header className="tracking-header">
        <div className="tracking-header-inner">
          <div className="tracking-brand">
            <div className="tracking-logo-box">
              <img src="/WINCORE.svg" alt="" className="tracking-logo" />
            </div>

            <div>
              <h1>Wincore Enterprises</h1>
              <p>Gadget Repair Tracking</p>
            </div>
          </div>

          <a href="/" className="tracking-staff-link">
            Staff Login
            <span aria-hidden="true"> ↗</span>
          </a>
        </div>
      </header>

      <main className="tracking-main">
        <div className="tracking-intro">
          <span className="tracking-eyebrow">REPAIR STATUS</span>

          <h2>
            Track your <span>repair.</span>
          </h2>

          <p>
            Enter your tracking number and registered contact number to check
            your gadget's repair progress.
          </p>
        </div>

        <form className="tracking-search" onSubmit={handleSearch}>
          <label htmlFor="trackingNumber">Tracking Number</label>

          <div className="tracking-search-row">
            <input
              id="trackingNumber"
              name="trackingNumber"
              type="text"
              value={trackingNumber}
              onChange={(event) => {
                setTrackingNumber(event.target.value);
                resetSearch();
              }}
              placeholder="Example: FIX-2026-001"
              autoComplete="off"
              disabled={loading}
              required
            />
          </div>

          <label htmlFor="contactNumber">Registered Contact Number</label>

          <div className="tracking-search-row">
            <input
              id="contactNumber"
              name="contactNumber"
              type="tel"
              inputMode="numeric"
              value={contactNumber}
              onChange={(event) => {
                setContactNumber(event.target.value);
                resetSearch();
              }}
              placeholder="Example: 09123456789"
              pattern="[0-9]{11}"
              maxLength={11}
              autoComplete="tel"
              disabled={loading}
              required
            />
          </div>

          <div className="tracking-search-row">
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? "Searching..." : "Track Repair"}

              {!loading && <span aria-hidden="true">→</span>}
            </button>
          </div>

          <p className="tracking-form-note">
            Both details must match your registered repair record.
          </p>
        </form>

        {searched && error && (
          <div className="tracking-message" role="alert">
            {error}
          </div>
        )}

        {result && (
          <section
            className="tracking-result"
            aria-label="Repair tracking result"
          >
            <div className="tracking-result-header">
              <div>
                <p>TRACKING NUMBER</p>

                <h3>{result.trackingNumber}</h3>
              </div>

              <span className="tracking-status">{result.status}</span>
            </div>

            <div className="tracking-details">
              <div>
                <span>Gadget</span>

                <strong>
                  {result.brand} {result.model}
                </strong>
              </div>

              <div>
                <span>Gadget Type</span>

                <strong>{result.gadgetType}</strong>
              </div>

              <div>
                <span>Date Received</span>

                <strong>{result.dateReceived}</strong>
              </div>
            </div>

            <div className="tracking-progress-section">
              <h3>Repair Progress</h3>

              <p>Follow the current status of your gadget's repair.</p>

              <ol className="tracking-progress">
                {progressSteps.map((step, index) => {
                  const completed = index <= currentStep;

                  return (
                    <li
                      key={step}
                      className={
                        completed ? "progress-step completed" : "progress-step"
                      }
                      aria-current={index === currentStep ? "step" : undefined}
                    >
                      <span className="progress-marker">
                        {index < currentStep ? "✓" : index + 1}
                      </span>

                      <span className="progress-label">{step}</span>
                    </li>
                  );
                })}
              </ol>
            </div>
          </section>
        )}
      </main>

      <footer className="tracking-footer">
        <p>Wincore Enterprises · Gadget Repair Tracking</p>
      </footer>
    </div>
  );
}

export default Tracking;

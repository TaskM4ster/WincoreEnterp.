import { useState } from "react";

import RepairForm from "../components/RepairForm";
import RepairList from "../components/RepairList";

import "../styles/pages/repairs.css";

function Repairs({
  repairs,
  editingRepair,
  onAddRepair,
  onUpdateRepair,
  onEditRepair,
  onDeleteRepair,
  onCancelEdit,
  error,
}) {
  const [view, setView] = useState("records");
  const [searchTerm, setSearchTerm] = useState("");

  const showingForm = view === "form";

  const allRepairs = Array.isArray(repairs) ? repairs : [];
  const normalizedSearch = searchTerm.trim().toLowerCase();
  const filteredRepairs = normalizedSearch
    ? allRepairs.filter((repair) =>
        [
          repair.trackingNumber,
          repair.customerName,
          repair.contactNumber,
          repair.gadgetType,
          repair.brand,
          repair.model,
          `${repair.brand ?? ""} ${repair.model ?? ""}`,
          repair.issue,
          repair.status,
        ].some((value) =>
          String(value ?? "")
            .toLowerCase()
            .includes(normalizedSearch),
        ),
      )
    : allRepairs;

  function handleRegister() {
    onCancelEdit();
    setView("form");
  }

  function handleEdit(repair) {
    setView("form");
    onEditRepair(repair);
  }

  function handleBack() {
    onCancelEdit();
    setView("records");
  }

  async function handleAdd(formData) {
    const success = await onAddRepair(formData);

    if (success) {
      setSearchTerm("");
      setView("records");
    }

    return success;
  }

  async function handleUpdate(id, formData) {
    const success = await onUpdateRepair(id, formData);

    if (success) {
      setView("records");
    }

    return success;
  }

  return (
    <section className="repairs-page">
      <div className="page-heading">
        <div>
          <h1>Repair Management</h1>
          <p>Register, update, and manage gadget repairs.</p>
        </div>

        {!showingForm && (
          <button
            type="button"
            className="register-repair-button"
            onClick={handleRegister}
          >
            <span aria-hidden="true">+</span>
            Register Repair
          </button>
        )}

        {showingForm && (
          <button
            type="button"
            className="back-to-records-button"
            onClick={handleBack}
          >
            <span aria-hidden="true">←</span>
            Back to Records
          </button>
        )}
      </div>

      {showingForm && (
        <>
          {error && (
            <p role="alert" className="form-error">
              {error}
            </p>
          )}

          <RepairForm
            key={editingRepair ? editingRepair.id : "new"}
            editingRepair={editingRepair}
            onAddRepair={handleAdd}
            onUpdateRepair={handleUpdate}
            onCancelEdit={handleBack}
          />
        </>
      )}

      {!showingForm && (
        <>
          {error && (
            <p role="alert" className="form-error">
              {error}
            </p>
          )}

          <div className="repair-search-panel" role="search">
            <div className="repair-search-heading">
              <label htmlFor="repair-search-input">Search Repair Records</label>
              <span className="repair-search-count" aria-live="polite">
                {normalizedSearch
                  ? `${filteredRepairs.length} of ${allRepairs.length} records`
                  : `${allRepairs.length} total records`}
              </span>
            </div>

            <div className="repair-search-field">
              <svg
                className="repair-search-icon"
                viewBox="0 0 24 24"
                width="19"
                height="19"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                aria-hidden="true"
              >
                <circle cx="10.8" cy="10.8" r="6.7" />
                <path d="m16 16 4.5 4.5" />
              </svg>
              <input
                id="repair-search-input"
                className="repair-search-input"
                type="search"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Tracking #, customer, contact, gadget, or status..."
                autoComplete="off"
              />
              {searchTerm && (
                <button
                  type="button"
                  className="repair-search-clear"
                  onClick={() => setSearchTerm("")}
                  aria-label="Clear search"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {normalizedSearch && filteredRepairs.length === 0 ? (
            <div className="repair-search-empty" role="status">
              <h2>No matching repairs</h2>
              <p>Try another tracking number, customer, gadget, or status.</p>
              <button
                type="button"
                className="repair-search-reset"
                onClick={() => setSearchTerm("")}
              >
                Clear search
              </button>
            </div>
          ) : (
            <RepairList
              repairs={filteredRepairs}
              onEdit={handleEdit}
              onDelete={onDeleteRepair}
            />
          )}
        </>
      )}
    </section>
  );
}

export default Repairs;

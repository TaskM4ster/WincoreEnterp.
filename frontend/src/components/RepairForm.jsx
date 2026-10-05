import { useEffect, useState } from "react";
import "../styles/components/repair-form.css";

const initialForm = {
  customerName: "",
  contactNumber: "",
  gadgetType: "Smartphone",
  brand: "",
  model: "",
  issue: "",
  status: "Pending",
};

function RepairForm({
  onAddRepair,
  onUpdateRepair,
  editingRepair,
  onCancelEdit,
}) {
  const isEditing = Boolean(editingRepair);

  const [formData, setFormData] = useState(() =>
    editingRepair
      ? {
          customerName: editingRepair.customerName,
          contactNumber: editingRepair.contactNumber,
          gadgetType: editingRepair.gadgetType,
          brand: editingRepair.brand,
          model: editingRepair.model,
          issue: editingRepair.issue,
          status: editingRepair.status,
        }
      : { ...initialForm },
  );

  const [statusOptions, setStatusOptions] = useState([]);
  const [statusError, setStatusError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadStatuses() {
      try {
        const response = await fetch("/repair-statuses.json");
        if (!response.ok) {
          throw new Error("Failed to load repair statuses.");
        }

        const data = await response.json();
        if (!Array.isArray(data)) {
          throw new Error("Invalid repair statuses file.");
        }

        if (active) setStatusOptions(data);
      } catch (err) {
        if (active) setStatusError(err.message);
      }
    }

    loadStatuses();
    return () => {
      active = false;
    };
  }, []);

  function handleChange(event) {
    const { name, value } = event.target;
    setFormData((previous) => ({ ...previous, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (saving) return;

    setSaving(true);
    try {
      const success = isEditing
        ? await onUpdateRepair(editingRepair.id, formData)
        : await onAddRepair(formData);

      if (success) setFormData({ ...initialForm });
    } finally {
      setSaving(false);
    }
  }

  function handleCancel() {
    setFormData({ ...initialForm });
    onCancelEdit();
  }

  return (
    <section className="repair-form-container" id="repair-form">
      <div className="repair-form-heading">
        <div>
          <h2>{isEditing ? "Edit Repair" : "Register New Repair"}</h2>
          <p>
            {isEditing
              ? `Update the details for ${editingRepair.trackingNumber}.`
              : "Complete the sections below to register a gadget for repair."}
          </p>
        </div>
        <span className="repair-form-heading-badge">
          {isEditing ? "EDIT RECORD" : "NEW RECORD"}
        </span>
      </div>

      <form className="repair-form" onSubmit={handleSubmit}>
        <section
          className="repair-form-section"
          aria-labelledby="customer-section-title"
        >
          <div className="repair-form-section-heading">
            <span className="repair-section-number" aria-hidden="true">
              01
            </span>
            <div>
              <h3 id="customer-section-title">Customer Information</h3>
              <p>Contact details for the person who owns the gadget.</p>
            </div>
          </div>

          <div className="repair-form-fields">
            <div className="form-group">
              <label htmlFor="customerName">Customer Name</label>
              <input
                id="customerName"
                name="customerName"
                type="text"
                value={formData.customerName}
                onChange={handleChange}
                placeholder="Enter customer's full name"
                autoComplete="name"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="contactNumber">Contact Number</label>
              <input
                id="contactNumber"
                name="contactNumber"
                type="tel"
                inputMode="numeric"
                value={formData.contactNumber}
                onChange={handleChange}
                placeholder="09XXXXXXXXX"
                autoComplete="tel"
                pattern="[0-9]{11}"
                maxLength={11}
                title="Enter an 11-digit contact number"
                required
              />
            </div>
          </div>
        </section>

        <section
          className="repair-form-section"
          aria-labelledby="gadget-section-title"
        >
          <div className="repair-form-section-heading">
            <span className="repair-section-number" aria-hidden="true">
              02
            </span>
            <div>
              <h3 id="gadget-section-title">Gadget Information</h3>
              <p>Identify the device being submitted for repair.</p>
            </div>
          </div>

          <div className="repair-form-fields">
            <div className="form-group">
              <label htmlFor="gadgetType">Gadget Type</label>
              <select
                id="gadgetType"
                name="gadgetType"
                value={formData.gadgetType}
                onChange={handleChange}
              >
                <option>Smartphone</option>
                <option>Laptop</option>
                <option>Tablet</option>
                <option>Desktop</option>
                <option>Other</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="brand">Brand</label>
              <input
                id="brand"
                name="brand"
                value={formData.brand}
                onChange={handleChange}
                placeholder="e.g. Samsung"
                required
              />
            </div>

            <div className="form-group repair-field-full">
              <label htmlFor="model">Model</label>
              <input
                id="model"
                name="model"
                value={formData.model}
                onChange={handleChange}
                placeholder="Enter the gadget model"
                required
              />
            </div>
          </div>
        </section>

        <section
          className="repair-form-section"
          aria-labelledby="details-section-title"
        >
          <div className="repair-form-section-heading">
            <span className="repair-section-number" aria-hidden="true">
              03
            </span>
            <div>
              <h3 id="details-section-title">Repair Details</h3>
              <p>
                Describe the reported problem
                {isEditing ? " and update its progress." : "."}
              </p>
            </div>
          </div>

          <div className="repair-form-fields">
            <div className="form-group repair-field-full">
              <label htmlFor="issue">Reported Issue</label>
              <textarea
                id="issue"
                name="issue"
                value={formData.issue}
                onChange={handleChange}
                placeholder="Describe the problem reported by the customer..."
                rows={3}
                required
              />
            </div>

            {isEditing && (
              <div className="form-group repair-field-full">
                <label htmlFor="status">Repair Status</label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  disabled={statusOptions.length === 0}
                >
                  {statusOptions.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
                {statusError && (
                  <p className="form-error" role="alert">
                    {statusError}
                  </p>
                )}
              </div>
            )}
          </div>
        </section>

        <div className="form-actions">
          <p>
            {isEditing
              ? "Review your updates before saving."
              : "Please review all details before registering."}
          </p>
          <div className="form-actions-buttons">
            <button
              type="button"
              className="btn-cancel"
              onClick={handleCancel}
              disabled={saving}
            >
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving
                ? "Saving..."
                : isEditing
                  ? "Save Changes"
                  : "Register Repair"}
            </button>
          </div>
        </div>
      </form>
    </section>
  );
}

export default RepairForm;

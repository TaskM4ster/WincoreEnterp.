function RepairItem({ repair, onEdit, onDelete }) {
  function handleDelete() {
    const confirmed = window.confirm(
      `Are you sure you want to delete ${repair.trackingNumber}?`,
    );

    if (confirmed) {
      onDelete(repair.id);
    }
  }

  return (
    <div className="repair-card">
      <h3>{repair.trackingNumber}</h3>

      <p>Customer: {repair.customerName}</p>

      <p>
        Gadget: {repair.brand} {repair.model}
      </p>

      <p>Type: {repair.gadgetType}</p>
      <p>Issue: {repair.issue}</p>
      <p>Date Received: {repair.dateReceived}</p>

      <p>
        Status: <span className="repair-status">{repair.status}</span>
      </p>

      <div className="repair-actions">
        <button
          type="button"
          className="btn-edit"
          onClick={() => onEdit(repair)}
        >
          Edit
        </button>

        <button type="button" className="btn-delete" onClick={handleDelete}>
          Delete
        </button>
      </div>
    </div>
  );
}

export default RepairItem;

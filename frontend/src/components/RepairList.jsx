import RepairItem from "./RepairItem";

function RepairList({ repairs, onEdit, onDelete }) {
  return (
    <section>
      <h2>Repair Records</h2>

      {repairs.length === 0 ? (
        <p>No repair records available.</p>
      ) : (
        <div className="repair-list">
          {repairs.map((repair) => (
            <RepairItem
              key={repair.id}
              repair={repair}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </section>
  );
}

export default RepairList;

import { useState } from "react";
import Card from "../../components/Card";
import Table from "../../components/Table";

const DUMMY = [
  { id: 1, date: "2026-10-08", patient: "Rahul K.", doctor: "Dr. Sonam", status: "CONFIRMED", payment: "PAID" },
  { id: 2, date: "2026-10-08", patient: "Sana M.", doctor: "Dr. Abid", status: "PENDING", payment: "PENDING" },
  { id: 3, date: "2026-10-07", patient: "Imran S.", doctor: "Dr. Rehman", status: "COMPLETED", payment: "PAID" },
  { id: 4, date: "2026-10-06", patient: "Priya D.", doctor: "Dr. Sonam", status: "CANCELLED", payment: "REFUNDED" },
];

const ALL_STATUSES = ["ALL", "PENDING", "CONFIRMED", "COMPLETED", "CANCELLED", "REJECTED", "NO_SHOW"];

function AdminAppointments() {
  const [status, setStatus] = useState("ALL");

  const filtered = status === "ALL" ? DUMMY : DUMMY.filter(a => a.status === status);

  const handleStatusChange = (id, newStatus) => {
    // ⏳ Phase 6: PATCH /api/appointments/:id/status — transition matrix backend me hai
    alert(`Appointment ${id} → ${newStatus} (dummy)`);
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">All Appointments</h1>

      <div className="flex flex-wrap gap-2">
        {ALL_STATUSES.map(s => (
          <button
            key={s}
            onClick={() => setStatus(s)}
            className={`px-3 py-1.5 rounded-lg text-sm ${
              status === s ? "bg-blue-600 text-white" : "bg-white text-gray-600 border"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {/* ⏳ Phase 6: GET /api/appointments?status= */}

      <Card>
        <Table
          columns={[
            { key: "date", label: "Date" },
            { key: "patient", label: "Patient" },
            { key: "doctor", label: "Doctor" },
            { key: "status", label: "Status" },
            { key: "payment", label: "Payment" },
            { key: "actions", label: "Change Status" },
          ]}
          data={filtered.map(a => ({
            ...a,
            actions: (
              <select
                defaultValue=""
                onChange={e => handleStatusChange(a.id, e.target.value)}
                className="px-2 py-1 border rounded text-xs"
              >
                <option value="" disabled>Select</option>
                <option>CONFIRMED</option>
                <option>COMPLETED</option>
                <option>CANCELLED</option>
                <option>REJECTED</option>
                <option>NO_SHOW</option>
              </select>
            ),
          }))}
        />
      </Card>
    </div>
  );
}
export default AdminAppointments;
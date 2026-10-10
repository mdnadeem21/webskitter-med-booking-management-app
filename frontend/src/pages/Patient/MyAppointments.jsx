import { useState } from "react";
import Card from "../../components/Card";
import Table from "../../components/Table";
import Button from "../../components/Button";

const DUMMY = [
  { id: 1, doctor: "Dr. Sonam", date: "2026-10-10", time: "09:00", type: "IN_PERSON", status: "CONFIRMED" },
  { id: 2, doctor: "Dr. Abid", date: "2026-10-12", time: "11:30", type: "TELECONSULT", status: "PENDING" },
  { id: 3, doctor: "Dr. Sonam", date: "2026-09-28", time: "10:00", type: "IN_PERSON", status: "COMPLETED" },
];

const STATUS_COLORS = {
  PENDING: "bg-yellow-100 text-yellow-800",
  CONFIRMED: "bg-blue-100 text-blue-800",
  COMPLETED: "bg-green-100 text-green-800",
  CANCELLED: "bg-red-100 text-red-800",
};

function MyAppointments() {
  const [filter, setFilter] = useState("ALL");

  const filtered = filter === "ALL" ? DUMMY : DUMMY.filter(a => a.status === filter);

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">My Appointments</h1>

      {/* STATUS FILTERS */}
      <div className="flex gap-2">
        {["ALL", "PENDING", "CONFIRMED", "COMPLETED", "CANCELLED"].map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-lg text-sm ${
              filter === s ? "bg-blue-600 text-white" : "bg-white text-gray-600 border"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      <Card>
        <Table
          columns={[
            { key: "doctor", label: "Doctor" },
            { key: "date", label: "Date" },
            { key: "time", label: "Time" },
            { key: "type", label: "Type" },
            { key: "status", label: "Status" },
          ]}
          data={filtered.map(a => ({
            ...a,
            status: (
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[a.status]}`}>
                {a.status}
              </span>
            ),
          }))}
        />
      </Card>
    </div>
  );
}
export default MyAppointments;
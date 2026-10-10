import { useState } from "react";
import Card from "../../components/Card";
import Table from "../../components/Table";

const DUMMY = [
  { id: 1, date: "2026-10-08", time: "09:00", patient: "Rahul K.", type: "IN_PERSON", status: "CONFIRMED" },
  { id: 2, date: "2026-10-08", time: "10:30", patient: "Sana M.", type: "TELECONSULT", status: "PENDING" },
  { id: 3, date: "2026-10-09", time: "11:00", patient: "Imran S.", type: "IN_PERSON", status: "CONFIRMED" },
  { id: 4, date: "2026-10-05", time: "09:30", patient: "Priya D.", type: "IN_PERSON", status: "COMPLETED" },
  { id: 5, date: "2026-10-04", time: "15:00", patient: "Ahmed R.", type: "TELECONSULT", status: "NO_SHOW" },
];

const STATUS_COLORS = {
  PENDING: "bg-yellow-100 text-yellow-800",
  CONFIRMED: "bg-blue-100 text-blue-800",
  COMPLETED: "bg-green-100 text-green-800",
  CANCELLED: "bg-red-100 text-red-800",
  NO_SHOW: "bg-orange-100 text-orange-800",
};

function DoctorAppointments() {
  const [status, setStatus] = useState("ALL");
  const [date, setDate] = useState("");

  let filtered = DUMMY;
  if (status !== "ALL") filtered = filtered.filter(a => a.status === status);
  if (date) filtered = filtered.filter(a => a.date === date);

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">My Appointments</h1>

      {/* FILTERS: status + date */}
      <div className="flex flex-wrap items-center gap-2">
        {["ALL", "PENDING", "CONFIRMED", "COMPLETED", "CANCELLED", "NO_SHOW"].map(s => (
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
        <input
          type="date"
          value={date}
          onChange={e => setDate(e.target.value)}
          className="px-3 py-1.5 border rounded-lg text-sm ml-auto"
        />
      </div>

      {/* ⏳ Phase 6: GET /api/appointments/doctor/me?status=&date= */}

      <Card>
        <Table
          columns={[
            { key: "date", label: "Date" },
            { key: "time", label: "Time" },
            { key: "patient", label: "Patient" },
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
export default DoctorAppointments;
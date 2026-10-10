// src/pages/patient/Dashboard.jsx — Phase 5 version: real UI, dummy data
import Card from "../../components/Card";
import StatCard from "../../components/StatCard";
import Table from "../../components/Table";
import Button from "../../components/Button";

const APPOINTMENTS = [
  { id: 1, doctor: "Dr. Sonam", date: "2026-10-10", time: "09:00", status: "CONFIRMED" },
  { id: 2, doctor: "Dr. Abid", date: "2026-10-12", time: "11:30", status: "PENDING" },
];

function PatientDashboard() {
  return (
    <div className="p-6 space-y-6">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">My Dashboard</h1>
        <Button>Book Appointment</Button>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard label="Total Appointments" value={12} icon="📅" />
        <StatCard label="Upcoming" value={2} icon="⏰" color="green" />
        <StatCard label="Completed" value={10} icon="✅" color="orange" />
      </div>

      {/* TABLE */}
      <Card>
        <h2 className="font-semibold text-gray-800 mb-4">Upcoming Appointments</h2>
        <Table
          columns={[
            { key: "doctor", label: "Doctor" },
            { key: "date", label: "Date" },
            { key: "time", label: "Time" },
            { key: "status", label: "Status" },
          ]}
          data={APPOINTMENTS}
        />
      </Card>
    </div>
  );
}
export default PatientDashboard;
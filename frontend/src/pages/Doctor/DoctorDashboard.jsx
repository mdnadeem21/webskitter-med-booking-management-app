// src/pages/doctor/Dashboard.jsx — tumhare /appointments/doctor/me/dashboard ka frontend
import Card from "../../components/Card";
import StatCard from "../../components/StatCard";
import Table from "../../components/Table";

const DUMMY = {
  summary: {
    total: 42, today: 6, upcoming: 11, past: 25,
    statusBreakdown: { PENDING: 3, CONFIRMED: 8, COMPLETED: 27, CANCELLED: 3, NO_SHOW: 1 },
  },
  todayAppointments: [
    { startTime: "09:00", endTime: "09:30", patient: "Rahul K.", status: "CONFIRMED", type: "IN_PERSON" },
    { startTime: "09:30", endTime: "10:00", patient: "Sana M.", status: "PENDING", type: "TELECONSULT" },
  ],
};

function DoctorDashboard() {
  const { summary, todayAppointments } = DUMMY;

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Doctor Dashboard</h1>

      {/* SUMMARY STATS — tumhara backend response structure */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard label="Total Appointments" value={summary.total} icon="📅" />
        <StatCard label="Today" value={summary.today} icon="⏰" color="green" />
        <StatCard label="Upcoming" value={summary.upcoming} icon="🔜" color="orange" />
        <StatCard label="Past" value={summary.past} icon="✅" color="red" />
      </div>

      {/* STATUS BREAKDOWN */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {Object.entries(summary.statusBreakdown).map(([status, count]) => (
          <Card key={status} className="!p-4 text-center">
            <p className="text-2xl font-bold text-gray-800">{count}</p>
            <p className="text-xs text-gray-500 mt-1">{status}</p>
          </Card>
        ))}
      </div>

      {/* TODAY'S LIST */}
      <Card>
        <h2 className="font-semibold text-gray-800 mb-4">Today's Schedule</h2>
        <Table
          columns={[
            { key: "startTime", label: "Time" },
            { key: "patient", label: "Patient" },
            { key: "type", label: "Type" },
            { key: "status", label: "Status" },
          ]}
          data={todayAppointments}
        />
      </Card>
    </div>
  );
}
export default DoctorDashboard;
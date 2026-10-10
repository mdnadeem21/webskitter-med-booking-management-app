import Card from "../../components/Card";
import StatCard from "../../components/StatCard";
import Table from "../../components/Table";

const DUMMY = {
  summary: { today: 8, pending: 3, confirmed: 4, completed: 1, totalPatients: 156 },
  todayAppointments: [
    { time: "09:00", patient: "Rahul K.", doctor: "Dr. Sonam", status: "CONFIRMED", payment: "PAID" },
    { time: "09:30", patient: "Sana M.", doctor: "Dr. Abid", status: "PENDING", payment: "PENDING" },
    { time: "10:00", patient: "Imran S.", doctor: "Dr. Sonam", status: "CONFIRMED", payment: "PAID" },
    { time: "11:30", patient: "Priya D.", doctor: "Dr. Rehman", status: "PENDING", payment: "PENDING" },
  ],
};

function ReceptionistDashboard() {
  const { summary, todayAppointments } = DUMMY;

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Receptionist Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard label="Today's Appointments" value={summary.today} icon="📅" />
        <StatCard label="Pending" value={summary.pending} icon="⏳" color="orange" />
        <StatCard label="Confirmed" value={summary.confirmed} icon="✅" color="green" />
        <StatCard label="Total Patients" value={summary.totalPatients} icon="👥" color="red" />
      </div>

      {/* ⏳ Phase 6: dashboard API for receptionist */}

      <Card>
        <h2 className="font-semibold text-gray-800 mb-4">Today's Appointments</h2>
        <Table
          columns={[
            { key: "time", label: "Time" },
            { key: "patient", label: "Patient" },
            { key: "doctor", label: "Doctor" },
            { key: "status", label: "Status" },
            { key: "payment", label: "Payment" },
          ]}
          data={todayAppointments}
        />
      </Card>
    </div>
  );
}
export default ReceptionistDashboard;
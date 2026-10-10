import Card from "../../components/Card";
import StatCard from "../../components/StatCard";
import Table from "../../components/Table";

const DUMMY = {
  stats: { doctors: 12, receptionists: 3, patients: 156, appointments: 489 },
  pendingVerifications: [
    { name: "Dr. Arif Khan", specialization: "Neurology", email: "arif@clinic.com" },
  ],
  recentAppointments: [
    { date: "2026-10-08", patient: "Rahul K.", doctor: "Dr. Sonam", status: "CONFIRMED" },
    { date: "2026-10-08", patient: "Sana M.", doctor: "Dr. Abid", status: "PENDING" },
  ],
};

function AdminDashboard() {
  const { stats, pendingVerifications, recentAppointments } = DUMMY;

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Admin Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard label="Doctors" value={stats.doctors} icon="👨‍⚕️" />
        <StatCard label="Receptionists" value={stats.receptionists} icon="💁" color="green" />
        <StatCard label="Patients" value={stats.patients} icon="👥" color="orange" />
        <StatCard label="Appointments" value={stats.appointments} icon="📅" color="red" />
      </div>

      {/* ⏳ Phase 6: admin stats API (counts — backend me $facet se ek hi query 😉) */}

      {/* PENDING VERIFICATIONS */}
      <Card>
        <h2 className="font-semibold text-gray-800 mb-4">
          Pending Doctor Verifications ({pendingVerifications.length})
        </h2>
        <Table
          columns={[
            { key: "name", label: "Doctor" },
            { key: "specialization", label: "Specialization" },
            { key: "email", label: "Email" },
            { key: "action", label: "Action" },
          ]}
          data={pendingVerifications.map(d => ({
            ...d,
            action: <button className="text-blue-600 text-xs hover:underline">Verify</button>,
          }))}
        />
      </Card>

      {/* RECENT APPOINTMENTS */}
      <Card>
        <h2 className="font-semibold text-gray-800 mb-4">Recent Appointments</h2>
        <Table
          columns={[
            { key: "date", label: "Date" },
            { key: "patient", label: "Patient" },
            { key: "doctor", label: "Doctor" },
            { key: "status", label: "Status" },
          ]}
          data={recentAppointments}
        />
      </Card>
    </div>
  );
}
export default AdminDashboard;
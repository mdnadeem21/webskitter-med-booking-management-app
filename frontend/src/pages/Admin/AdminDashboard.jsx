import { useEffect, useState } from "react";
import Card from "../../components/Card";
import StatCard from "../../components/StatCard";
import Table from "../../components/Table";
import { getAdminStats } from "../../api/adminApi";
import { getAllDoctors } from "../../api/doctorApi";
import { getAllAppointments } from "../../api/appointmentApi";

const STATUS_COLOR = {
  PENDING: "bg-yellow-100 text-yellow-800",
  CONFIRMED: "bg-blue-100 text-blue-800",
  COMPLETED: "bg-green-100 text-green-800",
  CANCELLED: "bg-red-100 text-red-800",
};

function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [pendingDoctors, setPendingDoctors] = useState([]);
  const [recentAppointments, setRecentAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const [statsRes, doctorsRes, apptsRes] = await Promise.allSettled([
          getAdminStats(),
          getAllDoctors(),
          getAllAppointments(),
        ]);

        if (statsRes.status === "fulfilled") setStats(statsRes.value.data.data);

        if (doctorsRes.status === "fulfilled") {
          setPendingDoctors(
            (doctorsRes.value.data.doctors || []).filter(d => !d.isVerified)
          );
        }

        if (apptsRes.status === "fulfilled") {
          setRecentAppointments((apptsRes.value.data.appointments || []).slice(0, 5));
        }

        if (statsRes.status === "rejected") {
          setError(statsRes.reason?.message || "Stats load failed");
        }
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <div className="p-6 text-gray-500">Loading dashboard...</div>;

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Admin Dashboard</h1>

      {error && <p className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">{error}</p>}

      {/* ---------- STATS ---------- */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard label="Doctors" value={stats?.doctors ?? "—"} icon="👨‍⚕️" />
        <StatCard label="Receptionists" value={stats?.receptionists ?? "—"} icon="💁" color="green" />
        <StatCard label="Patients" value={stats?.patients ?? "—"} icon="👥" color="orange" />
        <StatCard label="Appointments" value={stats?.appointments ?? "—"} icon="📅" color="red" />
      </div>

      {/* ---------- QUICK INSIGHT (naya — useful add) ---------- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-400">Today's Appointments</p>
              <p className="text-2xl font-bold text-blue-600">{stats?.todayAppointments ?? 0}</p>
            </div>
            <span className="text-3xl">📆</span>
          </div>
        </Card>
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-400">Pending Approvals</p>
              <p className="text-2xl font-bold text-orange-500">
                {stats?.pendingAppointments ?? 0}
              </p>
            </div>
            <span className="text-3xl">⏳</span>
          </div>
        </Card>
      </div>

      {/* ---------- PENDING DOCTOR VERIFICATIONS ---------- */}
      <Card>
        <h2 className="font-semibold text-gray-800 mb-4">
          Pending Doctor Verifications ({pendingDoctors.length})
        </h2>
        {pendingDoctors.length === 0 ? (
          <p className="text-sm text-gray-400">Sab doctors verified ✅</p>
        ) : (
          <Table
            columns={[
              { key: "name", label: "Doctor" },
              { key: "specialization", label: "Specialization" },
              { key: "email", label: "Email" },
            ]}
            data={pendingDoctors.map(d => ({
              name: d.name,
              specialization: d.specialization,
              email: d.email,
            }))}
          />
        )}
      </Card>

      {/* ---------- RECENT APPOINTMENTS ---------- */}
      <Card>
        <h2 className="font-semibold text-gray-800 mb-4">Recent Appointments</h2>
        {recentAppointments.length === 0 ? (
          <p className="text-sm text-gray-400">Abhi tak koi appointment nahi</p>
        ) : (
          <Table
            columns={[
              { key: "date", label: "Date" },
              { key: "patient", label: "Patient" },
              { key: "doctor", label: "Doctor" },
              { key: "status", label: "Status" },
            ]}
            data={recentAppointments.map(a => ({
              date: new Date(a.appointmentDate).toLocaleDateString("en-IN", { day: "numeric", month: "short" }),
              patient: a.patientId?.name || "—",
              doctor: a.doctorId?.name || "—",
              status: (
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLOR[a.status] || "bg-gray-100"}`}>
                  {a.status}
                </span>
              ),
            }))}
          />
        )}
      </Card>
    </div>
  );
}
export default AdminDashboard;
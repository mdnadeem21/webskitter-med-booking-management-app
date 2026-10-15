import { useEffect, useState, useCallback } from "react";
import Card from "../../components/Card";
import Table from "../../components/Table";
import { getMyAllAppointments } from "../../api/doctorApi";

const ALL = ["ALL", "PENDING", "CONFIRMED", "COMPLETED", "CANCELLED", "NO_SHOW"];
const STATUS_COLOR = {
  PENDING: "bg-yellow-100 text-yellow-800",
  CONFIRMED: "bg-blue-100 text-blue-800",
  COMPLETED: "bg-green-100 text-green-800",
  CANCELLED: "bg-red-100 text-red-800",
  NO_SHOW: "bg-gray-100 text-gray-800",
};

function MyAppointments() {
  const [status, setStatus] = useState("ALL");
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchList = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await getMyAllAppointments(status === "ALL" ? null : status);
      setList(res.data.appointments || []);
    } catch (err) {
      setError(err.message || "Load failed");
    } finally {
      setLoading(false);
    }
  }, [status]);

  useEffect(() => { fetchList(); }, [fetchList]);

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">My Appointments</h1>

      <div className="flex flex-wrap gap-2">
        {ALL.map(s => (
          <button key={s} onClick={() => setStatus(s)}
            className={`px-3 py-1.5 rounded-lg text-sm ${
              status === s ? "bg-blue-600 text-white" : "bg-white text-gray-600 border"
            }`}>{s}</button>
        ))}
      </div>

      {error && <p className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">{error}</p>}

      <Card>
        {loading ? (
          <p className="text-gray-500 text-sm">Loading...</p>
        ) : list.length === 0 ? (
          <p className="text-gray-500 text-sm">Is filter me koi appointment nahi</p>
        ) : (
          <Table
            columns={[
              { key: "date", label: "Date & Time" },
              { key: "patient", label: "Patient" },
              { key: "reason", label: "Reason" },
              { key: "type", label: "Type" },
              { key: "fee", label: "Fee" },
              { key: "status", label: "Status" },
            ]}
            data={list.map(a => ({
              id: a._id,
              date: (
                <div>
                  <p className="text-sm">{new Date(a.appointmentDate).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</p>
                  <p className="text-xs text-gray-400">{a.startTime} - {a.endTime}</p>
                </div>
              ),
              patient: (
                <div>
                  <p>{a.patientId?.name || "—"}</p>
                  <p className="text-xs text-gray-400">{a.patientId?.bloodGroup || ""}</p>
                </div>
              ),
              reason: a.reason || "General",
              type: a.appointmentType,
              fee: `₹${a.consultationFee}`,
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
export default MyAppointments;
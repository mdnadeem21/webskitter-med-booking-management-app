import { useState } from "react";
import Card from "../../components/Card";
import Table from "../../components/Table";

const DUMMY = [
  { id: 1, name: "Rahul K.", email: "rahul@gmail.com", phone: "9876543210", bloodGroup: "O+", appointments: 12 },
  { id: 2, name: "Sana M.", email: "sana@gmail.com", phone: "9876500011", bloodGroup: "A+", appointments: 4 },
  { id: 3, name: "Imran S.", email: "imran@gmail.com", phone: "9812312312", bloodGroup: "B+", appointments: 7 },
];

function AdminPatients() {
  const [search, setSearch] = useState("");
  const filtered = DUMMY.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Patients</h1>

      <input
        type="text"
        placeholder="Search patient..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        className="w-full max-w-sm px-3 py-2 border rounded-lg text-sm"
      />

      {/* ⏳ Phase 6: GET /api/patients (admin view) */}

      <Card>
        <Table
          columns={[
            { key: "name", label: "Name" },
            { key: "email", label: "Email" },
            { key: "phone", label: "Phone" },
            { key: "bloodGroup", label: "Blood" },
            { key: "appointments", label: "Total Appointments" },
          ]}
          data={filtered}
        />
      </Card>
    </div>
  );
}
export default AdminPatients;
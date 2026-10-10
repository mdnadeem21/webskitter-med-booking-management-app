import { useState } from "react";
import Card from "../../components/Card";
import Table from "../../components/Table";
import Button from "../../components/Button";
import Input from "../../components/Input";

const DUMMY = [
  { id: 1, name: "Rahul K.", email: "rahul@gmail.com", phone: "9876543210", bloodGroup: "O+", gender: "Male" },
  { id: 2, name: "Sana M.", email: "sana@gmail.com", phone: "9876500011", bloodGroup: "A+", gender: "Female" },
  { id: 3, name: "Imran S.", email: "imran@gmail.com", phone: "9812312312", bloodGroup: "B+", gender: "Male" },
];

function ReceptionistPatients() {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "", bloodGroup: "", gender: "Male", password: "" });
  const [search, setSearch] = useState("");

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleCreate = (e) => {
    e.preventDefault();
    // ⏳ Phase 6: POST /api/patients — receptionist patient create karti hai
    console.log("New patient:", form);
    alert("Patient created (dummy)");
    setShowForm(false);
    setForm({ name: "", email: "", phone: "", bloodGroup: "", gender: "Male", password: "" });
  };

  const filtered = DUMMY.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center flex-wrap gap-2">
        <h1 className="text-2xl font-bold text-gray-800">Patients</h1>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? "Close" : "+ Add Patient"}
        </Button>
      </div>

      {/* ADD PATIENT FORM */}
      {showForm && (
        <Card>
          <h2 className="font-semibold mb-4">New Patient</h2>
          <form onSubmit={handleCreate}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input label="Name" name="name" value={form.name} onChange={handleChange} required />
              <Input label="Email" name="email" type="email" value={form.email} onChange={handleChange} required />
              <Input label="Phone" name="phone" value={form.phone} onChange={handleChange} required />
              <Input label="Blood Group" name="bloodGroup" value={form.bloodGroup} onChange={handleChange} />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                <select
                  name="gender"
                  value={form.gender}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option>Male</option>
                  <option>Female</option>
                  <option>Other</option>
                </select>
              </div>
              <Input label="Temp Password" name="password" type="password" value={form.password} onChange={handleChange} required />
            </div>
            <Button className="mt-2">Create Patient</Button>
          </form>
        </Card>
      )}

      {/* SEARCH */}
      <input
        type="text"
        placeholder="Search patient..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        className="w-full max-w-sm px-3 py-2 border rounded-lg text-sm"
      />

      {/* ⏳ Phase 6: GET /api/patients */}

      <Card>
        <Table
          columns={[
            { key: "name", label: "Name" },
            { key: "email", label: "Email" },
            { key: "phone", label: "Phone" },
            { key: "bloodGroup", label: "Blood" },
            { key: "gender", label: "Gender" },
          ]}
          data={filtered}
        />
      </Card>
    </div>
  );
}
export default ReceptionistPatients;
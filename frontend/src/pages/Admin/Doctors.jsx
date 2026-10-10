import { useState } from "react";
import Card from "../../components/Card";
import Table from "../../components/Table";
import Button from "../../components/Button";
import Input from "../../components/Input";

const DUMMY = [
  { id: 1, name: "Dr. Sonam", specialization: "Cardiology", email: "sonam@clinic.com", fee: 500, status: "VERIFIED" },
  { id: 2, name: "Dr. Abid", specialization: "Dermatology", email: "abid@clinic.com", fee: 600, status: "VERIFIED" },
  { id: 3, name: "Dr. Arif Khan", specialization: "Neurology", email: "arif@clinic.com", fee: 800, status: "PENDING" },
];

function AdminDoctors() {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: "", email: "", phone: "", specialization: "", qualification: "", consultationFee: "", password: "",
  });

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleCreate = (e) => {
    e.preventDefault();
    // ⏳ Phase 6: POST /api/doctors — admin + temp password email
    console.log("New doctor:", form);
    alert("Doctor created (dummy)");
    setShowForm(false);
  };

  const handleVerify = (id) => {
    // ⏳ Phase 6: PATCH /api/doctors/:id/verify
    alert(`Verify doctor ${id} (dummy)`);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center flex-wrap gap-2">
        <h1 className="text-2xl font-bold text-gray-800">Doctors</h1>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? "Close" : "+ Add Doctor"}
        </Button>
      </div>

      {/* CREATE FORM */}
      {showForm && (
        <Card>
          <h2 className="font-semibold mb-4">New Doctor</h2>
          <form onSubmit={handleCreate}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input label="Name" name="name" value={form.name} onChange={handleChange} required />
              <Input label="Email" name="email" type="email" value={form.email} onChange={handleChange} required />
              <Input label="Phone" name="phone" value={form.phone} onChange={handleChange} required />
              <Input label="Specialization" name="specialization" value={form.specialization} onChange={handleChange} required />
              <Input label="Qualification" name="qualification" value={form.qualification} onChange={handleChange} required />
              <Input label="Fee (₹)" name="consultationFee" type="number" value={form.consultationFee} onChange={handleChange} required />
              <Input label="Temp Password" name="password" type="password" value={form.password} onChange={handleChange} required />
            </div>
            <Button className="mt-2">Create Doctor</Button>
          </form>
        </Card>
      )}

      {/* ⏳ Phase 6: GET /api/doctors, PATCH /api/doctors/:id/verify */}

      <Card>
        <Table
          columns={[
            { key: "name", label: "Name" },
            { key: "specialization", label: "Specialization" },
            { key: "email", label: "Email" },
            { key: "fee", label: "Fee" },
            { key: "status", label: "Status" },
            { key: "actions", label: "Actions" },
          ]}
          data={DUMMY.map(d => ({
            ...d,
            status: (
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                d.status === "VERIFIED"
                  ? "bg-green-100 text-green-800"
                  : "bg-yellow-100 text-yellow-800"
              }`}>
                {d.status}
              </span>
            ),
            actions:
              d.status === "PENDING" ? (
                <button onClick={() => handleVerify(d.id)} className="text-blue-600 text-xs hover:underline">
                  Verify
                </button>
              ) : (
                <span className="text-gray-400 text-xs">—</span>
              ),
          }))}
        />
      </Card>
    </div>
  );
}
export default AdminDoctors;
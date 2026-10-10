import { useState } from "react";
import Card from "../../components/Card";
import Table from "../../components/Table";
import Button from "../../components/Button";
import Input from "../../components/Input";

const DUMMY = [
  { id: 1, name: "Priya Sharma", email: "priya@clinic.com", phone: "9876543210", active: true },
  { id: 2, name: "Vikram Singh", email: "vikram@clinic.com", phone: "9876500011", active: true },
];

function AdminReceptionists() {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "" });

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleCreate = (e) => {
    e.preventDefault();
    // ⏳ Phase 6: POST /api/receptionists
    console.log("New receptionist:", form);
    alert("Receptionist created (dummy)");
    setShowForm(false);
  };

  const handleToggleActive = (id) => {
    // ⏳ Phase 6: PATCH /api/receptionists/:id (isActive toggle — soft delete)
    alert(`Toggle receptionist ${id} (dummy)`);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center flex-wrap gap-2">
        <h1 className="text-2xl font-bold text-gray-800">Receptionists</h1>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? "Close" : "+ Add Receptionist"}
        </Button>
      </div>

      {showForm && (
        <Card>
          <h2 className="font-semibold mb-4">New Receptionist</h2>
          <form onSubmit={handleCreate}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input label="Name" name="name" value={form.name} onChange={handleChange} required />
              <Input label="Email" name="email" type="email" value={form.email} onChange={handleChange} required />
              <Input label="Phone" name="phone" value={form.phone} onChange={handleChange} required />
              <Input label="Temp Password" name="password" type="password" value={form.password} onChange={handleChange} required />
            </div>
            <Button className="mt-2">Create Receptionist</Button>
          </form>
        </Card>
      )}

      {/* ⏳ Phase 6: GET /api/receptionists */}

      <Card>
        <Table
          columns={[
            { key: "name", label: "Name" },
            { key: "email", label: "Email" },
            { key: "phone", label: "Phone" },
            { key: "active", label: "Status" },
            { key: "actions", label: "Actions" },
          ]}
          data={DUMMY.map(r => ({
            ...r,
            active: (
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                r.active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
              }`}>
                {r.active ? "ACTIVE" : "INACTIVE"}
              </span>
            ),
            actions: (
              <button onClick={() => handleToggleActive(r.id)} className="text-xs text-red-600 hover:underline">
                {r.active ? "Deactivate" : "Activate"}
              </button>
            ),
          }))}
        />
      </Card>
    </div>
  );
}
export default AdminReceptionists;
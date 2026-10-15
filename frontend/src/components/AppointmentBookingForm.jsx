import { useEffect, useState } from "react";
import Button from "./Button";
import Input from "./Input";
import { getAllDoctors } from "../api/doctorApi";
import { getAllPatients } from "../api/patientApi";
import { getAllClinics } from "../api/clinicApi";
import { createAppointment } from "../api/appointmentApi";

// 30-min slots — doctor ke schedule ka placeholder (baad me backend se)
const SLOTS = [
  "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
  "14:00", "14:30", "15:00", "15:30", "16:00", "16:30",
];

// endTime = startTime + 30 min
const addMinutes = (time, mins) => {
  const [h, m] = time.split(":").map(Number);
  const total = h * 60 + m + mins;
  return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
};

function AppointmentBookingForm({ onBooked }) {
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [clinics, setClinics] = useState([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    patientId: "", doctorId: "", clinicId: "",
    date: "", slot: "", type: "IN_PERSON", reason: "General",
  });

  // sab options parallel load
  useEffect(() => {
    Promise.allSettled([getAllPatients(), getAllDoctors(), getAllClinics()])
      .then(([p, d, c]) => {
        if (p.status === "fulfilled") setPatients(p.value.data.patients || []);
        if (d.status === "fulfilled") setDoctors(d.value.data.doctors || []);
        if (c.status === "fulfilled") setClinics(c.value.data.clinics || []);
      });
  }, []);

  const selectedDoctor = doctors.find(doc => doc._id === form.doctorId);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleDoctorChange = e =>
    setForm({ ...form, doctorId: e.target.value, slot: "" });   // doctor badla → slot reset

  const handleDateChange = e =>
    setForm({ ...form, date: e.target.value, slot: "" });       // date badli → slot reset

  // ---------- BOOK ----------
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.patientId || !form.doctorId || !form.clinicId || !form.date || !form.slot) {
      return setError("Sab fields select karo (patient, doctor, clinic, date, slot)");
    }
    if (!selectedDoctor) return setError("Doctor select karo");
    if (!selectedDoctor.departmentId) return setError("Is doctor ka department set nahi hai — admin se karwao");

    setSaving(true);
    try {
      await createAppointment({
        patientId: form.patientId,
        doctorId: form.doctorId,
        clinicId: form.clinicId,
        departmentId: selectedDoctor.departmentId,          // ⬅️ doctor se auto
        appointmentDate: form.date,
        startTime: form.slot,
        endTime: addMinutes(form.slot, 30),
        appointmentType: form.type,
        consultationFee: selectedDoctor.consultationFee,    // ⬅️ doctor se auto
        reason: form.reason || "General",
      });
      alert("Appointment booked ✅");
      setForm({ patientId: "", doctorId: "", clinicId: "", date: "", slot: "", type: "IN_PERSON", reason: "General" });
      onBooked?.();   // parent list refresh karega
    } catch (err) {
      setError(err.message || "Booking failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* PATIENT */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Patient *</label>
          <select name="patientId" value={form.patientId} onChange={handleChange} required
            className="w-full px-3 py-2 border rounded-lg">
            <option value="">Select patient</option>
            {patients.map(p => <option key={p._id} value={p._id}>{p.name} ({p.phone})</option>)}
          </select>
        </div>

        {/* DOCTOR */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Doctor *</label>
          <select name="doctorId" value={form.doctorId} onChange={handleDoctorChange} required
            className="w-full px-3 py-2 border rounded-lg">
            <option value="">Select doctor</option>
            {doctors.map(d => (
              <option key={d._id} value={d._id}>
                {d.name} — {d.specialization} (₹{d.consultationFee})
              </option>
            ))}
          </select>
        </div>

        {/* CLINIC */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Clinic *</label>
          <select name="clinicId" value={form.clinicId} onChange={handleChange} required
            className="w-full px-3 py-2 border rounded-lg">
            <option value="">Select clinic</option>
            {clinics.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
          </select>
        </div>

        {/* DATE */}
        <Input label="Date *" name="date" type="date" value={form.date}
          onChange={handleDateChange} required
          min={new Date().toISOString().split("T")[0]} />

        {/* SLOT */}
        <div>
          <label className="book-sm block text-sm font-medium text-gray-700 mb-1">Time Slot *</label>
          <select name="slot" value={form.slot} onChange={handleChange} required
            disabled={!form.doctorId || !form.date}
            className="w-full px-3 py-2 border rounded-lg disabled:bg-gray-100">
            <option value="">{form.doctorId && form.date ? "Select slot" : "Pehle doctor + date select karo"}</option>
            {SLOTS.map(s => <option key={s} value={s}>{s} - {addMinutes(s, 30)}</option>)}
          </select>
        </div>

        {/* TYPE */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
          <select name="type" value={form.type} onChange={handleChange}
            className="w-full px-3 py-2 border rounded-lg">
            <option value="IN_PERSON">In-Person</option>
            <option value="ONLINE">Online</option>
          </select>
        </div>

        {/* REASON */}
        <Input label="Reason" name="reason" value={form.reason} onChange={handleChange}
          placeholder="Fever, checkup..." />
      </div>

      {selectedDoctor && (
        <p className="text-xs text-gray-500 bg-blue-50 p-3 rounded-lg">
          ℹ️ Fee: ₹{selectedDoctor.consultationFee} · Department auto: {selectedDoctor.departmentId?.name || "—"}
        </p>
      )}

      {error && <p className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">{error}</p>}

      <Button type="submit" disabled={saving}>
        {saving ? "Booking..." : "Book Appointment"}
      </Button>
    </form>
  );
}
export default AppointmentBookingForm;
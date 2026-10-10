import { useState } from "react";
import Button from "./Button";
import Input from "./Input";

const DEPARTMENTS = [
    { id: 1, name: "Cardiology" },
    { id: 2, name: "Dermatology" },
    { id: 3, name: "Pediatrics" },
]
const getEndTime = (start) => {
    const [h, m] = start.split(":").map(Number);
    const total = h * 60 + m + 30;
    return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
}

const DOCTORS = [
  { id: 1, name: "Dr. Sonam", fee: 500, dept:1, clinicId : 101 },
  { id: 2, name: "Dr. Abid", fee: 600, dept:2, clinicId:101 },
  { id: 3, name: "Dr. Rehman", fee: 800, dept:1, clinicId : 101 },
];
const SLOTS = ["09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "14:00", "14:30"];

function BookingForm({ patientOptions = null, onBooked }) {
  const isPatientMode = patientOptions === null;

  const [form, setForm] = useState({
    patientId: "",
    departmentId:"",
    doctorId: "",
    date: "",
    slot: "",
    type: "IN_PERSON",
    paymentStatus: "PENDING",
  });
  const [errors, setErrors] = useState({});
  const [bookingError, setBookingError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleDeptChange = e =>  setForm({ ...form, departmentId: e.target.value, doctorId: "", slot: "" });

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const validate = () => {
    const errs = {};
    if (!isPatientMode && !form.patientId) errs.patientId = "Patient select karo";
    if (!form.departmentId) errs.departmentId = "Department select karo";
    if (!form.doctorId) errs.doctorId = "Doctor select karo";
    if (!form.date) errs.date = "Date chahiye";
    if (!form.slot) errs.slot = "Slot select karo";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setBookingError("");
    try {
        const doctor = DOCTORS.find(d => d.id === Number(form.doctorId));

      // ---------------- SCHEMA-ALIGNED PAYLOAD ----------------
      const payload = {
        patientId: form.patientId,               // dropdown se
        doctorId: form.doctorId,
        clinicId: doctor?.clinicId,             // doctor se
        departmentId: form.departmentId,
        appointmentDate: form.date,
        startTime: form.slot,
        endTime: getEndTime(form.slot),        // slot + 30 min
        appointmentType: form.type,             // IN_PERSON | ONLINE
        consultationFee: doctor?.fee,           // doctor se
        paymentStatus: form.paymentStatus,     // receptionist only field
        // status, bookingReference → backend defaults
      };

      console.log("Receptionist booking payload:", payload);
      // ⏳ Phase 6: await api.post("/appointments", payload)

      alert("Appointment booked (dummy)");
      setForm({ patientId: "", departmentId: "", doctorId: "", date: "", slot: "", type: "IN_PERSON", paymentStatus: "PENDING" });
      onBooked?.();
    } catch (err) {
        setBookingError(err?.response?.data?.message || "Booking failed");
    }finally{
        setLoading(false);
    }

    // ⏳ Phase 6: POST /api/appointments
   
  };

  const selectCls = (hasError) =>
    `w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500
     ${hasError ? "border-red-500" : "border-gray-300"}`;

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* ---------- PATIENT FIELD — yahi difference hai ---------- */}
        {isPatientMode ? (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Patient</label>
            <div className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-500">
              You (logged in)
            </div>
          </div>
        ) : (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Patient <span className="text-red-500">*</span>
            </label>
            <select
              name="patientId"
              value={form.patientId}
              onChange={handleChange}
              className={selectCls(!!errors.patientId)}
            >
              <option value="">Select patient</option>
              {patientOptions.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
            {errors.patientId && <p className="text-red-500 text-xs mt-1">{errors.patientId}</p>}
          </div>
        )}

        {/* ---------- DEPARTMENT ---------- */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Department <span className="text-red-500">*</span>
          </label>
          <select
            value={form.departmentId}
            onChange={handleDeptChange}
            className={errors.departmentId ? "w-full px-3 py-2 border border-red-500 rounded-lg" : "w-full px-3 py-2 border border-gray-300 rounded-lg"}
          >
            <option value="">Select department</option>
            {DEPARTMENTS.map(d => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
          {errors.departmentId && <p className="text-red-500 text-xs mt-1">{errors.departmentId}</p>}
        </div>

        {/* ---------- DOCTOR ---------- */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Doctor <span className="text-red-500">*</span>
          </label>
          <select
            name="doctorId"
            value={form.doctorId}
            disabled={!form.departmentId}
            onChange={e => setForm({ ...form, doctorId: e.target.value, slot: "" })}
            className={selectCls(!!errors.doctorId)}
          >
            <option value="">
            {form.departmentId ? "Select doctor" : "Select Department"}
            </option>
            {/* {DOCTORS.map(d => (
              <option key={d.id} value={d.id}>{d.name} — ₹{d.fee}</option>
            ))} */}
            {DOCTORS
            .filter(d => !form.departmentId || d.dept === Number(form.departmentId))  // ⬅️ add
            .map(d => (
                <option key={d.id} value={d.id}>{d.name} — ₹{d.fee}</option>
              ))}
          </select>
          {errors.doctorId && <p className="text-red-500 text-xs mt-1">{errors.doctorId}</p>}
        </div>

        {/* ---------- DATE ---------- */}
        <Input
          label="Date *"
          type="date"
          name="date"
          min={new Date().toISOString().split("T")[0]}
          value={form.date}
          onChange={e => setForm({ ...form, date: e.target.value, slot: "" })}
          error={errors.date}
        />

        {/* ---------- TYPE ---------- */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Appointment Type</label>
          <select
            name="type"
            value={form.type}
            onChange={handleChange}
            className={selectCls(false)}
          >
            <option value="IN_PERSON">In-Person</option>
            <option value="ONLINE">Online (vieo consult)</option>
          </select>
        </div>

        {/* ---------- PAYMENT: sirf receptionist mode (patient payment baad me karta hai) ---------- */}
        {!isPatientMode && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Payment</label>
            <select
              name="paymentStatus"
              value={form.paymentStatus}
              onChange={handleChange}
              className={selectCls(false)}
            >
              <option value="PENDING">Pending (baad me)</option>
              <option value="PAID">Paid (cash received)</option>
            </select>
          </div>
        )}
      </div>

      {/* ---------- SLOT PICKER ---------- */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Available Slots <span className="text-red-500">*</span>
          {form.doctorId && form.date ? (
            <span className="text-xs text-gray-400 font-normal">
              — {DOCTORS.find(d => d.id === Number(form.doctorId))?.name}, {form.date}
            </span>
          ) : (
            <span className="text-xs text-gray-400 font-normal">
              — pehle doctor aur date select karo
            </span>
          )}
        </label>
        <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
          {SLOTS.map(slot => (
            <button
              key={slot}
              type="button"
              disabled={!form.doctorId || !form.date}
              onClick={() => setForm({ ...form, slot })}
              className={`py-2 rounded-lg text-sm border transition disabled:opacity-40
                ${form.slot === slot ? "bg-blue-600 text-white border-blue-600" : "hover:border-blue-400"}`}
            >
              {slot}
            </button>
          ))}
        </div>
        {errors.slot && <p className="text-red-500 text-xs mt-1">{errors.slot}</p>}
      </div>

      {bookingError && (
        <p className="text-red-600 text-sm mb-4 bg-red-50 p-3 rounded-lg">{bookingError}</p>
      )}

      <Button disabled={loading}>{loading ? "Booking..." : "Create Appointment"}</Button>
    </form>
  );
}
export default BookingForm;
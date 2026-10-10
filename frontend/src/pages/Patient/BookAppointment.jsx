// src/pages/patient/BookAppointment.jsx
import { useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import Card from "../../components/Card";
import Button from "../../components/Button";

// ⏳ Phase 6: yeh dummy arrays API se aayenge
// GET /api/departments, GET /api/doctors?departmentId=..., GET /api/slots?date=...
const DEPARTMENTS = [
  { id: 1, name: "Cardiology" },
  { id: 2, name: "Dermatology" },
  { id: 3, name: "Pediatrics" },
];
const DOCTORS = [
  { id: 1, name: "Dr. Sonam", dept: 1, fee: 500, clinicId:101 },
  { id: 2, name: "Dr. Abid", dept: 2, fee: 600, clinicId:101 },
  { id: 3, name: "Dr. Rehman", dept: 1, fee: 700, clinicId : 101 },
];
const SLOTS = ["09:00", "09:30", "10:00", "10:30", "11:00", "11:30"];

const getEndTime = (start) => {
    if(!start) return "";
    const [h, m] = start.split(":").map(Number);
    const total = h * 60 + m + 30;
    return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
  };

function BookAppointment() {
  const { user } = useSelector(state => state.auth);
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [selected, setSelected] = useState({ 
    dept: null, 
    doctor: null, 
    date: "", 
    slot: "",
    type: "IN_PERSON",
 });

  const [bookingError, setBookingError] = useState("");
  const [loading, setLoading] = useState(false);

  const next = () => setStep(s => s + 1);
  const back = () => setStep(s => s - 1);

  const doctor = DOCTORS.find(d => d.id === selected.doctor);
  const department = DEPARTMENTS.find(d => d.id === selected.dept);

  const handleSubmit = async () => {
    // ⏳ Phase 6: POST /api/appointments — { doctorId, appointmentDate, startTime, ... }
    setLoading(true);                                 // ⬅️ add
    setBookingError("");                              // ⬅️ add
  try {
    const payload = {
        patientId: user?.id,                       // Redux se logged-in patient
        doctorId: selected.doctor,
        clinicId: doctor?.clinicId,               // doctor se mila
        departmentId: selected.dept,
        appointmentDate: selected.date,
        startTime: selected.slot,
        endTime: getEndTime(selected.slot),      // slot + 30 min
        appointmentType: selected.type,           // IN_PERSON | ONLINE
        consultationFee: doctor?.fee,             // doctor se
        // status, paymentStatus, bookingReference → backend defaults, nahi bhejte
      };
    console.log("Booking:", payload);
    alert(`Booked: ${selected.slot} on ${selected.date}`);
    navigate("/patient/appointments");
  }catch(err){
    setBookingError(err?.response?.data?.message || "Booking failed — try again");
  }finally{
    setLoading(false)
  }
  
  };

  return (
    
    <div className="p-6 space-y-6 max-w-3xl">
    <h1 className="text-2xl font-bold text-gray-800">Book Appointment</h1>

    {/* STEPPER */}
    <div className="flex items-center gap-2">
      {["Department", "Doctor", "Date & Slot", "Confirm"].map((label, i) => (
        <div key={label} className="flex items-center">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm
            ${step > i ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-500"}`}>
            {i + 1}
          </div>
          <span className="ml-2 text-sm text-gray-600 hidden sm:block">{label}</span>
          {i < 3 && <div className="w-8 sm:w-12 h-0.5 bg-gray-200 mx-1 sm:mx-2" />}
        </div>
      ))}
    </div>

    {/* STEP 1: DEPARTMENT */}
    {step === 1 && (
      <Card>
        <h2 className="font-semibold mb-4">Select Department</h2>
        <div className="grid grid-cols-2 gap-3">
          {DEPARTMENTS.map(d => (
            <button
              key={d.id}
              onClick={() => { setSelected(s => ({...s, dept: d.id, doctor : null, slot : ""})); next(); }}
              className={`p-4 rounded-lg border text-left hover:border-blue-500 ${
                selected.dept === d.id ? "border-blue-600 bg-blue-50" : "border-gray-200"
              }`}
            >
              <p className="font-medium">{d.name}</p>
            </button>
          ))}
        </div>
      </Card>
    )}

    {/* STEP 2: DOCTOR */}
    {step === 2 && (
      <Card>
        <h2 className="font-semibold mb-4">Select Doctor</h2>
        <div className="space-y-3">
          {DOCTORS.filter(d => d.dept === selected.dept).map(d => (
            <button
              key={d.id}
              onClick={() => { setSelected(s => ({...s, doctor: d.id})); next(); }}
              className="w-full p-4 rounded-lg border text-left hover:border-blue-500 flex justify-between items-center"
            >
              <div>
                <p className="font-medium">{d.name}</p>
                <p className="text-sm text-gray-500">Consultation Fee: ₹{d.fee}</p>
              </div>
            </button>
          ))}
        </div>
        <Button variant="secondary" onClick={back} className="mt-4">← Back</Button>
      </Card>
    )}

    {/* STEP 3: DATE + TYPE + SLOT */}
    {step === 3 && (
      <Card>
        <h2 className="font-semibold mb-2">Select Date</h2>
        <input
          type="date"
          min={new Date().toISOString().split("T")[0]}
          value={selected.date}
          onChange={(e) => setSelected(s => ({...s, date: e.target.value, slot: ""}))}
          className="mb-4 px-3 py-2 border rounded-lg"
        />

        {/* TYPE — enum fix: ONLINE (TELECONSULT nahi) */}
        <h2 className="font-semibold mb-2">Appointment Type</h2>
        <div className="grid grid-cols-2 gap-2 mb-4">
          {[
            { value: "IN_PERSON", label: "🏥 In-Person", desc: "Clinic visit" },
            { value: "ONLINE", label: "💻 Online", desc: "Video consult" },
          ].map(t => (
            <button
              key={t.value}
              type="button"
              onClick={() => setSelected(s => ({...s, type: t.value}))}
              className={`p-3 rounded-lg border text-left ${
                selected.type === t.value ? "border-blue-600 bg-blue-50" : "border-gray-200"
              }`}
            >
              <p className="font-medium text-sm">{t.label}</p>
              <p className="text-xs text-gray-500">{t.desc}</p>
            </button>
          ))}
        </div>

        <h2 className="font-semibold mb-2">Available Slots
        {!selected.date && (
            <span className="text-xs text-gray-400 font-normal">— select date</span>
       )}
        </h2>
        <div className="grid grid-cols-4 gap-2">
          {SLOTS.map(slot => (
            <button
              key={slot}
              disabled={!selected.date}
              onClick={() => setSelected(s => ({...s, slot}))}
              className={`py-2 rounded-lg text-sm border ${
                selected.slot === slot ? "bg-blue-600 text-white border-blue-600" : "hover:border-blue-400"
              }`}
            >
              {slot}
            </button>
          ))}
        </div>

        <div className="flex gap-2 mt-4">
          <Button variant="secondary" onClick={back}>← Back</Button>
          <Button disabled={!selected.slot} onClick={next}>Next</Button>
        </div>
      </Card>
    )}

    {/* STEP 4: CONFIRM + BOOK */}
    {step === 4 && (
      <Card>
        <h2 className="font-semibold mb-4">Confirm Booking</h2>
        <div className="space-y-2 text-sm text-gray-700">
          <p><b>Department:</b> {department?.name}</p>
          <p><b>Doctor:</b> {doctor?.name}</p>
          <p><b>Date:</b> {selected.date}</p>
          <p><b>Time:</b> {selected.slot} — {getEndTime(selected.slot)}</p>
          <p><b>Type:</b> {selected.type === "ONLINE" ? "Online (video)" : "In-Person"}</p>
          <p><b>Fee:</b> ₹{doctor?.fee}</p>
        </div>

        {bookingError && (
          <p className="text-red-600 text-sm mt-4 bg-red-50 p-3 rounded-lg">{bookingError}</p>
        )}

        <div className="flex gap-2 mt-6">
          <Button variant="secondary" onClick={back}>← Back</Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? "Booking..." : "Confirm & Book"}
          </Button>
        </div>
      </Card>
    )}
  </div>
  );
}
export default BookAppointment;
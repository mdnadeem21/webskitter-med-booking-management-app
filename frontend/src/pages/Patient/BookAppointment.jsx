import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Card from "../../components/Card";
import Button from "../../components/Button";
import { getAllDepartments } from "../../api/departmentApi";
import { getAllDoctors } from "../../api/doctorApi";
import { getAllClinics } from "../../api/clinicApi";
import { createAppointment } from "../../api/appointmentApi";

const SLOTS = ["09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
  "14:00", "14:30", "15:00", "15:30", "16:00", "16:30"];

const getEndTime = (start) => {
  if (!start) return "";
  const [h, m] = start.split(":").map(Number);
  const total = h * 60 + m + 30;
  return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
};

function BookAppointment() {
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [selected, setSelected] = useState({
    dept: null, doctor: null, clinicId: "", date: "", slot: "", type: "IN_PERSON",
  });

  // real data
  const [departments, setDepartments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [clinics, setClinics] = useState([]);
  const [loadError, setLoadError] = useState("");

  const [bookingError, setBookingError] = useState("");
  const [loading, setLoading] = useState(false);

  // options load — ek hi baar
  useEffect(() => {
    Promise.allSettled([getAllDepartments(), getAllDoctors(), getAllClinics()])
      .then(([dep, doc, cli]) => {
        if (dep.status === "fulfilled") setDepartments(dep.value.data.departments || []);
        if (doc.status === "fulfilled") setDoctors(doc.value.data.doctors || []);
        if (cli.status === "fulfilled") setClinics(cli.value.data.clinics || []);
        if (dep.status === "rejected") setLoadError("Departments load nahi hue");
      });
  }, []);

  const next = () => setStep(s => s + 1);
  const back = () => setStep(s => s - 1);

  const doctor = doctors.find(d => d._id === selected.doctor);
  const department = departments.find(d => d._id === selected.dept);
  const clinic = clinics.find(c => c._id === selected.clinicId);

  // dept ke doctors — doctor.departmentId populate hone ki wajah se object/string dono handle
  const deptDoctors = doctors.filter(d => {
    const dDept = d.departmentId?._id || d.departmentId;
    return String(dDept) === String(selected.dept);
  });

  // ---------- BOOK (receptionist jaisa hi payload) ----------
  const handleSubmit = async () => {
    setBookingError("");
    if (!selected.clinicId) return setBookingError("Clinic select karo (Step 3 me)");
    if (!doctor?.departmentId) return setBookingError("Is doctor ka department set nahi — clinic se contact karo");

    setLoading(true);
    try {
      const payload = {
        // patientId backend token se lega (role=patient) — bhejne ki zaroorat nahi
        doctorId: selected.doctor,
        clinicId: selected.clinicId,                       // dropdown se
        departmentId: doctor.departmentId?._id || doctor.departmentId,
        appointmentDate: selected.date,
        startTime: selected.slot,
        endTime: getEndTime(selected.slot),
        appointmentType: selected.type,
        consultationFee: doctor.consultationFee,
      };
      const res = await createAppointment(payload);
      const ref = res.data.appointment?.bookingReference;
      navigate("/patient/appointments", {
        state: { booked: true, reference: ref, doctor: doctor?.name, date: selected.date, slot: selected.slot }
      });
    } catch (err) {
      setBookingError(err.message || "Booking failed — try again");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-3xl">
      <h1 className="text-2xl font-bold text-gray-800">Book Appointment</h1>

      {loadError && <p className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">{loadError}</p>}

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
          {departments.length === 0 ? (
            <p className="text-sm text-gray-400">Departments load ho rahe hain...</p>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {departments.map(d => (
                <button key={d._id}
                  onClick={() => { setSelected(s => ({ ...s, dept: d._id, doctor: null, slot: "" })); next(); }}
                  className={`p-4 rounded-lg border text-left hover:border-blue-500 ${
                    selected.dept === d._id ? "border-blue-600 bg-blue-50" : "border-gray-200"
                  }`}>
                  <p className="font-medium">{d.name}</p>
                  {d.description && <p className="text-xs text-gray-400 mt-1">{d.description}</p>}
                </button>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* STEP 2: DOCTOR */}
      {step === 2 && (
        <Card>
          <h2 className="font-semibold mb-4">Select Doctor</h2>
          {deptDoctors.length === 0 ? (
            <p className="text-sm text-gray-400">Is department me koi doctor nahi</p>
          ) : (
            <div className="space-y-3">
              {deptDoctors.map(d => (
                <button key={d._id}
                  onClick={() => { setSelected(s => ({ ...s, doctor: d._id })); next(); }}
                  className={`w-full p-4 rounded-lg border text-left hover:border-blue-500 flex justify-between items-center
                    ${selected.doctor === d._id ? "border-blue-600 bg-blue-50" : "border-gray-200"}`}>
                  <div>
                    <p className="font-medium">{d.name}</p>
                    <p className="text-sm text-gray-500">{d.specialization} · {d.experience} yrs exp</p>
                  </div>
                  <p className="font-semibold text-blue-600">₹{d.consultationFee}</p>
                </button>
              ))}
            </div>
          )}
          <Button variant="secondary" onClick={back} className="mt-4">← Back</Button>
        </Card>
      )}

      {/* STEP 3: CLINIC + DATE + TYPE + SLOT */}
      {step === 3 && (
        <Card>
          {/* CLINIC — doctor model me clinic nahi, isliye select */}
          <h2 className="font-semibold mb-2">Select Clinic</h2>
          <select value={selected.clinicId}
            onChange={e => setSelected(s => ({ ...s, clinicId: e.target.value }))}
            className="w-full px-3 py-2 border rounded-lg mb-4">
            <option value="">Select clinic</option>
            {clinics.map(c => <option key={c._id} value={c._id}>{c.name} — {c.address}</option>)}
          </select>

          <h2 className="font-semibold mb-2">Select Date</h2>
          <input type="date"
            min={new Date().toISOString().split("T")[0]}
            value={selected.date}
            onChange={e => setSelected(s => ({ ...s, date: e.target.value, slot: "" }))}
            className="mb-4 px-3 py-2 border rounded-lg" />

          <h2 className="font-semibold mb-2">Appointment Type</h2>
          <div className="grid grid-cols-2 gap-2 mb-4">
            {[
              { value: "IN_PERSON", label: "🏥 In-Person", desc: "Clinic visit" },
              { value: "ONLINE", label: "💻 Online", desc: "Video consult" },
            ].map(t => (
              <button key={t.value} type="button"
                onClick={() => setSelected(s => ({ ...s, type: t.value }))}
                className={`p-3 rounded-lg border text-left ${
                  selected.type === t.value ? "border-blue-600 bg-blue-50" : "border-gray-200"
                }`}>
                <p className="font-medium text-sm">{t.label}</p>
                <p className="text-xs text-gray-500">{t.desc}</p>
              </button>
            ))}
          </div>

          <h2 className="font-semibold mb-2">Available Slots
            {!selected.date && <span className="text-xs text-gray-400 font-normal">— select date</span>}
          </h2>
          <div className="grid grid-cols-4 gap-2">
            {SLOTS.map(slot => (
              <button key={slot} disabled={!selected.date}
                onClick={() => setSelected(s => ({ ...s, slot }))}
                className={`py-2 rounded-lg text-sm border ${
                  selected.slot === slot ? "bg-blue-600 text-white border-blue-600" : "hover:border-blue-400"
                }`}>
                {slot}
              </button>
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-2">
            ℹ️ Booked slots pe confirm ke waqt error aayega — koi aur slot try karo.
          </p>

          <div className="flex gap-2 mt-4">
            <Button variant="secondary" onClick={back}>← Back</Button>
            <Button disabled={!selected.slot || !selected.clinicId} onClick={next}>Next</Button>
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
            <p><b>Clinic:</b> {clinic?.name}</p>
            <p><b>Date:</b> {selected.date}</p>
            <p><b>Time:</b> {selected.slot} — {getEndTime(selected.slot)}</p>
            <p><b>Type:</b> {selected.type === "ONLINE" ? "Online (video)" : "In-Person"}</p>
            <p><b>Fee:</b> ₹{doctor?.consultationFee} <span className="text-xs text-gray-400">(clinic pe pay karna hai)</span></p>
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
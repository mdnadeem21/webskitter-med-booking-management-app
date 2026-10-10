// import { useState } from "react";
// import Card from "../../components/Card";
// import Table from "../../components/Table";
// import Button from "../../components/Button";

// const DUMMY = [
//   { id: 1, date: "2026-10-08", time: "09:00", patient: "Rahul K.", doctor: "Dr. Sonam", status: "CONFIRMED", payment: "PAID" },
//   { id: 2, date: "2026-10-08", time: "10:30", patient: "Sana M.", doctor: "Dr. Abid", status: "PENDING", payment: "PENDING" },
//   { id: 3, date: "2026-10-09", time: "11:00", patient: "Imran S.", doctor: "Dr. Sonam", status: "PENDING", payment: "PENDING" },
//   { id: 4, date: "2026-10-06", time: "14:00", patient: "Priya D.", doctor: "Dr. Rehman", status: "CANCELLED", payment: "REFUNDED" },
// ];

// const PAYMENT_COLORS = {
//   PENDING: "bg-yellow-100 text-yellow-800",
//   PAID: "bg-green-100 text-green-800",
//   FAILED: "bg-red-100 text-red-800",
//   REFUNDED: "bg-purple-100 text-purple-800",
// };

// function ReceptionistAppointments() {
//   const [search, setSearch] = useState("");

//   const filtered = DUMMY.filter(a =>
//     a.patient.toLowerCase().includes(search.toLowerCase()) ||
//     a.doctor.toLowerCase().includes(search.toLowerCase())
//   );

//   return (
//     <div className="p-6 space-y-6">
//       <div className="flex justify-between items-center flex-wrap gap-2">
//         <h1 className="text-2xl font-bold text-gray-800">Appointments</h1>
//         {/* ⏳ Phase 6: receptionist booking flow (doctor + slot choose karke) */}
//         <Button>+ New Booking</Button>
//       </div>

//       {/* SEARCH */}
//       <input
//         type="text"
//         placeholder="Search patient or doctor..."
//         value={search}
//         onChange={e => setSearch(e.target.value)}
//         className="w-full max-w-sm px-3 py-2 border rounded-lg text-sm"
//       />

//       {/* ⏳ Phase 6: GET /api/appointments + PATCH /:id/status, /:id/payment-status */}

//       <Card>
//         <Table
//           columns={[
//             { key: "date", label: "Date" },
//             { key: "time", label: "Time" },
//             { key: "patient", label: "Patient" },
//             { key: "doctor", label: "Doctor" },
//             { key: "status", label: "Status" },
//             { key: "payment", label: "Payment" },
//             { key: "actions", label: "Actions" },
//           ]}
//           data={filtered.map(a => ({
//             ...a,
//             payment: (
//               <span className={`px-2 py-1 rounded-full text-xs font-medium ${PAYMENT_COLORS[a.payment]}`}>
//                 {a.payment}
//               </span>
//             ),
//             actions: (
//               <div className="flex gap-2">
//                 {a.status === "PENDING" && (
//                   <button className="text-blue-600 text-xs hover:underline">Confirm</button>
//                 )}
//                 {a.payment === "PENDING" && (
//                   <button className="text-green-600 text-xs hover:underline">Mark Paid</button>
//                 )}
//               </div>
//             ),
//           }))}
//         />
//       </Card>
//     </div>
//   );
// }
// export default ReceptionistAppointments;


import { useState } from "react";
import Card from "../../components/Card";
import Table from "../../components/Table";
import Button from "../../components/Button";
import Input from "../../components/Input";
import AppointmentBookingForm from "../../components/AppointmentBookingForm";

const DUMMY = [
  { id: 1, date: "2026-10-08", time: "09:00", patient: "Rahul K.", doctor: "Dr. Sonam", status: "CONFIRMED", payment: "PAID" },
  { id: 2, date: "2026-10-08", time: "10:30", patient: "Sana M.", doctor: "Dr. Abid", status: "PENDING", payment: "PENDING" },
  { id: 3, date: "2026-10-09", time: "11:00", patient: "Imran S.", doctor: "Dr. Sonam", status: "PENDING", payment: "PENDING" },
  { id: 4, date: "2026-10-06", time: "14:00", patient: "Priya D.", doctor: "Dr. Rehman", status: "CANCELLED", payment: "REFUNDED" },
];

// ⏳ Phase 6: DOCTORS/PATIENTS/SLOTS API se aayenge
// GET /api/doctors (verified), GET /api/patients, GET /api/slots?doctorId=&date=
const DOCTORS = [
  { id: 1, name: "Dr. Sonam", fee: 500 },
  { id: 2, name: "Dr. Abid", fee: 600 },
  { id: 3, name: "Dr. Rehman", fee: 800 },
];
const PATIENTS = [
  { id: 1, name: "Rahul K." },
  { id: 2, name: "Sana M." },
  { id: 3, name: "Imran S." },
  { id: 4, name: "Priya D." },
];
const SLOTS = ["09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "14:00", "14:30"];

const PAYMENT_COLORS = {
  PENDING: "bg-yellow-100 text-yellow-800",
  PAID: "bg-green-100 text-green-800",
  FAILED: "bg-red-100 text-red-800",
  REFUNDED: "bg-purple-100 text-purple-800",
};

function ReceptionistAppointments() {
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    patientId: "",
    doctorId: "",
    date: "",
    slot: "",
    type: "IN_PERSON",
    paymentStatus: "PENDING",   // counter pe cash aa sakta hai turant
  });
  const [formErrors, setFormErrors] = useState({});

  const filtered = DUMMY.filter(a =>
    a.patient.toLowerCase().includes(search.toLowerCase()) ||
    a.doctor.toLowerCase().includes(search.toLowerCase())
  );

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const validate = () => {
    const errs = {};
    if (!form.patientId) errs.patientId = "Patient select karo";
    if (!form.doctorId) errs.doctorId = "Doctor select karo";
    if (!form.date) errs.date = "Date chahiye";
    if (!form.slot) errs.slot = "Slot select karo";
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleBooking = (e) => {
    e.preventDefault();
    if (!validate()) return;

    // ⏳ Phase 6: POST /api/appointments
    // body: { patientId, doctorId, appointmentDate: form.date, startTime: form.slot,
    //         endTime (slot+30min), appointmentType: form.type, paymentStatus }
    console.log("Booking:", form);
    alert("Appointment booked (dummy)");
    setShowForm(false);
    setForm({ patientId: "", doctorId: "", date: "", slot: "", type: "IN_PERSON", paymentStatus: "PENDING" });
  };

  // Doctor select hote hi slot reset (doosre doctor ke slots alag honge)
  const handleDoctorChange = e =>
    setForm({ ...form, doctorId: e.target.value, slot: "" });

  const handleDateChange = e =>
    setForm({ ...form, date: e.target.value, slot: "" });

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center flex-wrap gap-2">
        <h1 className="text-2xl font-bold text-gray-800">Appointments</h1>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? "Close" : "+ New Booking"}
        </Button>
      </div>

      {/* ---------------- NEW BOOKING FORM ---------------- */}
      {showForm && (
        <Card>
          <h2 className="font-semibold mb-4">New Appointment</h2>
          <AppointmentBookingForm 
          patientOptions={PATIENTS}          
          onBooked={() => setShowForm(false)}/>
        </Card>
      )}

      {/* SEARCH */}
      <input
        type="text"
        placeholder="Search patient or doctor..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        className="w-full max-w-sm px-3 py-2 border rounded-lg text-sm"
      />

      {/* ⏳ Phase 6: GET /api/appointments + PATCH /:id/status, /:id/payment-status */}

      <Card>
        <Table
          columns={[
            { key: "date", label: "Date" },
            { key: "time", label: "Time" },
            { key: "patient", label: "Patient" },
            { key: "doctor", label: "Doctor" },
            { key: "status", label: "Status" },
            { key: "payment", label: "Payment" },
            { key: "actions", label: "Actions" },
          ]}
          data={filtered.map(a => ({
            ...a,
            payment: (
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${PAYMENT_COLORS[a.payment]}`}>
                {a.payment}
              </span>
            ),
            actions: (
              <div className="flex gap-2">
                {a.status === "PENDING" && (
                  <button className="text-blue-600 text-xs hover:underline">Confirm</button>
                )}
                {a.payment === "PENDING" && (
                  <button className="text-green-600 text-xs hover:underline">Mark Paid</button>
                )}
              </div>
            ),
          }))}
        />
      </Card>
    </div>
  );
}
export default ReceptionistAppointments;
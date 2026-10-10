import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../store/slices/authSlice";
import NotificationBell from "../components/NotificationBell";

// ⏳ Phase 6: DOCTORS aur SERVICES API se aayenge — GET /api/doctors (public, verified only)
const SERVICES = [
  {
    icon: "🩺",
    title: "General Consultation",
    desc: "Routine checkups aur common illnesses ke liye expert doctors.",
  },
  {
    icon: "❤️",
    title: "Cardiology",
    desc: "Heart health — ECG, echo, aur specialist consultations.",
  },
  {
    icon: "👶",
    title: "Pediatrics",
    desc: "Bachon ke liye friendly care — vaccines se checkups tak.",
  },
  {
    icon: "🧠",
    title: "Neurology",
    desc: "Brain aur nervous system ke specialist consultations.",
  },
  {
    icon: "💻",
    title: "Teleconsultation",
    desc: "Ghar baithe video call pe doctor se baat karo.",
  },
  {
    icon: "🧪",
    title: "Lab Tests",
    desc: "Blood tests aur reports — online results ke saath.",
  },
];

const DOCTORS = [
  {
    name: "Dr. Sonam",
    specialization: "Cardiology",
    experience: "12 yrs",
    fee: 500,
  },
  {
    name: "Dr. Abid",
    specialization: "Dermatology",
    experience: "8 yrs",
    fee: 600,
  },
  {
    name: "Dr. Rehman",
    specialization: "Neurology",
    experience: "15 yrs",
    fee: 800,
  },
];

const STEPS = [
  {
    num: 1,
    title: "Create Account",
    desc: "Email se register karo — 1 minute ka kaam.",
  },
  {
    num: 2,
    title: "Choose Doctor & Slot",
    desc: "Department select karo, doctor aur available slot book karo.",
  },
  {
    num: 3,
    title: "Get Confirmation",
    desc: "Appointment confirm — reminder bhi milega.",
  },
];

function Landing() {
  const { token, user } = useSelector((s) => s.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const handleLogout = () => {
    dispatch(logout());
    navigate("/"); // landing pe hi raho
  };
  const handleBookNow = () => {
    if (!token) {
      // Guest → login pe bhejo, wapas booking pe aane ke liye state me "intent" save
      navigate("/login", { state: { from: "/patient/book" } });
    } else if (user.role === "patient") {
      // Patient logged in → seedha booking wizard
      navigate("/patient/book");
    } else {
      // Doctor/receptionist/admin → apna dashboard (unke liye booking nahi)
      navigate(`/${user.role}`);
    }
  };
  return (
    <div className="min-h-screen bg-white">
      {/* ---------------- NAVBAR ---------------- */}
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-blue-600">🩺 MediCare</h1>
          <div className="flex items-center gap-3">
            {token ? (
              <>
                {/* Logged in: dashboard + logout dikhao */}
                <Link
                  to={`/${user.role}`}
                  className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700"
                >
                  Go to Dashboard
                </Link>
                <NotificationBell /> {/* ⬅️ BELL */}
                <span className="text-sm text-gray-700 hidden sm:block">
                  {user?.name} {/* name badge */}
                </span>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 text-sm font-medium text-red-600 border border-red-200 rounded-lg hover:bg-red-50"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                {/* Guest: login/register dikhao */}
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* ---------------- HERO ---------------- */}
      <section className="bg-gradient-to-br from-blue-50 to-white">
        <div className="max-w-6xl mx-auto px-4 py-20 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-800 leading-tight">
            Book Doctor Appointments
            <span className="block text-blue-600">in Minutes, Not Hours</span>
          </h2>
          <p className="text-gray-500 mt-4 max-w-xl mx-auto">
            Expert doctors, transparent fees, aur zero waiting queue. Apna slot
            choose karo — confirm ho jayega instantly.
          </p>
          <div className="mt-8 flex justify-center gap-3">
            {/* <Link
              to="/register"
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
            >
              Book Appointment
            </Link> */}
            <button
              onClick={handleBookNow}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
            >
              Book Appointment
            </button>
            <a
              href="#doctors"
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50"
            >
              Meet Our Doctors
            </a>
          </div>

          {/* STATS */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
            {[
              { value: "25+", label: "Expert Doctors" },
              { value: "50k+", label: "Patients Served" },
              { value: "10k+", label: "Appointments Booked" },
              { value: "4.8★", label: "Patient Rating" },
            ].map((s) => (
              <div
                key={s.label}
                className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm"
              >
                <p className="text-2xl font-bold text-blue-600">{s.value}</p>
                <p className="text-xs text-gray-500 mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- SERVICES ---------------- */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-gray-800 text-center">
          Our Services
        </h2>
        <p className="text-gray-500 text-center mt-2 mb-10">
          Har department me experienced specialists
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {SERVICES.map((s) => (
            <div
              key={s.title}
              className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm hover:shadow-md transition"
            >
              <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center text-2xl">
                {s.icon}
              </div>
              <h3 className="font-semibold text-gray-800 mt-4">{s.title}</h3>
              <p className="text-sm text-gray-500 mt-1">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ---------------- DOCTORS ---------------- */}
      <section id="doctors" className="bg-gray-50 py-16">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-800 text-center">
            Meet Our Doctors
          </h2>
          <p className="text-gray-500 text-center mt-2 mb-10">
            Verified specialists — fees transparent, slots real-time
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {DOCTORS.map((d) => (
              <div
                key={d.name}
                className="bg-white rounded-xl border border-gray-100 p-6 text-center shadow-sm"
              >
                <div className="w-16 h-16 bg-blue-100 rounded-full mx-auto flex items-center justify-center text-2xl">
                  👨‍⚕️
                </div>
                <h3 className="font-semibold text-gray-800 mt-3">{d.name}</h3>
                <p className="text-sm text-blue-600">{d.specialization}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {d.experience} experience
                </p>
                <p className="text-sm font-medium text-gray-800 mt-2">
                  ₹{d.fee} consultation
                </p>
                {/* <Link
                  to="/login"
                  className="inline-block mt-4 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
                >
                  Book Now
                </Link> */}
                <button
                  onClick={handleBookNow}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
                >
                  Book Now
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- HOW IT WORKS ---------------- */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-gray-800 text-center">
          How It Works
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-10">
          {STEPS.map((s) => (
            <div key={s.num} className="text-center">
              <div className="w-12 h-12 bg-blue-600 text-white rounded-full mx-auto flex items-center justify-center text-lg font-bold">
                {s.num}
              </div>
              <h3 className="font-semibold text-gray-800 mt-4">{s.title}</h3>
              <p className="text-sm text-gray-500 mt-1">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ---------------- CTA ---------------- */}
      <section className="bg-blue-600 py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white">
            Ready to book your appointment?
          </h2>
          <p className="text-blue-100 mt-2">
            Register karo aur 2 minute me apna slot lock karo.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            {/* <Link
              to="/register"
              className="px-6 py-3 bg-white text-blue-600 rounded-lg font-medium hover:bg-blue-50"
            >
              Register Now
            </Link>
            <Link
              to="/login"
              className="px-6 py-3 border border-blue-300 text-white rounded-lg font-medium hover:bg-blue-700"
            >
              Login
            </Link> */}
            <button
              onClick={handleBookNow}
              className="px-6 py-3 bg-white text-blue-600 rounded-lg font-medium hover:bg-blue-50"
            >
              Book Appointment
            </button>
          </div>
        </div>
      </section>

      {/* ---------------- FOOTER ---------------- */}
      <footer className="bg-gray-800 text-gray-400 py-8">
        <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row justify-between gap-4 text-sm">
          <div>
            <p className="text-white font-semibold">🩺 MediCare</p>
            <p className="mt-1">Your health, our priority.</p>
          </div>
          <div>
            <p className="text-white font-semibold mb-1">Contact</p>
            <p>📞 +91 98765 43210</p>
            <p>✉️ care@medicare.com</p>
          </div>
          <div>
            <p className="text-white font-semibold mb-1">Timings</p>
            <p>Mon–Sat: 9:00 AM – 8:00 PM</p>
            <p>Sunday: Emergency only</p>
          </div>
        </div>
        <p className="text-center text-xs mt-6">
          © 2026 MediCare. All rights reserved.
        </p>
      </footer>
    </div>
  );
}

export default Landing;

// src/layouts/DashboardLayout.jsx
import { NavLink, Outlet } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../store/slices/authSlice";
import { useNavigate, Link } from "react-router-dom";
import NotificationBell from "../components/NotificationBell";

// Har role ka apna menu — role.json jaisa concept, frontend version
const MENU_BY_ROLE = {
    patient: [
      { to: "/patient", label: "Dashboard", end: true },
      { to: "/patient/book", label: "Book Appointment" },
      { to: "/patient/appointments", label: "My Appointments" },
      { to: "/patient/profile", label: "Profile" },
    ],
    doctor: [
      { to: "/doctor", label: "Dashboard", end: true },
      { to: "/doctor/appointments", label: "Appointments" },
      { to: "/doctor/profile", label: "Profile" },
    ],
    receptionist: [
      { to: "/receptionist", label: "Dashboard", end: true },
      { to: "/receptionist/appointments", label: "Appointments" },
      { to: "/receptionist/patients", label: "Patients" },
      { to: "/receptionist/Profile", label: "Profile" },
    ],
    admin: [
      { to: "/admin", label: "Dashboard", end: true },
      { to: "/admin/doctors", label: "Doctors" },
      { to: "/admin/receptionists", label: "Receptionists" },
      { to: "/admin/patients", label: "Patients" },
      { to: "/admin/appointments", label: "Appointments" },
      { to: "/admin/profile", label: "Profile" },
    ],
  };

function DashboardLayout() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const menu = MENU_BY_ROLE[user.role] || [];

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  return (

    <div className="flex-1 flex flex-col">
  {/* HEADER */}
  <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
    <div>
      <p className="text-sm text-gray-500">Welcome back 👋</p>
      <p className="font-semibold text-gray-800">{user?.name} ({user?.role})</p>
    </div>
    <div className="flex items-center gap-3">
      <NotificationBell/>
      <Link to="/" className="text-sm text-gray-500 hover:text-blue-600">Home</Link>
      <span className="text-gray-300">|</span>
      <button onClick={handleLogout} className="text-sm text-red-600 hover:underline">
        Logout
      </button>
    </div>
  </header>

    <div className="min-h-screen bg-gray-100 flex">
      {/* SIDEBAR */}
      <aside className="w-64 bg-white border-r border-gray-200 p-4 flex flex-col">
        <h2 className="text-lg font-bold text-blue-600 mb-6">MediCare</h2>
        <nav className="flex-1 space-y-1">
          {menu.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `block px-3 py-2 rounded-lg text-sm ${
                  isActive
                    ? "bg-blue-600 text-white"
                    : "text-gray-600 hover:bg-gray-100"
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        {/* LOGOUT */}
        <button
          onClick={handleLogout}
          className="mt-4 w-full text-left px-3 py-2 rounded-lg text-sm text-red-600 hover:bg-red-50"
        >
          Logout
        </button>
      </aside>

      {/* MAIN CONTENT — nested routes yahan render honge */}
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
    </div>
  );
}

export default DashboardLayout;
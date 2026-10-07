// src/layouts/DashboardLayout.jsx
import { NavLink, Outlet } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../store/slices/authSlice";
import { useNavigate } from "react-router-dom";

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
      { to: "/receptionist/Profile" },
    ],
    admin: [
      { to: "/admin", label: "Dashboard", end: true },
      { to: "/admin/doctors", label: "Doctors" },
      { to: "/admin/receptionists", label: "Receptionists" },
      { to: "/admin/patients", label: "Patients" },
      { to: "/admin/appointments", label: "Appointments" },
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
  );
}

export default DashboardLayout;
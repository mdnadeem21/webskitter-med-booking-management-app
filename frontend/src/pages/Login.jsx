// src/pages/Login.jsx — Redux connect karke test
import { useDispatch } from "react-redux";
import { setCredentials } from "../store/slices/authSlice";
import { useNavigate } from "react-router-dom";

const DUMMY_USERS = {
    admin: { name: "Admin User", email: "admin@test.com", role: "admin" },
    doctor: { name: "Dr. Sonam", email: "doctor@test.com", role: "doctor" },
    receptionist: { name: "Receptionist", email: "recept@test.com", role: "receptionist" },
    patient: { name: "Patient", email: "patient@test.com", role: "patient" },
  };

function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleDummyLogin = (role) => {
    // Phase 6 me yahan real API call aayega — abhi dummy test
    dispatch(
      setCredentials({
        token: `dummy-token-${role}`,
        user: DUMMY_USERS[role],
      })
    );
    navigate(`/${role}`);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
    <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
      <h1 className="text-2xl font-bold text-gray-800">Login</h1>
      <p className="text-gray-500 mt-2 mb-6">Phase 4 — role-based protection test</p>
      <div className="space-y-2">
        {["admin", "doctor", "receptionist", "patient"].map((role) => (
          <button
            key={role}
            onClick={() => handleDummyLogin(role)}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 capitalize"
          >
            Login as {role}
          </button>
        ))}
      </div>
    </div>
  </div>
  );
}
export default Login;
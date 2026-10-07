// src/routes/ProtectedRoute.jsx
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  // Redux se token — loadAuth() se refresh pe bhi restore hota hai
  const { token } = useSelector((state) => state.auth);

  // Token nahi → login pe bhej do
  if (!token) return <Navigate to="/login" replace />;
  return children;
};

export default ProtectedRoute;
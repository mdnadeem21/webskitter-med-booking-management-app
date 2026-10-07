// src/routes/RoleRoute.jsx
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

// Yeh component check karta hai: login wali role, route wali role se match karti hai?
const RoleRoute = ({ allowedRole, children }) => {
  const { user } = useSelector((state) => state.auth);

  // Login hai par role alag hai → uske apne dashboard pe bhej do
  // (patient → /admin khol ke baitha hai → usse /patient pe bhejo)
  if (user && user.role !== allowedRole) {
    return <Navigate to={`/${user.role}`} replace />;
  }
  return children;
};

export default RoleRoute;
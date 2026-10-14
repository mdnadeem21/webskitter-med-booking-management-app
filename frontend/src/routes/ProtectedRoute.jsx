// src/routes/ProtectedRoute.jsx
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  // Redux se token — loadAuth() se refresh pe bhi restore hota hai
  const { user, accessToken } = useSelector((state) => state.auth);

  
  if (!user || !accessToken) return <Navigate to="/login" replace />;
  return children;
};

export default ProtectedRoute;
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

const RoleRoute = ({ allowedRole, children }) => {
  const { user } = useSelector((state) => state.auth);

  
  if (user && user.role !== allowedRole) {
    return <Navigate to={`/${user.role}`} replace />;
  }
  return children;
};

export default RoleRoute;
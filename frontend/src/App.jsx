import { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./App.css";
import ProtectedRoute from "./routes/ProtectedRoute";
import RoleRoute from "./routes/RoleRoute";
import DashboardLayout from "./layouts/DashboardLayout";
import Login from "./pages/Login";
import Registration from "./pages/Registration";
import Home from "./pages/Home";

import PatientDashboard from "./pages/Patient/PatientDashboard";
import DoctorDashboard from "./pages/Doctor/DoctorDashboard";
import ReceptionistDashboard from "./pages/Receptionist/ReceptionistDashboard";
import AdminDashboard from "./pages/Admin/AdminDashboard";
import NotFound from "./pages/NotFound";

import BookAppointment from "./pages/Patient/BookAppointment";
import MyAppointments from "./pages/Patient/MyAppointments";
import Profile from "./pages/Patient/Profile";

import DoctorAppointments from "./pages/Doctor/Appointments";
import DoctorProfile from "./pages/Doctor/Profile";

import ReceptionistAppointments from "./pages/Receptionist/Appointments";
import ReceptionistPatients from "./pages/Receptionist/Patients";
import ReceptionistProfile from "./pages/Receptionist/Profile";

import AdminDoctors from "./pages/Admin/Doctors";
import AdminReceptionists from "./pages/Admin/Receptionists";
import AdminPatients from "./pages/Admin/Patients";
import AdminAppointments from "./pages/Admin/Appointments";
import AdminProfile from "./pages/Admin/Profile"




function App() {
  const [count, setCount] = useState(0);

  return (
    <BrowserRouter>
      <Routes>
        {/* PUBLIC */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Registration />} />
        <Route path="/" element={<Home />} />

        {/* Role dashboards — abhi dummy, Phase 5 me full pages */}
        <Route
          path="/patient"
          element={
            <ProtectedRoute>                          {/* 1. login hai? */}
              <RoleRoute allowedRole="patient">       {/* 2. role patient? */}
                <DashboardLayout />                   {/* 3. sidebar + content */}
              </RoleRoute>
            </ProtectedRoute>
          }
        >
          <Route index element={<PatientDashboard />} />
          <Route path="book" element={<BookAppointment/>}/>
          <Route path="appointments" element={<MyAppointments/>}/>
          <Route path="profile" element={<Profile/>}/>
        </Route>

        <Route path="/doctor" element={
            <ProtectedRoute>                          {/* 1. login hai? */}
            <RoleRoute allowedRole="doctor">          {/* 2. role patient? */}
              <DashboardLayout />                     {/* 3. sidebar + content */}
            </RoleRoute>
          </ProtectedRoute>
        }>
          <Route index element={<DoctorDashboard />} />
          <Route path="appointments" element={<DoctorAppointments />} />
          <Route path="profile" element={<DoctorProfile />} />
        </Route>

        <Route
          path="/receptionist"
          element={
            <ProtectedRoute>
              <RoleRoute allowedRole="receptionist">
                <DashboardLayout />
              </RoleRoute>
            </ProtectedRoute>
          }>
          <Route index element={<ReceptionistDashboard />} />
          <Route path="appointments" element={<ReceptionistAppointments />} />
          <Route path="patients" element={<ReceptionistPatients />} />
          <Route path="profile" element={<ReceptionistProfile />} />
        </Route>
        <Route path="/admin" element={
          <ProtectedRoute>
          <RoleRoute allowedRole="admin">
            <DashboardLayout />
          </RoleRoute>
        </ProtectedRoute>
        } >
          <Route index element={<AdminDashboard />} />
          <Route path="doctors" element={<AdminDoctors />} />
          <Route path="receptionists" element={<AdminReceptionists />} />
          <Route path="patients" element={<AdminPatients />} />
          <Route path="appointments" element={<AdminAppointments />} />
          <Route path="profile" element={<AdminProfile />} />
        </Route>

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

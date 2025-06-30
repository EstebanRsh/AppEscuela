import { lazy } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./components/Login";
import PublicRoutes from "./components/router/PublicRoutes";
import ProtectedRoutes from "./components/router/ProtectedRoutes";
import AdminRoutes from "./components/router/AdminRoutes";
import StudentRoutes from "./components/router/StudentRoutes";
import ProfessorRoutes from "./components/router/ProfessorRoutes";
import MainLayout from "./components/layouts/MainLayout";

function App() {
  // Componentes Generales
  const Dashboard = lazy(() => import("./views/Dashboard"));
  const Notifications = lazy(() => import("./views/Notifications"));
  const Profile = lazy(() => import("./views/Profile"));
  
  // Componentes de Administrador
  const UsersDashboard = lazy(() => import("./views/admin/UsersDashboard"));
  const Signup = lazy(() => import("./views/admin/Signup"));
  const UserEdit = lazy(() => import("./views/admin/UserEdit"));
  const PaymentsDashboard = lazy(() => import("./views/admin/PaymentsDashboard"));
  const PaymentAdd = lazy(() => import("./views/admin/PaymentAdd"));
  const PaymentEdit = lazy(() => import("./views/admin/PaymentEdit"));
  const CareersDashboard = lazy(() => import("./views/admin/CareersDashboard"));
  const CareerAdd = lazy(() => import("./views/admin/CareerAdd"));
  const CareerEdit = lazy(() => import("./views/admin/CareerEdit"));
  
  // Componentes de Alumno
  const MyPayments = lazy(() => import("./views/student/MyPayments"));
  const MyCareers = lazy(() => import("./views/student/MyCareers"));
  // Componentes de Profesor
  const ProfessorDashboard = lazy(() => import("./views/professor/ProfessorCareers"));

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<PublicRoutes />}>
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
        </Route>
        <Route element={<ProtectedRoutes />}>
          <Route element={<MainLayout />}>
            {/* Rutas Generales */}
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/notifications" element={<Notifications />} />
            
            {/* Rutas de Administrador */}
            <Route element={<AdminRoutes />}>
              <Route path="/users" element={<UsersDashboard />} />
              <Route path="/payments" element={<PaymentsDashboard />} />
              <Route path="/careers" element={<CareersDashboard />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/user/edit/:userId" element={<UserEdit />} />
              <Route path="/payment/add" element={<PaymentAdd />} />
              <Route path="/payment/edit/:paymentId" element={<PaymentEdit />}/>
              <Route path="/career/add" element={<CareerAdd />} />
              <Route path="/career/edit/:careerId" element={<CareerEdit />} />
            </Route>
            
            {/* Rutas de Estudiante */}
            <Route element={<StudentRoutes />}>
              <Route path="/my-payments" element={<MyPayments />} />
              <Route path="/my-careers" element={<MyCareers />} />
            </Route>
            <Route element={<ProfessorRoutes />}>
              <Route path="/professor/dashboard" element={<ProfessorDashboard />} />
            </Route>
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
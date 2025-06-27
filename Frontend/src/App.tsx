import { lazy } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./components/Login";
import PublicRoutes from "./components/router/PublicRoutes";
import ProtectedRoutes from "./components/router/ProtectedRoutes";
import AdminRoutes from "./components/router/AdminRoutes";
import MainLayout from "./components/layouts/MainLayout";

function App() {
  const Dashboard = lazy(() => import("./views/Dashboard"));
  const Notifications = lazy(() => import("./views/Notifications"));
  const Profile = lazy(() => import("./views/Profile"));
  const Signup = lazy(() => import("./views/Signup"));
  const UserEdit = lazy(() => import("./views/UserEdit"));
  const UsersDashboard = lazy(() => import("./views/UsersDashboard"));
  const PaymentsDashboard = lazy(() => import("./views/PaymentsDashboard"));
  const PaymentAdd = lazy(() => import("./views/PaymentAdd"));
  const PaymentEdit = lazy(() => import("./views/PaymentEdit"));
  const CareersDashboard = lazy(() => import("./views/CareersDashboard"));
  const CareerAdd = lazy(() => import("./views/CareerAdd"))

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<PublicRoutes />}>
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
        </Route>
        <Route element={<ProtectedRoutes />}>
          <Route element={<MainLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/careers" element={<CareersDashboard />} />
            <Route element={<AdminRoutes />}>
              <Route path="/signup" element={<Signup />} />
              <Route path="/user/edit/:userId" element={<UserEdit />} />
              <Route path="/users" element={<UsersDashboard />} />
              <Route path="/payments" element={<PaymentsDashboard />} />
              <Route path="/payment/add" element={<PaymentAdd />} />
              <Route path="/payment/edit/:paymentId"element={<PaymentEdit />}/></Route>
              <Route path="/career/add" element={<CareerAdd />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;

import { lazy } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ToastProvider } from "./components/common/ToastContext";

// Layouts
import PublicLayout from "./components/layouts/PublicLayout"; // El nuevo layout público
import MainLayout from "./components/layouts/MainLayout"; // El layout privado que ya tenías

// Guardianes de Rutas
import PublicRoutes from "./components/router/PublicRoutes";
import ProtectedRoutes from "./components/router/ProtectedRoutes";
import AdminRoutes from "./components/router/AdminRoutes";
import StudentRoutes from "./components/router/StudentRoutes";
import ProfessorRoutes from "./components/router/ProfessorRoutes";

// --- Componentes ---
const Login = lazy(() => import("./components/Login"));

// Vistas Públicas
const Home = lazy(() => import("./views/public/Home"));
const AboutUs = lazy(() => import("./views/public/AboutUs"));
const Contact = lazy(() => import("./views/public/Contact"));
const AcademicOffer = lazy(() => import("./views/public/AcademicOffer"));
const News = lazy(() => import("./views/public/News"));
const Gallery = lazy(() => import("./views/public/Gallery"));
const Faq = lazy(() => import("./views/public/Faq"));

// Vistas Privadas
const Dashboard = lazy(() => import("./views/Dashboard"));
const Notifications = lazy(() => import("./views/Notifications"));
const Profile = lazy(() => import("./views/Profile"));
// Vistas de Administración
const UsersDashboard = lazy(() => import("./views/admin/UsersDashboard"));
const Signup = lazy(() => import("./views/admin/Signup"));
const UserEdit = lazy(() => import("./views/admin/UserEdit"));
const PaymentsDashboard = lazy(() => import("./views/admin/PaymentsDashboard"));
const PaymentAdd = lazy(() => import("./views/admin/PaymentAdd"));
const PaymentEdit = lazy(() => import("./views/admin/PaymentEdit"));
const CareersDashboard = lazy(() => import("./views/admin/CareersDashboard"));
const CareerUserAssignment = lazy(
  () => import("./views/admin/CareerUserAssignment")
);
const CareerAdd = lazy(() => import("./views/admin/CareerAdd"));
const CareerEdit = lazy(() => import("./views/admin/CareerEdit"));
const SendMessage = lazy(() => import("./views/admin/SendMessage"));
// Vistas de Estudiante
const MyPayments = lazy(() => import("./views/student/MyPayments"));
const MyCareers = lazy(() => import("./views/student/MyCareers"));
const StudentSubjectsView = lazy(
  () => import("./views/student/StudentSubjectsView")
);
// Vistas de Profesor
const ProfessorCareersOverview = lazy(
  () => import("./views/professor/ProfessorCareersOverview")
);
const ProfessorSubjectsView = lazy(
  () => import("./views/professor/ProfessorSubjectsView")
);

function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <Routes>
          {/* --- SECCIÓN PÚBLICA --- */}
          {/* Todo lo que esté aquí dentro usará la barra de navegación pública */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/about-us" element={<AboutUs />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/academic-offer" element={<AcademicOffer />} />
            <Route path="/news" element={<News />} />
            <Route path="/gallery" element={<Gallery />} />
            <Route path="/faq" element={<Faq />} />

            {/* El Login es público, pero el guardián PublicRoutes lo oculta si ya iniciaste sesión */}
            <Route element={<PublicRoutes />}>
              <Route path="/login" element={<Login />} />
            </Route>
          </Route>

          {/* --- SECCIÓN PRIVADA (INTRANET) --- */}
          {/* Todo lo que esté aquí dentro requiere iniciar sesión y usará la barra de navegación privada */}
          <Route element={<ProtectedRoutes />}>
            <Route element={<MainLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/notifications" element={<Notifications />} />

              <Route path="/admin" element={<AdminRoutes />}>
                <Route path="users" element={<UsersDashboard />} />
                <Route path="users/signup" element={<Signup />} />
                <Route path="users/:userId/edit" element={<UserEdit />} />
                <Route path="payments" element={<PaymentsDashboard />} />
                <Route path="payments/add" element={<PaymentAdd />} />
                <Route
                  path="payments/:paymentId/edit"
                  element={<PaymentEdit />}
                />
                <Route path="careers" element={<CareersDashboard />} />
                <Route path="careers/add" element={<CareerAdd />} />
                <Route path="careers/:careerId/edit" element={<CareerEdit />} />
                <Route
                  path="careers/assign"
                  element={<CareerUserAssignment />}
                />
                <Route path="messages" element={<SendMessage />} />
                <Route
                  path="send-message/:recipientId"
                  element={<SendMessage />}
                />
              </Route>

              <Route path="/student" element={<StudentRoutes />}>
                <Route path="payments" element={<MyPayments />} />
                <Route path="careers" element={<MyCareers />} />
                <Route
                  path="career/:careerId/subjects"
                  element={<StudentSubjectsView />}
                />
              </Route>

              <Route path="/professor" element={<ProfessorRoutes />}>
                <Route path="careers" element={<ProfessorCareersOverview />} />
                <Route
                  path="career/:careerId/subjects"
                  element={<ProfessorSubjectsView />}
                />
              </Route>
            </Route>
          </Route>
        </Routes>
      </ToastProvider>
    </BrowserRouter>
  );
}

export default App;

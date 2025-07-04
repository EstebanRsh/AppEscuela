import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import InfoContainer from '../components/common/InfoContainer';

// Definimos un tipo para la información del usuario que necesitamos
type UserInfo = {
  first_name: string;
  type: 'administrador' | 'alumno' | 'profesor';
};

function Dashboard() {
  const [user, setUser] = useState<UserInfo | null>(null);

  useEffect(() => {
    const loggedInUser = JSON.parse(localStorage.getItem("user") || "null");
    setUser(loggedInUser);
  }, []);

  const isAdmin = user?.type === 'administrador';
  const isStudent = user?.type === 'alumno';
  const isProfessor = user?.type === 'profesor';

  // Componente reutilizable para las tarjetas de acceso rápido
  const DashboardCard = ({ to, icon, title, children }: { to: string; icon: string; title: string; children: React.ReactNode }) => (
    <div className="col-md-4 col-lg-4 mb-4">
      <Link to={to} className="text-decoration-none">
        <div className="card card-custom dashboard-card h-100">
          <div className="card-body text-center p-3 d-flex flex-column justify-content-center">
            <i className={`bi ${icon} display-6 text-warning`}></i>
            <h5 className="card-title mt-3">{title}</h5>
            <p className="card-text text-white-50">{children}</p>
          </div>
        </div>
      </Link>
    </div>
  );

  return (
    <InfoContainer>
      <div className="container mt-4">
        {/* Sección de Bienvenida */}
        <div className="p-3 mb-3 bg-dark-transparent rounded-3 shadow">
          <div className="container-fluid">
            <h1 className="display-7 fw-bold">
              <span className="text-warning">Bienvenido, {user?.first_name || 'a la plataforma'}</span>
            </h1>
            <p className="col-md-10 fs-4">
              Utiliza los accesos rápidos para navegar por las secciones principales del sistema.
            </p>
          </div>
        </div>

        {/* Tarjetas de Acceso Rápido */}
        <h2 className="mb-3">Accesos Rápidos</h2>
        <div className="row">
          {/* --- Tarjetas para Administradores --- */}
          {isAdmin && (
            <>
              <DashboardCard to="/admin/users" icon="bi-people-fill" title="Gestionar Usuarios">
                Añade, edita o elimina perfiles de usuarios.
              </DashboardCard>
              <DashboardCard to="/admin/payments" icon="bi-cash-coin" title="Gestionar Pagos">
                Registra y administra los pagos de los alumnos.
              </DashboardCard>
              <DashboardCard to="/admin/careers" icon="bi-diagram-3-fill" title="Gestionar Carreras">
                Administra las carreras ofrecidas por la institución.
              </DashboardCard>
               <DashboardCard to="/admin/messages" icon="bi-send-fill" title="Enviar Mensaje">
                Comunícate directamente con alumnos y profesores.
              </DashboardCard>
            </>
          )}

          {/* --- Tarjetas para Alumnos --- */}
          {isStudent && (
            <>
              <DashboardCard to="/student/payments" icon="bi-wallet2" title="Mis Pagos">
                Consulta tu historial de pagos y cuotas.
              </DashboardCard>
              <DashboardCard to="/student/careers" icon="bi-mortarboard-fill" title="Mis Carreras">
                Accede a las materias y material de estudio.
              </DashboardCard>
            </>
          )}

          {/* --- Tarjetas para Profesores --- */}
          {isProfessor && (
             <DashboardCard to="/professor/careers" icon="bi-person-video3" title="Carreras Asignadas">
                Gestiona las materias y consulta tus alumnos.
              </DashboardCard>
          )}

          {/* --- Tarjetas Comunes para todos los roles --- */}
          <DashboardCard to="/profile" icon="bi-person-circle" title="Mi Perfil">
            Actualiza tu información personal y de seguridad.
          </DashboardCard>
          <DashboardCard to="/notifications" icon="bi-bell-fill" title="Notificaciones">
            Revisa tus últimos avisos y mensajes importantes.
          </DashboardCard>
        </div>
      </div>
    </InfoContainer>
  );
}

export default Dashboard;
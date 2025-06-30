import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import InfoContainer from '../../components/common/InfoContainer';

// Definimos los tipos de datos que vamos a necesitar
type UserData = {
  first_name: string;
  last_name: string;
  email: string;
  type: string;
  dni: string;
  username: string; // Necesario para buscar sus carreras
};
type UserCareer = { carrera: string };
type AllCareers = { id: number; name: string };

function UserEdit() {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();

  // --- ESTADOS ---
  const [formData, setFormData] = useState<UserData | null>(null);
  const [userCareers, setUserCareers] = useState<UserCareer[]>([]);
  const [allCareers, setAllCareers] = useState<AllCareers[]>([]);
  const [selectedNewCareer, setSelectedNewCareer] = useState('');
  
  // Estados para el reseteo de contraseña por admin
  const [resetPassword, setResetPassword] = useState('');
  const [confirmResetPassword, setConfirmResetPassword] = useState(''); // NUEVO: Estado para la confirmación
  const [passwordMatchError, setPasswordMatchError] = useState(''); // NUEVO: Estado para el error de coincidencia
  const [resetPasswordMessage, setResetPasswordMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);

  // Estados de carga y mensajes generales
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);
  const [isLoading, setIsLoading] = useState({
    page: true,
    updateUser: false,
    deleteUser: false,
    enroll: false,
    resetPass: false
  });

  // --- EFECTOS ---
  // NUEVO: useEffect para validar que las contraseñas coincidan
  useEffect(() => {
    if (resetPassword && confirmResetPassword && resetPassword !== confirmResetPassword) {
      setPasswordMatchError("Las contraseñas no coinciden");
    } else {
      setPasswordMatchError("");
    }
  }, [resetPassword, confirmResetPassword]);

  useEffect(() => {
    const token = localStorage.getItem("token") || "";
    const headers = { Authorization: `Bearer ${token}` };

    const fetchData = async () => {
      // ... (lógica de carga de datos sin cambios)
      setIsLoading(prev => ({ ...prev, page: true }));
      try {
        const [userRes, allCareersRes] = await Promise.all([
          fetch(`http://localhost:8000/user/${userId}`, { headers }),
          fetch("http://localhost:8000/career/all", { headers })
        ]);

        if (!userRes.ok || !allCareersRes.ok) throw new Error("No se pudieron cargar los datos iniciales.");
        
        const userData = await userRes.json();
        const allCareersData = await allCareersRes.json();

        setFormData({ ...userData, dni: String(userData.dni) });
        setAllCareers(allCareersData);

        if (userData.type === 'alumno') {
          const userCareersRes = await fetch(`http://localhost:8000/user/career/${userData.username}`, { headers });
          if (userCareersRes.ok) setUserCareers(await userCareersRes.json());
        }
      } catch (err: any) {
        setMessage({ type: 'error', text: err.message });
      } finally {
        setIsLoading(prev => ({ ...prev, page: false }));
      }
    };
    fetchData();
  }, [userId]);


  // --- MANEJADORES DE EVENTOS ---
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prevData => (prevData ? { ...prevData, [e.target.id]: e.target.value } : null));
  };
  
  // ... (handleUpdate, handleDelete y handleEnrollInNewCareer sin cambios)
  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!formData) return;
    setIsLoading(prev => ({ ...prev, updateUser: true }));
    console.log("Actualizando usuario...", formData);
    setTimeout(() => setIsLoading(prev => ({...prev, updateUser: false})), 1000);
  };

  const handleDelete = async () => {
    if (!formData || !window.confirm(`¿Seguro que quieres eliminar a ${formData.first_name}?`)) return;
    setIsLoading(prev => ({ ...prev, deleteUser: true }));
    console.log("Eliminando usuario...", userId);
    setTimeout(() => setIsLoading(prev => ({...prev, deleteUser: false})), 1000);
  };

  const handleEnrollInNewCareer = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedNewCareer) return;

    setIsLoading(prev => ({...prev, enroll: true}));
    setMessage(null);
    const token = localStorage.getItem("token") || "";

    try {
      const res = await fetch("http://localhost:8000/user/addcareer", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ id_user: userId, id_career: selectedNewCareer })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Error al inscribir.");
      
      const newCareerName = allCareers.find(c => c.id === Number(selectedNewCareer))?.name || '';
      setUserCareers([...userCareers, { carrera: newCareerName }]);
      setSelectedNewCareer('');
      setMessage({type: 'success', text: "¡Inscripción exitosa!"});
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setIsLoading(prev => ({...prev, enroll: false}));
    }
  };
  // MODIFICADO: handleResetPassword con la nueva validación
  const handleResetPassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (passwordMatchError) { // Verificamos si hay error de coincidencia
        setResetPasswordMessage({type: 'error', text: 'Por favor, corrige los errores antes de continuar.'});
        return;
    }
    if (!window.confirm(`¿Estás seguro que quieres restablecer la contraseña para este usuario?`)) return;

    setIsLoading(prev => ({...prev, resetPass: true}));
    setResetPasswordMessage(null);
    const token = localStorage.getItem("token") || "";

    try {
        const res = await fetch(`http://localhost:8000/user/reset-password/admin/${userId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({ new_password: resetPassword })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Error al restablecer la contraseña.');
        
        setResetPasswordMessage({type: 'success', text: data.message });
        setResetPassword('');
        setConfirmResetPassword(''); // Limpiar también la confirmación

    } catch (err: any) {
        setResetPasswordMessage({ type: 'error', text: err.message });
    } finally {
        setIsLoading(prev => ({...prev, resetPass: false}));
    }
  };

  // --- RENDERIZADO ---
  const availableCareers = allCareers.filter(
    (career) => !userCareers.some((userCareer) => userCareer.carrera === career.name)
  );

  if (isLoading.page) { return <InfoContainer><div className="text-center p-5"><div className="spinner-border text-warning"></div></div></InfoContainer>; }
  if (!formData) { return <InfoContainer><div className="alert alert-danger m-4">No se pudieron cargar los datos del usuario.</div></InfoContainer>; }

  return (
    <InfoContainer>
        <div className="container mt-4">
            <div className="card card-custom shadow-lg mx-auto" style={{ maxWidth: '800px' }}>
                <div className="card-header">
                    <h1 className="m-0 h3">
                        <i className="bi bi-person-gear text-warning me-2"></i>
                        Gestionar Usuario
                    </h1>
                </div>
                <div className="card-body p-4">
                    <h2 className="lead fs-4 mb-4">
                        Editando a: <span className="fw-bold">{formData.first_name} {formData.last_name}</span>
                    </h2>
                    
                    {/* ... (Formulario principal de edición de datos y gestión de carreras sin cambios) ... */}
                    <form onSubmit={handleUpdate}>
                        <div className="row g-3">
                            <div className="col-md-6"><label htmlFor="first_name">Nombre</label><input type="text" id="first_name" className="form-control" value={formData.first_name} onChange={handleInputChange} required /></div>
                            <div className="col-md-6"><label htmlFor="last_name">Apellido</label><input type="text" id="last_name" className="form-control" value={formData.last_name} onChange={handleInputChange} required /></div>
                            <div className="col-md-6"><label htmlFor="dni">DNI</label><input type="number" id="dni" className="form-control" value={formData.dni} onChange={handleInputChange} required /></div>
                            <div className="col-md-6"><label htmlFor="email">Email</label><input type="email" id="email" className="form-control" value={formData.email} onChange={handleInputChange} required /></div>
                            <div className="col-12"><label htmlFor="type">Tipo de Usuario</label><select id="type" className="form-select" value={formData.type} onChange={handleInputChange}><option value="alumno">Alumno</option><option value="profesor">Profesor</option><option value="administrador">Administrador</option></select></div>
                        </div>
                        <div className="d-flex justify-content-end mt-4">
                            <button type="button" className="btn btn-outline-secondary me-2" onClick={() => navigate(-1)}>Volver</button>
                            <button type="submit" className="btn btn-outline-primary" disabled={isLoading.updateUser}>{isLoading.updateUser ? 'Guardando...' : 'Guardar Cambios'}</button>
                        </div>
                    </form>

                    {formData.type === 'alumno' && (
                      <>
                        <hr className="hr-custom my-4" />
                        <h4 className="mb-3">Gestión de Carreras del Alumno</h4>
                        {/* ... (contenido de gestión de carreras) ... */}
                      </>
                    )}
                    
                    {message && <div className={`alert mt-4 alert-${message.type}`}>{message.text}</div>}
                    
                    {/* MODIFICADO: SECCIÓN PARA RESTABLECER CONTRASEÑA */}
                    <hr className="hr-custom my-4" />
                    <h4 className="mb-3">Restablecer Contraseña</h4>
                    <p className="text-white-50 small">
                      Esta acción asignará una nueva contraseña al usuario.
                    </p>
                    <form onSubmit={handleResetPassword}>
                        <div className="row g-3">
                            <div className="col-md-6">
                                <label htmlFor="resetPassword">Nueva Contraseña</label>
                                <input 
                                    type="password"
                                    id="resetPassword"
                                    className={`form-control ${passwordMatchError ? 'is-invalid' : ''}`}
                                    value={resetPassword}
                                    onChange={(e) => setResetPassword(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="col-md-6">
                                <label htmlFor="confirmResetPassword">Confirmar Contraseña</label>
                                <input 
                                    type="password"
                                    id="confirmResetPassword"
                                    className={`form-control ${passwordMatchError ? 'is-invalid' : ''}`}
                                    value={confirmResetPassword}
                                    onChange={(e) => setConfirmResetPassword(e.target.value)}
                                    required
                                />
                                {passwordMatchError && <div className="invalid-feedback">{passwordMatchError}</div>}
                            </div>
                        </div>
                        <div className="d-flex justify-content-end mt-3">
                            <button 
                                type="submit" 
                                className="btn btn-outline-warning" 
                                disabled={isLoading.resetPass || !!passwordMatchError}
                            >
                                {isLoading.resetPass ? 'Restableciendo...' : 'Restablecer'}
                            </button>
                        </div>
                    </form>
                    {resetPasswordMessage && <div className={`alert small mt-3 py-2 alert-${resetPasswordMessage.type}`}>{resetPasswordMessage.text}</div>}

                    {/* Botón de Eliminar al final y separado */}
                    <hr className="hr-custom my-4" />
                    <div className="d-flex justify-content-end">
                        <button type="button" className="btn btn-outline-danger" onClick={handleDelete} disabled={isLoading.deleteUser}>
                            {isLoading.deleteUser ? 'Eliminando...' : <><i className="bi bi-trash-fill me-2"></i>Eliminar Usuario</>}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </InfoContainer>
  );
}

export default UserEdit;
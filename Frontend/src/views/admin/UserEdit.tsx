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

  // Estado para el formulario de datos del usuario
  const [formData, setFormData] = useState<UserData | null>(null);

  // --- NUEVOS ESTADOS para la sección de carreras ---
  const [userCareers, setUserCareers] = useState<UserCareer[]>([]);
  const [allCareers, setAllCareers] = useState<AllCareers[]>([]);
  const [selectedNewCareer, setSelectedNewCareer] = useState('');
  
  // Estados de carga y mensajes
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);
  const [isLoading, setIsLoading] = useState({ page: true, updateUser: false, deleteUser: false, enroll: false });

  // --- useEffect MEJORADO para cargar todos los datos necesarios ---
  useEffect(() => {
    const token = localStorage.getItem("token") || "";
    const headers = { Authorization: `Bearer ${token}` };

    const fetchData = async () => {
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prevData => (prevData ? { ...prevData, [e.target.id]: e.target.value } : null));
  };
  
  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!formData) return;
    setIsLoading(prev => ({ ...prev, updateUser: true }));
    // ... (el resto de tu lógica de handleUpdate se mantiene igual)
  };

  const handleDelete = async () => {
    if (!formData || !window.confirm(`¿Seguro que quieres eliminar a ${formData.first_name}?`)) return;
    setIsLoading(prev => ({ ...prev, deleteUser: true }));
    // ... (el resto de tu lógica de handleDelete se mantiene igual)
  };

  // --- NUEVA FUNCIÓN para inscribir al alumno ---
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

  // Filtramos las carreras para el dropdown de inscripción
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
                    <form onSubmit={handleUpdate}>
                        <div className="row g-3">
                            <div className="col-md-6"><label htmlFor="first_name">Nombre</label><input type="text" id="first_name" className="form-control" value={formData.first_name} onChange={handleInputChange} required /></div>
                            <div className="col-md-6"><label htmlFor="last_name">Apellido</label><input type="text" id="last_name" className="form-control" value={formData.last_name} onChange={handleInputChange} required /></div>
                            <div className="col-md-6"><label htmlFor="dni">DNI</label><input type="number" id="dni" className="form-control" value={formData.dni} onChange={handleInputChange} required /></div>
                            <div className="col-md-6"><label htmlFor="email">Email</label><input type="email" id="email" className="form-control" value={formData.email} onChange={handleInputChange} required /></div>
                            <div className="col-12"><label htmlFor="type">Tipo de Usuario</label><select id="type" className="form-select" value={formData.type} onChange={handleInputChange}><option value="alumno">Alumno</option><option value="profesor">Profesor</option><option value="administrador">Administrador</option></select></div>
                        </div>
                        {/* Botones para el formulario principal de edición de datos */}
                        <div className="d-flex justify-content-end mt-4">
                            <button type="button" className="btn btn-outline-secondary me-2" onClick={() => navigate(-1)}>Volver</button>
                            <button type="submit" className="btn btn-outline-primary" disabled={isLoading.updateUser}>{isLoading.updateUser ? 'Guardando...' : 'Guardar Cambios'}</button>
                        </div>
                    </form>

                    {/* --- [NUEVA SECCIÓN] Gestión de Carreras --- */}
                    {formData.type === 'alumno' && (
                      <>
                        <hr className="hr-custom my-4" />
                        <h4 className="mb-3">Gestión de Carreras del Alumno</h4>
                        <div className="row g-4">
                          <div className="col-md-6">
                            <h5>Carreras Inscritas ({userCareers.length})</h5>
                            {userCareers.length > 0 ? (
                              <ul className="list-group">{userCareers.map(c => <li key={c.carrera} className="list-group-item list-group-item-dark">{c.carrera}</li>)}</ul>
                            ) : (
                              <div className="alert alert-secondary">No está inscrito en ninguna carrera.</div>
                            )}
                          </div>
                          <div className="col-md-6">
                            <h5>Inscribir a Nueva Carrera</h5>
                            {availableCareers.length > 0 ? (
                                <form onSubmit={handleEnrollInNewCareer}>
                                    <div className="input-group">
                                        <select className="form-select" value={selectedNewCareer} onChange={e => setSelectedNewCareer(e.target.value)} required>
                                            <option value="" disabled>Seleccionar...</option>
                                            {availableCareers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                        </select>
                                        <button type="submit" className="btn btn-outline-info" disabled={isLoading.enroll}>{isLoading.enroll ? '...' : 'Inscribir'}</button>
                                    </div>
                                </form>
                            ) : (
                                <div className="alert alert-info">Este alumno ya está inscrito en todas las carreras disponibles.</div>
                            )}
                          </div>
                        </div>
                      </>
                    )}
                    
                    {message && <div className={`alert mt-4 alert-${message.type}`}>{message.text}</div>}
                    
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
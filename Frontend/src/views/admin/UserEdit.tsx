import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import InfoContainer from "../../components/common/InfoContainer";

// --- TIPOS DE DATOS ---
type UserDataType = {
  first_name: string;
  last_name: string;
  email: string;
  type: "alumno" | "profesor" | "administrador";
  dni: string;
  username: string;
};

type UserCareer = {
  carrera: string;
};

type AllCareers = {
  id: number;
  name: string;
};

function UserEdit() {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();

  // --- ESTADOS ---
  const [formData, setFormData] = useState<UserDataType>({
    first_name: "",
    last_name: "",
    email: "",
    type: "alumno",
    dni: "",
    username: ""
  });

  // Estados para la gestión de carreras
  const [userCareers, setUserCareers] = useState<UserCareer[]>([]);
  const [allCareers, setAllCareers] = useState<AllCareers[]>([]);
  const [selectedNewCareer, setSelectedNewCareer] = useState('');

  // Estados para el restablecimiento de contraseña
  const [resetPassword, setResetPassword] = useState('');
  const [confirmResetPassword, setConfirmResetPassword] = useState('');
  const [passwordMatchError, setPasswordMatchError] = useState('');
  const [resetPasswordMessage, setResetPasswordMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);

  // Estados para controlar la visibilidad de las secciones colapsables
  const [isCareersVisible, setIsCareersVisible] = useState(true);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  // Estado para mensajes generales
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Estado unificado para cargas
  const [isLoading, setIsLoading] = useState({
    page: true,
    update: false,
    delete: false,
    enroll: false,
    unenroll: null as number | null,
    resetPass: false
  });

  // --- EFECTOS ---
  useEffect(() => {
    const token = localStorage.getItem("token") || "";
    const headers = { Authorization: `Bearer ${token}` };

    const fetchData = async () => {
      setIsLoading(prev => ({ ...prev, page: true }));
      try {
        const userRes = await fetch(`http://localhost:8000/user/${userId}`, { headers });
        if (!userRes.ok) throw new Error((await userRes.json()).message || "Error al cargar el usuario.");
        
        const userData = await userRes.json();
        setFormData({ ...userData, dni: String(userData.dni) });
        
        const [allCareersRes, userCareersRes] = await Promise.all([
          fetch("http://localhost:8000/career/all", { headers }),
          fetch(`http://localhost:8000/user/career/${userData.username}`, { headers })
        ]);

        if (allCareersRes.ok) setAllCareers(await allCareersRes.json());
        if (userCareersRes.ok) setUserCareers(await userCareersRes.json());

      } catch (err: any) {
        setMessage({ type: "error", text: err.message });
      } finally {
        setIsLoading(prev => ({ ...prev, page: false }));
      }
    };
    fetchData();
  }, [userId]);

  useEffect(() => {
    setPasswordMatchError(
      resetPassword && confirmResetPassword && resetPassword !== confirmResetPassword 
      ? "Las contraseñas no coinciden" 
      : ""
    );
  }, [resetPassword, confirmResetPassword]);

  // --- MANEJADORES DE EVENTOS ---
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { id, value } = e.target;
    setFormData(prevData => ({ ...prevData, [id]: value }));
  };

  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(prev => ({ ...prev, update: true }));
    setMessage(null);
    const token = localStorage.getItem("token") || "";
    try {
      const response = await fetch(`http://localhost:8000/user/update/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ ...formData, dni: parseInt(formData.dni, 10) }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "Error al actualizar.");
      alert(result.message);
      navigate("/users");
    } catch (error: any) {
      setMessage({ type: "error", text: error.message });
    } finally {
      setIsLoading(prev => ({ ...prev, update: false }));
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`¿Seguro que quieres eliminar a ${formData.first_name}? Esta acción es irreversible.`)) return;
    setIsLoading(prev => ({ ...prev, delete: true }));
    setMessage(null);
    const token = localStorage.getItem("token") || "";
    try {
      const response = await fetch(`http://localhost:8000/user/delete/${userId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "Error al eliminar.");
      alert(result.message);
      navigate("/users");
    } catch (error: any) {
      setMessage({ type: "error", text: error.message });
    } finally {
      setIsLoading(prev => ({ ...prev, delete: false }));
    }
  };

  const handleEnroll = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedNewCareer) return;
    setIsLoading(prev => ({ ...prev, enroll: true }));
    setMessage(null);
    const token = localStorage.getItem("token") || "";
    try {
      const res = await fetch(`http://localhost:8000/users/${userId}/careers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ id: Number(selectedNewCareer) })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Error al inscribir.");
      const newCareerName = allCareers.find(c => c.id === Number(selectedNewCareer))?.name || '';
      setUserCareers([...userCareers, { carrera: newCareerName }]);
      setSelectedNewCareer('');
      setMessage({type: 'success', text: "¡Carrera asignada con éxito!"});
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setIsLoading(prev => ({ ...prev, enroll: false }));
    }
  };

  const handleUnenroll = async (careerNameToRemove: string) => {
    const careerToRemove = allCareers.find(c => c.name === careerNameToRemove);
    if (!careerToRemove || !window.confirm(`¿Quitar la carrera "${careerNameToRemove}" de este usuario?`)) return;
    setIsLoading(prev => ({ ...prev, unenroll: careerToRemove.id }));
    setMessage(null);
    const token = localStorage.getItem("token") || "";
    try {
        const res = await fetch(`http://localhost:8000/users/${userId}/careers/${careerToRemove.id}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Error al desinscribir.");
        setUserCareers(userCareers.filter(c => c.carrera !== careerNameToRemove));
        setMessage({type: 'success', text: "¡Carrera quitada con éxito!"});
    } catch (err: any) {
        setMessage({ type: 'error', text: err.message });
    } finally {
        setIsLoading(prev => ({ ...prev, unenroll: null }));
    }
  };

  const handleResetPassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (passwordMatchError) {
        setResetPasswordMessage({type: 'error', text: 'Las contraseñas no coinciden.'});
        return;
    }
    if (!window.confirm(`¿Restablecer la contraseña para este usuario?`)) return;
    setIsLoading(prev => ({ ...prev, resetPass: true }));
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
        setConfirmResetPassword('');
    } catch (err: any) {
        setResetPasswordMessage({ type: 'error', text: err.message });
    } finally {
        setIsLoading(prev => ({ ...prev, resetPass: false }));
    }
  };

  // --- RENDERIZADO ---
  if (isLoading.page) {
    return <InfoContainer><div className="text-center p-5"><div className="spinner-border text-warning"></div></div></InfoContainer>;
  }

  const availableCareers = allCareers.filter(c => !userCareers.some(uc => uc.carrera === c.name));

  return (
    <InfoContainer>
      <div className="container mt-4">
        <div className="card card-custom shadow-lg mx-auto" style={{ maxWidth: "800px" }}>
          <div className="card-header">
            <h1 className="m-0 h3"><i className="bi bi-pencil-square text-warning me-2"></i>Editando Perfil de Usuario</h1>
          </div>
          <div className="card-body p-4">
            <form onSubmit={handleUpdate} noValidate>
              <h2 className="lead fs-4 mb-4">Datos de: <span className="fw-bold">{formData.first_name} {formData.last_name}</span></h2>
              <div className="row g-3">
                <div className="col-md-6"><label htmlFor="first_name">Nombre</label><input type="text" id="first_name" className="form-control" value={formData.first_name} onChange={handleInputChange} required /></div>
                <div className="col-md-6"><label htmlFor="last_name">Apellido</label><input type="text" id="last_name" className="form-control" value={formData.last_name} onChange={handleInputChange} required /></div>
                <div className="col-md-6"><label htmlFor="dni">DNI</label><input type="number" id="dni" className="form-control" value={formData.dni} onChange={handleInputChange} required /></div>
                <div className="col-md-6"><label htmlFor="email">Email</label><input type="email" id="email" className="form-control" value={formData.email} onChange={handleInputChange} required /></div>
                <div className="col-12"><label htmlFor="type">Tipo de Usuario</label><select id="type" className="form-select" value={formData.type} onChange={handleInputChange}><option value="alumno">Alumno</option><option value="profesor">Profesor</option><option value="administrador">Administrador</option></select></div>
              </div>
              <div className="d-flex justify-content-end mt-4">
                <button type="submit" className="btn btn-outline-success" disabled={isLoading.update}>{isLoading.update && <span className="spinner-border spinner-border-sm me-2"></span>}Guardar Cambios</button>
              </div>
            </form>

            {/* SECCIÓN COLAPSABLE DE CARRERAS */}
            {(formData.type === 'alumno' || formData.type === 'profesor') && (
              <>
                <hr className="hr-custom my-4" />
                <div className="accordion-header" onClick={() => setIsCareersVisible(!isCareersVisible)} style={{cursor: 'pointer'}}>
                  <h4 className="mb-0 d-flex justify-content-between align-items-center">
                    Gestión de Carreras Asignadas
                    <i className={`bi ${isCareersVisible ? 'bi-chevron-up' : 'bi-chevron-down'}`}></i>
                  </h4>
                </div>
                <div className={`collapse ${isCareersVisible ? 'show' : ''} mt-3`}>
                  <div className="row g-4">
                    <div className="col-md-6">
                      <h5>Carreras Actuales ({userCareers.length})</h5>
                      {userCareers.length > 0 ? (
                        <ul className="list-group">{userCareers.map(c => <li key={c.carrera} className="list-group-item list-group-item-dark d-flex justify-content-between align-items-center">{c.carrera}<button className="btn btn-outline-danger btn-sm" onClick={() => handleUnenroll(c.carrera)} disabled={isLoading.unenroll === allCareers.find(ac => ac.name === c.carrera)?.id}>{isLoading.unenroll === allCareers.find(ac => ac.name === c.carrera)?.id ? <span className="spinner-border spinner-border-sm"></span> : <i className="bi bi-trash"></i>}</button></li>)}</ul>
                      ) : ( <div className="alert alert-secondary p-2">No tiene carreras asignadas.</div> )}
                    </div>
                    <div className="col-md-6">
                      <h5>Inscribir a una carrera</h5>
                      {availableCareers.length > 0 ? (
                        <form onSubmit={handleEnroll}>
                          <div className="input-group">
                            <select className="form-select" value={selectedNewCareer} onChange={e => setSelectedNewCareer(e.target.value)} required><option value="" disabled>Seleccionar...</option>{availableCareers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select>
                            <button type="submit" className="btn btn-outline-info" disabled={isLoading.enroll}>{isLoading.enroll ? '...' : 'Asignar'}</button>
                          </div>
                        </form>
                      ) : ( <div className="alert alert-info p-2">¡Ya está en todas las carreras!</div> )}
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* SECCIÓN COLAPSABLE DE CONTRASEÑA */}
            <hr className="hr-custom my-4" />
             <div className="accordion-header" onClick={() => setIsPasswordVisible(!isPasswordVisible)} style={{cursor: 'pointer'}}>
                <h4 className="mb-0 d-flex justify-content-between align-items-center">
                  Restablecer Contraseña
                  <i className={`bi ${isPasswordVisible ? 'bi-chevron-up' : 'bi-chevron-down'}`}></i>
                </h4>
             </div>
            <div className={`collapse ${isPasswordVisible ? 'show' : ''} mt-3`}>
              <form onSubmit={handleResetPassword}>
                  <div className="row g-3">
                      <div className="col-md-6"><label htmlFor="resetPassword">Nueva Contraseña</label><input type="password" id="resetPassword" className={`form-control ${passwordMatchError ? 'is-invalid' : ''}`} value={resetPassword} onChange={(e) => setResetPassword(e.target.value)} required /></div>
                      <div className="col-md-6"><label htmlFor="confirmResetPassword">Confirmar Contraseña</label><input type="password" id="confirmResetPassword" className={`form-control ${passwordMatchError ? 'is-invalid' : ''}`} value={confirmResetPassword} onChange={(e) => setConfirmResetPassword(e.target.value)} required />{passwordMatchError && <div className="invalid-feedback">{passwordMatchError}</div>}</div>
                  </div>
                  <div className="d-flex justify-content-end mt-3"><button type="submit" className="btn btn-outline-warning" disabled={isLoading.resetPass || !!passwordMatchError}>{isLoading.resetPass ? 'Restableciendo...' : 'Restablecer'}</button></div>
              </form>
              {resetPasswordMessage && <div className={`alert small mt-3 py-2 alert-${resetPasswordMessage.type}`}>{resetPasswordMessage.text}</div>}
            </div>


            {message && <div className={`alert mt-4 ${message.type === "success" ? "alert-success" : "alert-danger"}`}>{message.text}</div>}
            
            <hr className="hr-custom my-4" />
            <div className="d-flex justify-content-between mt-4">
              <button type="button" className="btn btn-outline-danger" onClick={handleDelete} disabled={isLoading.delete}>{isLoading.delete ? <span className="spinner-border spinner-border-sm me-2"></span> : <i className="bi bi-trash-fill me-2"></i>}Eliminar Usuario</button>
              <button type="button" className="btn btn-outline-secondary" onClick={() => navigate("/admin/users")}>Volver a Usuarios</button>
            </div>
          </div>
        </div>
      </div>
    </InfoContainer>
  );
}

export default UserEdit;
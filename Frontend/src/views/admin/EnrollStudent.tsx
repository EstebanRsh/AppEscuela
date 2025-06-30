import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import InfoContainer from '../../components/common/InfoContainer';

// Definimos los tipos de datos que vamos a manejar
type User = { id: number; first_name: string; last_name: string; };
type Career = { id: number; name: string; };

function EnrollStudent() {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    id_user: '',
    id_career: ''
  });
  
  const [users, setUsers] = useState<User[]>([]);
  const [careers, setCareers] = useState<Career[]>([]);
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);
  const [isLoading, setIsLoading] = useState({ page: true, submit: false });

  // Carga inicial de alumnos y carreras
  useEffect(() => {
    const token = localStorage.getItem("token") || "";
    const headers = { "Authorization": `Bearer ${token}` };

    const fetchData = async () => {
        setIsLoading(prev => ({...prev, page: true}));
        try {
            const [usersRes, careersRes] = await Promise.all([
                fetch("http://localhost:8000/users/all", { headers }),
                fetch("http://localhost:8000/career/all", { headers })
            ]);
            if (!usersRes.ok || !careersRes.ok) {
                throw new Error("No se pudieron cargar los datos de alumnos o carreras.");
            }
            const allUsers = await usersRes.json();
            const careersData = await careersRes.json();

            // Filtramos para mostrar solo alumnos en el desplegable
            setUsers(allUsers.filter((user: User & { type: string }) => user.type === 'alumno'));
            setCareers(careersData);
        } catch (err: any) {
            setMessage({ type: 'error', text: err.message });
        } finally {
            setIsLoading(prev => ({...prev, page: false}));
        }
    };
    fetchData();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleEnrollment = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(prev => ({...prev, submit: true}));
    setMessage(null);

    const token = localStorage.getItem("token") || "";
    const ENROLL_URL = "http://localhost:8000/user/addcareer";
    
    try {
        const res = await fetch(ENROLL_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}`},
            body: JSON.stringify({
                id_user: Number(formData.id_user),
                id_career: Number(formData.id_career)
            })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Ocurrió un error al realizar la inscripción.");
        
        alert("¡Inscripción realizada con éxito!");
        navigate('/users'); // Volvemos al dashboard de usuarios
    } catch (err: any) {
        setMessage({ type: 'error', text: err.message });
    } finally {
        setIsLoading(prev => ({...prev, submit: false}));
    }
  };

  if (isLoading.page) {
    return (
        <InfoContainer>
            <div className="container mt-4 text-center">
                <div className="spinner-border text-warning" role="status"></div>
            </div>
        </InfoContainer>
    );
  }
  
  return (
    <InfoContainer>
      <div className="container mt-4">
        <div className="card card-custom shadow-lg mx-auto" style={{ maxWidth: '800px' }}>
            <div className="card-header">
                <h1 className="m-0 h3">
                    <i className="bi bi-person-check-fill text-warning me-2"></i>
                    Inscribir Alumno a Carrera
                </h1>
            </div>
            <div className="card-body p-4">
                <p className="lead mb-4">
                    Selecciona un alumno y la carrera a la que deseas inscribirlo.
                </p>
                <form onSubmit={handleEnrollment}>
                    <div className="row g-3">
                        <div className="col-12">
                            <label htmlFor="id_user" className="form-label">Alumno</label>
                            <select id="id_user" className="form-select" value={formData.id_user} onChange={handleInputChange} required>
                                <option value="" disabled>Seleccione un alumno...</option>
                                {users.map(user => (<option key={user.id} value={user.id}>{user.first_name} {user.last_name}</option>))}
                            </select>
                        </div>
                        <div className="col-12">
                            <label htmlFor="id_career" className="form-label">Carrera</label>
                            <select id="id_career" className="form-select" value={formData.id_career} onChange={handleInputChange} required>
                                <option value="" disabled>Seleccione una carrera...</option>
                                {careers.map(career => (<option key={career.id} value={career.id}>{career.name}</option>))}
                            </select>
                        </div>
                    </div>

                    {message && <div className={`alert mt-4 alert-${message.type}`}>{message.text}</div>}

                    <div className="d-flex justify-content-end mt-4 form-actions-responsive">
                        <button type="button" className="btn btn-outline-secondary me-2" onClick={() => navigate(-1)}>Cancelar</button>
                        <button type="submit" className="btn btn-outline-success" disabled={isLoading.submit}>
                            {isLoading.submit ? <><span className="spinner-border spinner-border-sm me-2"></span>Inscribiendo...</> : 'Confirmar Inscripción'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
      </div>
    </InfoContainer>
  );
}

export default EnrollStudent;
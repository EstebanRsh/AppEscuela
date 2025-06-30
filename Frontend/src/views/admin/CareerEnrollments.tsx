import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import InfoContainer from '../../components/common/InfoContainer';

type Career = { id: number; name: string; };
type Student = { id: number; first_name: string; last_name: string; email: string; dni: number; };

function CareerEnrollments() {
  const navigate = useNavigate();
  const [careers, setCareers] = useState<Career[]>([]);
  const [selectedCareer, setSelectedCareer] = useState<string>('');
  const [enrolledStudents, setEnrolledStudents] = useState<Student[]>([]);
  const [careerName, setCareerName] = useState<string>('');
  const [isLoading, setIsLoading] = useState({ careers: true, students: false });
  const [message, setMessage] = useState<string | null>(null);
  
  // Carga la lista de carreras al iniciar
  useEffect(() => {
    const fetchCareers = async () => {
      const token = localStorage.getItem("token") || "";
      try {
        const res = await fetch("http://localhost:8000/career/all", { headers: { Authorization: `Bearer ${token}` } });
        if (!res.ok) throw new Error("No se pudieron cargar las carreras.");
        const data = await res.json();
        setCareers(data);
      } catch (err: any) {
        setMessage(err.message);
      } finally {
        setIsLoading(prev => ({...prev, careers: false}));
      }
    };
    fetchCareers();
  }, []);

  // Busca los estudiantes cuando se selecciona una carrera
  const handleCareerChange = async (careerId: string) => {
    if (!careerId) {
      setEnrolledStudents([]);
      setCareerName('');
      return;
    }
    
    setSelectedCareer(careerId);
    setIsLoading(prev => ({...prev, students: true}));
    setMessage(null);
    const token = localStorage.getItem("token") || "";

    try {
        const res = await fetch(`http://localhost:8000/career/${careerId}/students`, { headers: { Authorization: `Bearer ${token}` } });
        if (!res.ok) {
            const errData = await res.json();
            throw new Error(errData.message || "Error al buscar alumnos.");
        }
        const data = await res.json();
        setCareerName(data.career);
        setEnrolledStudents(data.students);
    } catch (err: any) {
        setMessage(err.message);
        setEnrolledStudents([]);
    } finally {
        setIsLoading(prev => ({...prev, students: false}));
    }
  };

  return (
    <InfoContainer>
      <div className="container mt-4">
        <div className="card card-custom shadow-lg">
          <div className="card-header">
            <h1 className="m-0 h3">
              <i className="bi bi-search text-warning me-2"></i>
              Consultar Alumnos por Carrera
            </h1>
          </div>
          <div className="card-body">
            <p className="lead mb-4">Selecciona una carrera para ver la lista de alumnos inscritos.</p>
            <div className="mb-3">
              <select 
                className="form-select" 
                value={selectedCareer} 
                onChange={(e) => handleCareerChange(e.target.value)}
                disabled={isLoading.careers}
              >
                <option value="">
                  {isLoading.careers ? "Cargando carreras..." : "--- Selecciona una carrera ---"}
                </option>
                {careers.map(career => (
                  <option key={career.id} value={career.id}>{career.name}</option>
                ))}
              </select>
            </div>
            <hr className="hr-custom" />

            {isLoading.students ? (
              <div className="text-center py-4"><div className="spinner-border text-warning"></div></div>
            ) : (
              selectedCareer && (
                <div>
                  <h4 className="mb-3">Alumnos en <span className="text-warning">{careerName}</span> ({enrolledStudents.length})</h4>
                  {message && <div className="alert alert-danger">{message}</div>}
                  {enrolledStudents.length > 0 ? (
                    <div className="table-responsive">
                      <table className="table table-hover align-middle table-responsive-cards">
                        <thead><tr><th>Nombre</th><th>Apellido</th><th>Email</th><th>DNI</th></tr></thead>
                        <tbody>
                          {enrolledStudents.map(student => (
                            <tr key={student.id}>
                              <td data-label="Nombre">{student.first_name}</td>
                              <td data-label="Apellido">{student.last_name}</td>
                              <td data-label="Email">{student.email}</td>
                              <td data-label="DNI">{student.dni}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="alert alert-secondary">No hay alumnos inscritos en esta carrera.</div>
                  )}
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </InfoContainer>
  );
}

export default CareerEnrollments;
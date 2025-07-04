import { useState, useEffect  } from 'react';
import { useNavigate } from 'react-router-dom';
import InfoContainer from '../../components/common/InfoContainer';
import { toast } from 'react-toastify';

type Career = {
  id: number;
  name: string;
};
function CareerAdd() {
  const navigate = useNavigate();
  const [careerName, setCareerName] = useState('');
  const [existingCareers, setExistingCareers] = useState<Career[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchCareers = async () => {
      const token = localStorage.getItem("token") || "";
      try {
        const res = await fetch("http://localhost:8000/career/all", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) {
          // No mostramos un toast aquí para no ser intrusivos, 
          // la validación del backend funcionará como respaldo.
          console.error("No se pudieron cargar las carreras para validación.");
          return;
        }
        const data = await res.json();
        setExistingCareers(data);
      } catch (err) {
        console.error("Error al cargar carreras:", err);
      }
    };
    fetchCareers();
  }, []);

  const handleAddCareer = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!careerName.trim()) {
      toast.error("El nombre de la carrera no puede estar vacío.");
      return;
    }
        const isDuplicate = existingCareers.some(
      (career) => career.name.toLowerCase() === careerName.trim().toLowerCase()
    );

    if (isDuplicate) {
      toast.error("Ya existe una carrera con ese nombre.");
      return;
    }
    setIsLoading(true);
    const token = localStorage.getItem("token") || "";
    try {
        const response = await fetch("http://localhost:8000/career/add", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ name: careerName })
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || "Error al añadir la carrera.");
        }

       toast.success(result.message);
        navigate('/admin/careers');

    } catch (err: any) {
        toast.error(err.message);
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <InfoContainer>
      <div className="container mt-4">
        <div className="card card-custom shadow-lg mx-auto" style={{ maxWidth: '700px' }}>
            <div className="card-header">
                <h1 className="m-0 h3">
                    <i className="bi bi-plus-circle-dotted text-warning me-2"></i>
                    Añadir Nueva Carrera
                </h1>
            </div>
            <div className="card-body p-4">
                <p className="lead mb-4">
                    Introduce el nombre de la nueva carrera que se ofrecerá en la institución.
                </p>
                <form onSubmit={handleAddCareer}>
                    <div className="mb-3">
                        <label htmlFor="careerName" className="form-label">Nombre de la Carrera</label>
                        <input
                            type="text"
                            id="careerName"
                            className="form-control"
                            value={careerName}
                            onChange={(e) => setCareerName(e.target.value)}
                            placeholder="Ej: Tecnicatura Universitaria en Programación"
                            required
                        />
                    </div>
                    <div className="d-flex justify-content-end mt-4">
                        <button type="button" className="btn btn-outline-secondary me-2" onClick={() => navigate('/admin/careers')}>
                            Cancelar
                        </button>
                        <button type="submit" className="btn btn-outline-success" disabled={isLoading}>
                            {isLoading ? (
                                <>
                                    <span className="spinner-border spinner-border-sm me-2" aria-hidden="true"></span>
                                    Guardando...
                                </>
                            ) : 'Guardar Carrera'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
      </div>
    </InfoContainer>
  );
}

export default CareerAdd;
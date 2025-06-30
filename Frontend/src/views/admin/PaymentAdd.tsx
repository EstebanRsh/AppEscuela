import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import InfoContainer from '../../components/common/InfoContainer';

// Tipos para los datos
type User = { id: number; first_name: string; last_name: string; };
type Career = { id: number; name: string; };

function PaymentAdd() {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    id_user: '',
    id_career: '',
    amount: '',
    affected_month: ''
  });
  
  const [users, setUsers] = useState<User[]>([]);
  const [careers, setCareers] = useState<Career[]>([]);
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);
  const [isLoading, setIsLoading] = useState({ page: true, submit: false });

  // Carga inicial de usuarios y carreras
  useEffect(() => {
    const token = localStorage.getItem("token") || "";
    const headers = { "Authorization": `Bearer ${token}` };

    const fetchData = async () => {
        try {
            const [usersRes, careersRes] = await Promise.all([
                fetch("http://localhost:8000/users/all", { headers }),
                fetch("http://localhost:8000/career/all", { headers })
            ]);
            if (!usersRes.ok || !careersRes.ok) throw new Error("No se pudieron cargar los datos para el formulario.");

            const allUsers = await usersRes.json();
            const careersData = await careersRes.json();

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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleAddPayment = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(prev => ({...prev, submit: true}));
    setMessage(null);

    const token = localStorage.getItem("token") || "";
    const ADD_PAYMENT_URL = "http://localhost:8000/payment/add";
    
    try {
        const res = await fetch(ADD_PAYMENT_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}`},
            body: JSON.stringify({
                ...formData,
                amount: Number(formData.amount),
                id_user: Number(formData.id_user),
                id_career: Number(formData.id_career)
            })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Ocurrió un error al registrar el pago.");
        
        alert("Pago registrado con éxito.");
        navigate('/payments');
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
                    <i className="bi bi-cash-stack text-warning me-2"></i>
                    Registrar Nuevo Pago
                </h1>
            </div>
            <div className="card-body p-4">
                <p className="lead mb-4">
                    Completa los campos para registrar un nuevo pago en el sistema.
                </p>
                <form onSubmit={handleAddPayment}>
                    <div className="row g-3">
                        <div className="col-md-6">
                            <label htmlFor="id_user" className="form-label">Alumno</label>
                            <select id="id_user" className="form-select" value={formData.id_user} onChange={handleInputChange} required>
                                <option value="">Seleccione un alumno</option>
                                {users.map(user => (<option key={user.id} value={user.id}>{user.first_name} {user.last_name}</option>))}
                            </select>
                        </div>
                        <div className="col-md-6">
                            <label htmlFor="id_career" className="form-label">Carrera</label>
                            <select id="id_career" className="form-select" value={formData.id_career} onChange={handleInputChange} required>
                                <option value="">Seleccione una carrera</option>
                                {careers.map(career => (<option key={career.id} value={career.id}>{career.name}</option>))}
                            </select>
                        </div>
                        <div className="col-md-6">
                            <label htmlFor="amount" className="form-label">Monto (ARS)</label>
                            <input type="number" id="amount" className="form-control" value={formData.amount} onChange={handleInputChange} required />
                        </div>
                        <div className="col-md-6">
                            <label htmlFor="affected_month" className="form-label">Mes Afectado</label>
                            <input type="date" id="affected_month" className="form-control" value={formData.affected_month} onChange={handleInputChange} required />
                        </div>
                    </div>

                    {message && <div className={`alert mt-4 alert-${message.type}`}>{message.text}</div>}

                    <div className="d-flex justify-content-end mt-4">
                        <button type="button" className="btn btn-outline-secondary me-2" onClick={() => navigate('/payments')}>Cancelar</button>
                        <button type="submit" className="btn btn-outline-success" disabled={isLoading.submit}>
                            {isLoading.submit ? <><span className="spinner-border spinner-border-sm me-2"></span>Registrando...</> : 'Añadir Pago'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
      </div>
    </InfoContainer>
  );
}

export default PaymentAdd;
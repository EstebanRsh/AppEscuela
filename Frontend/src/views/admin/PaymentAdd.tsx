// Archivo: Frontend/src/views/admin/PaymentAdd.tsx

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import InfoContainer from '../../components/common/InfoContainer';

// --- TIPOS DE DATOS ---
type User = { 
  id: number; 
  first_name: string; 
  last_name: string; 
  username: string;
  type: string;
};

type Career = { 
  id: number; 
  name: string; 
};

type UserCareerResponse = {
  carrera: string;
};

function PaymentAdd() {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    id_user: '',
    id_career: '',
    amount: '',
    affected_month: '',
    affected_year: new Date().getFullYear().toString()
  });
  
  const [users, setUsers] = useState<User[]>([]);
  const [allCareers, setAllCareers] = useState<Career[]>([]);
  const [userEnrolledCareers, setUserEnrolledCareers] = useState<Career[]>([]);
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);
  const [isLoading, setIsLoading] = useState({ 
    page: true, 
    submit: false,
    careers: false
  });

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
            const allUsersData = await usersRes.json();
            const allCareersData = await careersRes.json();
            setUsers(allUsersData.filter((user: User) => user.type === 'alumno'));
            setAllCareers(allCareersData);
        } catch (err: any) {
            setMessage({ type: 'error', text: err.message });
        } finally {
            setIsLoading(prev => ({...prev, page: false}));
        }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const fetchUserCareers = async () => {
        if (!formData.id_user) {
            setUserEnrolledCareers([]);
            setFormData(prev => ({ ...prev, id_career: '' }));
            return;
        }
        setIsLoading(prev => ({ ...prev, careers: true }));
        const selectedUser = users.find(u => u.id === Number(formData.id_user));
        if (!selectedUser) {
            setIsLoading(prev => ({ ...prev, careers: false }));
            return;
        }
        const token = localStorage.getItem("token") || "";
        try {
            const res = await fetch(`http://localhost:8000/user/career/${selectedUser.username}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!res.ok) throw new Error("No se pudieron cargar las carreras del alumno.");
            const userCareersResponse: UserCareerResponse[] = await res.json();
            const enrolledCareers = allCareers.filter(ac => userCareersResponse.some(uc => uc.carrera === ac.name));
            setUserEnrolledCareers(enrolledCareers);
            if (enrolledCareers.length === 1) {
                setFormData(prev => ({ ...prev, id_career: String(enrolledCareers[0].id) }));
            }
        } catch (err: any) {
            setMessage({ type: 'error', text: err.message });
        } finally {
            setIsLoading(prev => ({ ...prev, careers: false }));
        }
    };
    fetchUserCareers();
  }, [formData.id_user, users, allCareers]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { id, value } = e.target;
    if (id === 'id_user') {
      setFormData(prev => ({ ...prev, id_user: value, id_career: '' }));
    } else {
      setFormData(prev => ({ ...prev, [id]: value }));
    }
  };

  const handleAddPayment = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(prev => ({...prev, submit: true}));
    setMessage(null);

    const fullAffectedDate = `${formData.affected_year}-${formData.affected_month.padStart(2, '0')}-01`;

    const paymentDataToSend = {
      id_user: Number(formData.id_user),
      id_career: Number(formData.id_career),
      amount: Number(formData.amount),
      affected_month: fullAffectedDate
    };

    const token = localStorage.getItem("token") || "";
    const ADD_PAYMENT_URL = "http://localhost:8000/payment/add";
    
    try {
        const res = await fetch(ADD_PAYMENT_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}`},
            body: JSON.stringify(paymentDataToSend)
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Ocurrió un error al registrar el pago.");
        
        alert("Pago registrado con éxito.");
        navigate('/admin/payments');
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

  const isSubmitDisabled = isLoading.submit || isLoading.careers || !formData.id_user || !formData.id_career || !formData.amount || !formData.affected_month || !formData.affected_year;
  const months = [
      { value: '1', label: 'Enero' }, { value: '2', label: 'Febrero' }, { value: '3', label: 'Marzo' },
      { value: '4', label: 'Abril' }, { value: '5', label: 'Mayo' }, { value: '6', label: 'Junio' },
      { value: '7', label: 'Julio' }, { value: '8', label: 'Agosto' }, { value: '9', label: 'Septiembre' },
      { value: '10', label: 'Octubre' }, { value: '11', label: 'Noviembre' }, { value: '12', label: 'Diciembre' }
  ];
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => (currentYear - i).toString());

  return (
    <InfoContainer>
      <div className="container mt-4">
        <div className="card card-custom shadow-lg mx-auto" style={{ maxWidth: '800px' }}>
            <div className="card-header">
                <h1 className="m-0 h3"><i className="bi bi-cash-stack text-warning me-2"></i>Registrar Nuevo Pago</h1>
            </div>
            <div className="card-body p-4">
                <p className="lead mb-4">Completa los campos para registrar un nuevo pago en el sistema.</p>
                <form onSubmit={handleAddPayment}>
                    <div className="row g-3">
                        <div className="col-md-6">
                            <label htmlFor="id_user" className="form-label">1. Alumno</label>
                            <select id="id_user" className="form-select" value={formData.id_user} onChange={handleInputChange} required>
                                <option value="">Seleccione un alumno...</option>
                                {users.map(user => (<option key={user.id} value={user.id}>{user.first_name} {user.last_name}</option>))}
                            </select>
                        </div>
                        <div className="col-md-6">
                            <label htmlFor="id_career" className="form-label">2. Carrera</label>
                            {isLoading.careers ? (
                                <div className="text-center pt-2"><div className="spinner-border spinner-border-sm text-warning"></div></div>
                            ) : userEnrolledCareers.length > 1 ? (
                                <select id="id_career" className="form-select" value={formData.id_career} onChange={handleInputChange} required disabled={!formData.id_user}>
                                    <option value="">Seleccione una carrera...</option>
                                    {userEnrolledCareers.map(career => (<option key={career.id} value={career.id}>{career.name}</option>))}
                                </select>
                            ) : userEnrolledCareers.length === 1 ? (
                                <input type="text" className="form-control" value={userEnrolledCareers[0].name} readOnly disabled/>
                            ) : (
                                <select className="form-select" disabled><option>{formData.id_user ? "El alumno no tiene carreras" : "Seleccione un alumno"}</option></select>
                            )}
                        </div>
                        <div className="col-md-6">
                            <label htmlFor="amount" className="form-label">Monto (ARS)</label>
                            <input type="number" id="amount" className="form-control" value={formData.amount} onChange={handleInputChange} required />
                        </div>
                        <div className="col-md-6">
                            <label className="form-label">Mes Afectado</label>
                            <div className="input-group">
                                <select id="affected_month" className="form-select" value={formData.affected_month} onChange={handleInputChange} required>
                                    <option value="">Mes...</option>
                                    {months.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                                </select>
                                <select id="affected_year" className="form-select" value={formData.affected_year} onChange={handleInputChange} required>
                                    {years.map(y => <option key={y} value={y}>{y}</option>)}
                                </select>
                            </div>
                        </div>
                    </div>

                    {message && <div className={`alert mt-4 alert-${message.type}`}>{message.text}</div>}

                    <div className="d-flex justify-content-end mt-4">
                        <button type="button" className="btn btn-outline-secondary me-2" onClick={() => navigate('/admin/payments')}>Cancelar</button>
                        <button type="submit" className="btn btn-outline-success" disabled={isSubmitDisabled}>
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
import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import InfoContainer from '../../components/common/InfoContainer';
// Tipos para los datos que cargaremos en los desplegables
type User = { id: number; username: string; first_name: string; last_name: string; };
type Career = { id: number; name: string; };

function PaymentAdd() {
  const navigate = useNavigate();
  
  // Estados para guardar las listas de usuarios y carreras
  const [users, setUsers] = useState<User[]>([]);
  const [careers, setCareers] = useState<Career[]>([]);
  const [message, setMessage] = useState<string | null>(null);

  // Refs para los campos del formulario
  const userRef = useRef<HTMLSelectElement>(null);
  const careerRef = useRef<HTMLSelectElement>(null);
  const amountRef = useRef<HTMLInputElement>(null);
  const monthRef = useRef<HTMLInputElement>(null);

  // useEffect para cargar usuarios y carreras al montar el componente
  useEffect(() => {
    const token = localStorage.getItem("token") || "";
    const headers = { "Authorization": `Bearer ${token}` };

    // Cargar usuarios (alumnos)
    fetch("http://localhost:8000/users/all", { headers })
      .then(res => res.json())
      .then(data => {
        // Filtramos para quedarnos solo con los alumnos
        const studentUsers = data.filter((user: User & { type: string }) => user.type === 'alumno');
        setUsers(studentUsers);
      });

    // Cargar carreras
    fetch("http://localhost:8000/career/all", { headers })
      .then(res => res.json())
      .then(data => setCareers(data));
  }, []);

  const handleAddPayment = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage(null);

    const paymentData = {
      id_user: parseInt(userRef.current?.value || '0'),
      id_career: parseInt(careerRef.current?.value || '0'),
      amount: parseInt(amountRef.current?.value || '0'),
      affected_month: monthRef.current?.value,
    };

    if (!paymentData.id_user || !paymentData.id_career || !paymentData.amount || !paymentData.affected_month) {
      setMessage("Todos los campos son obligatorios.");
      return;
    }

    const token = localStorage.getItem("token") || "";
    const ADD_PAYMENT_URL = "http://localhost:8000/payment/add";
    
    fetch(ADD_PAYMENT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(paymentData)
    })
    .then(res => res.json())
    .then(data => {
      alert(data.message || "Pago registrado con éxito.");
      navigate('/payments');
    })
    .catch(err => {
      console.error("Error al añadir pago:", err);
      setMessage(err.message || "Ocurrió un error.");
    });
  };

  return (
  <InfoContainer>
    <div className="container mt-4">
      {/* Sección de título, similar al dashboard */}
      <h1>
        <span className="text-warning">Registrar Nuevo Pago</span>
      </h1>
      <p className="lead">
        Completa los siguientes campos para registrar un nuevo pago.
      </p>
      <hr
        className="my-4"
        style={{ borderColor: "rgba(255, 255, 255, 0.5)" }}
      />

      <div className="card p-4 shadow-lg">
        {/* Se eliminó el <h2> aquí ya que ahora es parte del h1 anterior */}
        <form onSubmit={handleAddPayment}>
          <div className="mb-3">
            <label htmlFor="user" className="form-label">Alumno</label>
            <select id="user" className="form-select" ref={userRef} required>
              <option value="">Seleccione un alumno</option>
              {users.map(user => (
                <option key={user.id} value={user.id}>
                  {user.first_name} {user.last_name}
                </option>
              ))}
            </select>
          </div>
          <div className="mb-3">
            <label htmlFor="career" className="form-label">Carrera</label>
            <select id="career" className="form-select" ref={careerRef} required>
              <option value="">Seleccione una carrera</option>
              {careers.map(career => (
                <option key={career.id} value={career.id}>{career.name}</option>
              ))}
            </select>
          </div>
          <div className="mb-3">
            <label htmlFor="amount" className="form-label">Monto</label>
            <input type="number" id="amount" className="form-control" ref={amountRef} required />
          </div>
          <div className="mb-3">
            <label htmlFor="month" className="form-label">Mes Afectado</label>
            <input type="date" id="month" className="form-control" ref={monthRef} required />
          </div>

          <button type="submit" className="btn btn-primary">Añadir Pago</button>
          <button type="button" className="btn btn-secondary ms-2" onClick={() => navigate('/payments')}>Cancelar</button>
          {message && <div className="alert alert-danger mt-3">{message}</div>}
        </form>
      </div>
    </div>
  </InfoContainer>
);
}

export default PaymentAdd;
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import InfoContainer from "../../components/common/InfoContainer";
import { toast } from "react-toastify";

// Define la estructura de un objeto User para tipado estricto.
type User = {
  id: number;
  first_name: string;
  last_name: string;
  username: string;
  type: string;
};

// Define la estructura de un objeto Career.
type Career = {
  id: number;
  name: string;
};

// Define la estructura de la respuesta de la API para las carreras de un usuario.
type UserCareerResponse = {
  carrera: string;
};

// Define la estructura de los datos del formulario de pago.
type PaymentFormData = {
  id_user: number;
  id_career: number;
  amount: number;
  affected_month: string;
  affected_year: string;
};

// Componente reutilizable para mostrar un toast de confirmación con botones.
const ConfirmationToast = ({ onConfirm, onCancel, message }: { onConfirm: () => void; onCancel: () => void; message: string; }) => (
  <div>
    <p className="mb-2">{message}</p>
    <div className="d-flex justify-content-end gap-2">
      <button onClick={onConfirm} className="btn btn-sm btn-danger">Confirmar</button>
      <button onClick={onCancel} className="btn btn-sm btn-secondary">Cancelar</button>
    </div>
  </div>
);

function PaymentEdit() {
  const { paymentId } = useParams<{ paymentId: string }>();
  const navigate = useNavigate();

  const [formData, setFormData] = useState<PaymentFormData | null>(null);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [userEnrolledCareers, setUserEnrolledCareers] = useState<Career[]>([]);
  const [isLoading, setIsLoading] = useState({
    page: true,
    update: false,
    delete: false,
    careers: false
  });

  useEffect(() => {
    const token = localStorage.getItem("token") || "";
    const headers = { Authorization: `Bearer ${token}` };

    const fetchData = async () => {
      setIsLoading(prev => ({...prev, page: true}));
      try {
        const [paymentRes, usersRes, careersRes] = await Promise.all([
          fetch(`http://localhost:8000/payment/${paymentId}`, { headers }),
          fetch("http://localhost:8000/users/all", { headers }),
          fetch("http://localhost:8000/career/all", { headers }),
        ]);

        if (!paymentRes.ok || !usersRes.ok || !careersRes.ok) {
          throw new Error("Error al cargar los datos necesarios para la edición.");
        }

        const paymentData = await paymentRes.json();
        const usersData = await usersRes.json();
        const allCareersData = await careersRes.json();
        const date = new Date(paymentData.affected_month);
        const month = (date.getUTCMonth() + 1).toString();
        const year = date.getUTCFullYear().toString();

        setFormData({
            ...paymentData,
            affected_month: month,
            affected_year: year
        });
        
        setAllUsers(usersData);

        const studentOfPayment = usersData.find((u: User) => u.id === paymentData.id_user);
        if (studentOfPayment) {
            setIsLoading(prev => ({...prev, careers: true}));
            const userCareersRes = await fetch(`http://localhost:8000/user/career/${studentOfPayment.username}`, { headers });
            if(userCareersRes.ok) {
                const userCareersResponse: UserCareerResponse[] = await userCareersRes.json();
                const enrolled = allCareersData.filter((ac: Career) => userCareersResponse.some(uc => uc.carrera === ac.name));
                setUserEnrolledCareers(enrolled);
            }
            setIsLoading(prev => ({...prev, careers: false}));
        }
      } catch (err: any) {
        toast.error(err.message);
        navigate("/admin/payments");
      } finally {
        setIsLoading((prev) => ({ ...prev, page: false }));
      }
    };
    fetchData();
  }, [paymentId, navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => (prev ? { ...prev, [id]: value } : null));
  };

  const handleUpdatePayment = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!formData) return;

    setIsLoading((prev) => ({ ...prev, update: true }));
    const fullAffectedDate = `${formData.affected_year}-${formData.affected_month.padStart(2, '0')}-01`;
    const token = localStorage.getItem("token") || "";

    try {
      const res = await fetch(`http://localhost:8000/payment/update/${paymentId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          id_user: Number(formData.id_user),
          id_career: Number(formData.id_career),
          amount: Number(formData.amount),
          affected_month: fullAffectedDate,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Error al actualizar.");

      toast.success(data.message);
      navigate("/admin/payments");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsLoading((prev) => ({ ...prev, update: false }));
    }
  };

  const handleDeletePayment = () => {
    const performDelete = async () => {
      setIsLoading((prev) => ({ ...prev, delete: true }));
      const token = localStorage.getItem("token") || "";
      try {
        const res = await fetch(`http://localhost:8000/payment/delete/${paymentId}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Error al eliminar.");
        toast.success(data.message);
        navigate("/admin/payments");
      } catch (err: any) {
        toast.error(err.message);
      } finally {
        setIsLoading((prev) => ({ ...prev, delete: false }));
      }
    };
    
    toast.warning(
      <ConfirmationToast
        message="¿Estás seguro? Esta acción no se puede deshacer."
        onConfirm={() => { toast.dismiss(); performDelete(); }}
        onCancel={() => toast.dismiss()}
      />, { autoClose: false, closeOnClick: false }
    );
  };

  if (isLoading.page) {
    return (
      <InfoContainer><div className="container mt-4 text-center"><div className="spinner-border text-warning"></div></div></InfoContainer>
    );
  }

  if (!formData) {
    return (
      <InfoContainer><div className="container mt-4"><div className="alert alert-danger">No se pudieron cargar los datos del pago. Por favor, vuelve a intentarlo.</div></div></InfoContainer>
    );
  }
  
  const studentName = allUsers.find(u => u.id === formData.id_user)?.first_name + ' ' + allUsers.find(u => u.id === formData.id_user)?.last_name;
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
        <div className="card card-custom shadow-lg mx-auto" style={{ maxWidth: "800px" }}>
          <div className="card-header"><h1 className="m-0 h3"><i className="bi bi-pencil-square text-warning me-2"></i>Editando Registro de Pago</h1></div>
          <div className="card-body p-4">
            <p className="lead mb-4">Modifica los campos necesarios para actualizar este pago.</p>
            <form onSubmit={handleUpdatePayment} noValidate>
              <div className="row g-3">
                <div className="col-md-6">
                  <label htmlFor="id_user" className="form-label">Alumno</label>
                  <input type="text" id="id_user" className="form-control" value={studentName || ''} readOnly disabled />
                </div>
                <div className="col-md-6">
                  <label htmlFor="id_career" className="form-label">Carrera</label>
                  {isLoading.careers ? (
                      <div className="text-center pt-2"><div className="spinner-border spinner-border-sm text-warning"></div></div>
                  ) : (
                    <select id="id_career" className="form-select" value={formData.id_career} onChange={handleInputChange} required>
                        {userEnrolledCareers.map((career) => (<option key={career.id} value={career.id}>{career.name}</option>))}
                    </select>
                  )}
                </div>
                <div className="col-md-6">
                  <label htmlFor="amount" className="form-label">Monto (ARS)</label>
                  <input type="number" id="amount" className="form-control" value={formData.amount} onChange={handleInputChange} required/>
                </div>
                <div className="col-md-6">
                  <label className="form-label">Mes Afectado</label>
                  <div className="input-group">
                      <select id="affected_month" className="form-select" value={formData.affected_month} onChange={handleInputChange} required>
                          {months.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                      </select>
                      <select id="affected_year" className="form-select" value={formData.affected_year} onChange={handleInputChange} required>
                          {years.map(y => <option key={y} value={y}>{y}</option>)}
                      </select>
                  </div>
                </div>
              </div>

              <div className="d-flex justify-content-between mt-4 form-actions-responsive">
                <button type="submit" className="btn btn-outline-success" disabled={isLoading.update}>
                  {isLoading.update && <span className="spinner-border spinner-border-sm me-2"></span>}
                  Guardar Cambios
                </button>
                <div className="d-flex">
                  <button type="button" className="btn btn-outline-secondary me-2" onClick={() => navigate("/admin/payments")}>Cancelar</button>
                  <button type="button" className="btn btn-outline-danger" onClick={handleDeletePayment} disabled={isLoading.delete}>
                    {isLoading.delete ? <span className="spinner-border spinner-border-sm"></span> : <><i className="bi bi-trash-fill me-2"></i>Eliminar</>}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </InfoContainer>
  );
}

export default PaymentEdit;
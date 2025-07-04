import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import InfoContainer from "../../components/common/InfoContainer";
//import { Toast, ToastContainer } from "react-bootstrap";
import { toast } from "react-toastify";

function Signup() {
  const navigate = useNavigate();

  // Usamos estados para manejar los campos del formulario
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    confirmPassword: "",
    firstname: "",
    lastname: "",
    dni: "",
    email: "",
    type: "alumno",
  });

  const [passwordError, setPasswordError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  //const [showToast, setShowToast] = useState(false);

  // Valida que las contraseñas coincidan mientras se escribe
  useEffect(() => {
    if (
      formData.password &&
      formData.confirmPassword &&
      formData.password !== formData.confirmPassword
    ) {
      setPasswordError("Las contraseñas no coinciden");
    } else {
      setPasswordError("");
    }
  }, [formData.password, formData.confirmPassword]);

  // Maneja los cambios en cualquier input del formulario
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const { dni, ...textFields } = formData;
    const allFieldsFilled =
      Object.values(textFields).every((field) => field.trim() !== "") &&
      dni.trim() !== "";

    if (!allFieldsFilled) {
      toast.error("Todos los campos son obligatorios.");
      return;
    }
    if (passwordError) {
      toast.error("Por favor, corrige los errores antes de continuar."); // 3. Usar toast
      return;
    }

    setIsLoading(true);
    const { confirmPassword, ...signupData } = formData;
    const token = localStorage.getItem("token") || "";

    try {
      const response = await fetch("http://localhost:8000/users/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...signupData,
          dni: parseInt(signupData.dni),
        }),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || "Ocurrió un error en el registro.");
      }

      toast.success(result.message || "Usuario registrado con éxito."); // 4. Usar toast para éxito
      setFormData({
        username: "",
        password: "",
        confirmPassword: "",
        firstname: "",
        lastname: "",
        dni: "",
        email: "",
        type: "alumno",
      });
    } catch (error: any) {
      toast.error(error.message); // 5. Usar toast para error
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <InfoContainer>
      <div className="container mt-4">
        <div
          className="card card-custom shadow-lg mx-auto"
          style={{ maxWidth: "800px" }}
        >
          <div className="card-header">
            <h1 className="m-0 h3">
              <i className="bi bi-person-plus-fill text-warning me-2"></i>
              Registrar Nuevo Usuario
            </h1>
          </div>
          <div className="card-body p-4">
            <p className="lead mb-4">
              Completa el formulario para crear una nueva cuenta en el sistema.
            </p>
            <form onSubmit={handleSignup} noValidate>
              <div className="row g-3">
                <div className="col-md-6">
                  <label htmlFor="firstname">Nombre</label>
                  <input
                    type="text"
                    className="form-control"
                    id="firstname"
                    value={formData.firstname}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="col-md-6">
                  <label htmlFor="lastname">Apellido</label>
                  <input
                    type="text"
                    className="form-control"
                    id="lastname"
                    value={formData.lastname}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="col-md-6">
                  <label htmlFor="username">Usuario</label>
                  <input
                    type="text"
                    className="form-control"
                    id="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="col-md-6">
                  <label htmlFor="dni">DNI</label>
                  <input
                    type="number"
                    className="form-control"
                    id="dni"
                    value={formData.dni}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="col-12">
                  <label htmlFor="email">Email</label>
                  <input
                    type="email"
                    className="form-control"
                    id="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="col-md-6">
                  <label htmlFor="password">Contraseña</label>
                  <input
                    type="password"
                    className={`form-control ${
                      passwordError ? "is-invalid" : ""
                    }`}
                    id="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="col-md-6">
                  <label htmlFor="confirmPassword">Confirmar Contraseña</label>
                  <input
                    type="password"
                    className={`form-control ${
                      passwordError ? "is-invalid" : ""
                    }`}
                    id="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    required
                  />
                  {passwordError && (
                    <div className="invalid-feedback">{passwordError}</div>
                  )}
                </div>
                <div className="col-12">
                  <label htmlFor="type">Tipo de Usuario</label>
                  <select
                    className="form-select"
                    id="type"
                    value={formData.type}
                    onChange={handleInputChange}
                  >
                    <option value="alumno">Alumno</option>
                    <option value="profesor">Profesor</option>
                  </select>
                </div>
              </div>

              <div className="d-flex justify-content-end mt-4">
                <button
                  type="button"
                  className="btn btn-outline-secondary me-2"
                  onClick={() => navigate(-1)}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn btn-outline-success"
                  disabled={isLoading || !!passwordError}
                >
                  {isLoading ? (
                    <>
                      <span
                        className="spinner-border spinner-border-sm me-2"
                        role="status"
                        aria-hidden="true"
                      ></span>
                      Registrando...
                    </>
                  ) : (
                    "Registrar Usuario"
                  )}
                </button>
              </div>

              {/* Sistema por defecto para mostrar los mensajes
                    {message && (
                        <div className={`alert mt-3 ${message.type === 'success' ? 'alert-success' : 'alert-danger'}`}>
                            {message.text}
                        </div>
                    )}*/}
            </form>
          </div>
        </div>
      </div>
    </InfoContainer>
  );
}

export default Signup;

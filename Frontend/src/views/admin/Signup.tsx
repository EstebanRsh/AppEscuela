import { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import InfoContainer from '../../components/common/InfoContainer';

function Signup() {
  const BACKEND_IP = "localhost";
  const BACKEND_PORT = "8000";
  const ENDPOINT = "users/add";
  const SIGNUP_URL = `http://${BACKEND_IP}:${BACKEND_PORT}/${ENDPOINT}`;

  const userInputRef = useRef<HTMLInputElement>(null);
  const passInputRef = useRef<HTMLInputElement>(null);
  const firstNameInputRef = useRef<HTMLInputElement>(null);
  const lastNameInputRef = useRef<HTMLInputElement>(null);
  const dniInputRef = useRef<HTMLInputElement>(null);
  const emailInputRef = useRef<HTMLInputElement>(null);
  const typeSelectRef = useRef<HTMLSelectElement>(null);
  const confirmPassInputRef = useRef<HTMLInputElement>(null);
  
  const [message, setMessage] = useState<string | null>(null);
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const clearForm = () => {
    if (userInputRef.current) userInputRef.current.value = "";
    if (passInputRef.current) passInputRef.current.value = "";
    if (firstNameInputRef.current) firstNameInputRef.current.value = "";
    if (lastNameInputRef.current) lastNameInputRef.current.value = "";
    if (dniInputRef.current) dniInputRef.current.value = "";
    if (emailInputRef.current) emailInputRef.current.value = "";
    if (typeSelectRef.current) typeSelectRef.current.value = "alumno";
    if (confirmPassInputRef.current) confirmPassInputRef.current.value = "";
    setPassword("");
    setConfirmPassword("");
  };

  function handleSignup(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (password !== confirmPassword) {
      setMessage("Las contraseñas no coinciden.");
      return;
    }
    setMessage(null);

    const username = userInputRef.current?.value ?? "";
    const firstname = firstNameInputRef.current?.value ?? "";
    const lastname = lastNameInputRef.current?.value ?? "";
    const dni = parseInt(dniInputRef.current?.value ?? "0");
    const email = emailInputRef.current?.value ?? "";
    const type = typeSelectRef.current?.value ?? "alumno";
    const token = localStorage.getItem("token") || "";
    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    myHeaders.append("Authorization", `Bearer ${token}`);
    
    // Enviamos el 'password' desde el estado, que ahora sí está actualizado
    const raw = JSON.stringify({
      username,
      password, 
      firstname,
      lastname,
      dni,
      type,
      email,
    });

    const requestOptions = { method: "POST", headers: myHeaders, body: raw };

    fetch(SIGNUP_URL, requestOptions)
      .then((response) => {
        if (!response.ok) {
          return response.json().then((errorInfo) => {
            throw new Error(errorInfo.message || "Ocurrió un error");
          });
        }
        return response.json();
      })
      .then((data) => {
        setMessage(data.message || "Usuario registrado con éxito.");
        clearForm();
      })
      .catch((error) => {
        console.error("Error en el registro:", error);
        setMessage(error.message);
      });
  }

  useEffect(() => {
    if (password && confirmPassword && password !== confirmPassword) {
      setPasswordError("Las contraseñas no coinciden");
    } else {
      setPasswordError("");
    }
  }, [password, confirmPassword]);

  return (
  <InfoContainer>
    <div className="container mt-4">
      {/* Sección del título, similar al dashboard */}
      <h1>
        <span className="text-warning">Registrar Nuevo Usuario</span>
      </h1>
      <p className="lead">
        Completa el formulario para crear una nueva cuenta de usuario.
      </p>
      <hr
        className="my-4"
        style={{ borderColor: "rgba(255, 255, 255, 0.5)" }}
      />

      <div className="card p-4 shadow-lg">
        {/* Se eliminó el <h2> aquí ya que ahora es parte del h1 anterior */}
        <form onSubmit={handleSignup}>
          <div className="row">
            <div className="col-md-6 mb-3">
              <label htmlFor="inputUser" className="form-label">
                Usuario
              </label>
              <input type="text" className="form-control" id="inputUser" ref={userInputRef} required />
            </div>
            <div className="col-md-6 mb-3">
              <label htmlFor="inputPassword">Contraseña</label>
              <input
                type="password"
                className={`form-control ${passwordError ? "is-invalid" : ""}`}
                id="inputPassword"
                ref={passInputRef}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>
          <div className="row">
            <div className="col-md-6 mb-3">
              <label htmlFor="inputFirstName">Nombre</label>
              <input type="text" className="form-control" id="inputFirstName" ref={firstNameInputRef} required />
            </div>
            <div className="col-md-6 mb-3">
              <label htmlFor="inputLastName">Apellido</label>
              <input type="text" className="form-control" id="inputLastName" ref={lastNameInputRef} required />
            </div>
          </div>
          <div className="row">
            <div className="col-md-6 mb-3">
              <label htmlFor="inputDni">DNI</label>
              <input type="number" className="form-control" id="inputDni" ref={dniInputRef} required />
            </div>
            <div className="col-md-6 mb-3">
              <label htmlFor="inputConfirmPassword">Confirmar Contraseña</label>
              <input
                type="password"
                className={`form-control ${passwordError ? "is-invalid" : ""}`}
                id="inputConfirmPassword"
                ref={confirmPassInputRef}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
              {passwordError && (
                <div className="invalid-feedback">{passwordError}</div>
              )}
            </div>
          </div>
          <div className="row">
            <div className="col-md-6 mb-3">
              <label htmlFor="inputEmail">Email</label>
              <input type="email" className="form-control" id="inputEmail" ref={emailInputRef} required />
            </div>
            <div className="col-md-6 mb-3">
              <label htmlFor="selectType">Tipo de Usuario</label>
              <select className="form-select" id="selectType" ref={typeSelectRef}>
                <option value="alumno">Alumno</option>
                <option value="profesor">Profesor</option>
                <option value="administrador">Administrador</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={!!passwordError}
          >
            Registrar
          </button>

          {message && <span className="ms-3">{message}</span>}
        </form>
      </div>
    </div>
  </InfoContainer>
);
}

export default Signup;

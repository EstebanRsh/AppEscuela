import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

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

  const [message, setMessage] = useState<string | null>(null);
  const navigate = useNavigate();

  function handleSignup(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const username = userInputRef.current?.value ?? "";
    const password = passInputRef.current?.value ?? "";
    const firstname = firstNameInputRef.current?.value ?? "";
    const lastname = lastNameInputRef.current?.value ?? "";
    const dni = parseInt(dniInputRef.current?.value ?? "0");
    const email = emailInputRef.current?.value ?? "";
    const type = typeSelectRef.current?.value ?? "alumno";

    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    const raw = JSON.stringify({
      username,
      password,
      firstname,
      lastname,
      dni,
      type,
      email,
    });

    const requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: raw,
    };

    fetch(SIGNUP_URL, requestOptions)
      .then((respond) => respond.json())
      .then((data) => {
        setMessage(data);
        // Redirigir o mostrar un mensaje de éxito/error
      })
      .catch((error) => {
        console.log("error", error);
        setMessage("Error al registrar el usuario.");
      });
  }

  return (
    <div className="container mt-4">
      <div className="card p-4 shadow-lg">
        <h2 className="text-center mb-4">Registrar Nuevo Usuario</h2>
        <form onSubmit={handleSignup}>
          <div className="row">
            <div className="col-md-6 mb-3">
              <label htmlFor="inputUser" className="form-label">
                Usuario
              </label>
              <input
                type="text"
                className="form-control"
                id="inputUser"
                ref={userInputRef}
                required
              />
            </div>
            <div className="col-md-6 mb-3">
              <label htmlFor="inputPassword">Contraseña</label>
              <input
                type="password"
                className="form-control"
                id="inputPassword"
                ref={passInputRef}
                required
              />
            </div>
          </div>
          <div className="row">
            <div className="col-md-6 mb-3">
              <label htmlFor="inputFirstName">Nombre</label>
              <input
                type="text"
                className="form-control"
                id="inputFirstName"
                ref={firstNameInputRef}
                required
              />
            </div>
            <div className="col-md-6 mb-3">
              <label htmlFor="inputLastName">Apellido</label>
              <input
                type="text"
                className="form-control"
                id="inputLastName"
                ref={lastNameInputRef}
                required
              />
            </div>
          </div>
          <div className="row">
            <div className="col-md-6 mb-3">
              <label htmlFor="inputDni">DNI</label>
              <input
                type="number"
                className="form-control"
                id="inputDni"
                ref={dniInputRef}
                required
              />
            </div>
            <div className="col-md-6 mb-3">
              <label htmlFor="inputEmail">Email</label>
              <input
                type="email"
                className="form-control"
                id="inputEmail"
                ref={emailInputRef}
                required
              />
            </div>
          </div>
          <div className="mb-3">
            <label htmlFor="selectType">Tipo de Usuario</label>
            <select
              className="form-select"
              id="selectType"
              ref={typeSelectRef}
            >
              <option value="alumno">Alumno</option>
              <option value="profesor">Profesor</option>
              <option value="administrador">Administrador</option>
            </select>
          </div>

          <button type="submit" className="btn btn-primary">
            Registrar
          </button>
          {message && <span className="ms-3">{message}</span>}
        </form>
      </div>
    </div>
  );
}

export default Signup;
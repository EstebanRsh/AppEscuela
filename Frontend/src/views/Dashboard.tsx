import InfoContainer from '../components/common/InfoContainer'; 
function Dashboard() {
  return (
    <InfoContainer>
      <h1>
        <span className="text-warning">Bienvenido al Dashboard</span>
      </h1>
      <p className="lead">
        Este es tu panel de control principal. Desde aquí podrás acceder a todas
        las funcionalidades según tu rol.
      </p>
      <hr
        className="my-4"
        style={{ borderColor: "rgba(255, 255, 255, 0.5)" }}
      />
    </InfoContainer>
  );
}

export default Dashboard;

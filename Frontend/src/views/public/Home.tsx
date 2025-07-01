import InfoContainer from '../../components/common/InfoContainer';

function Home() {
  return (
    <InfoContainer>
      <div className="container mt-5 text-center">
        <h1 className="display-3 text-warning">Bienvenido a App Escuela</h1>
        <p className="lead">La plataforma para gestionar tu vida académica.</p>
      </div>
    </InfoContainer>
  );
}
export default Home;
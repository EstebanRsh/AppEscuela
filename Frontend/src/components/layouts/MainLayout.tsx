import { Suspense } from "react";
import { Outlet } from "react-router-dom";
import Navbar from "../layouts/Navbar";
import Footer from "../layouts/Footer"; 

function MainLayout() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />
      <main style={{ flex: 1, paddingTop: '70px' }}>
        <Suspense fallback={<div>Cargando...</div>}>
          <Outlet />
        </Suspense>
      </main>
    </div>
  );
}

export default MainLayout;
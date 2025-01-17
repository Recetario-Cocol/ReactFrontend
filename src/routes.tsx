import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './module/contexts/AuthContext';
import Login from './module/usuarios/components/login';
import UnidadGrilla from './module/unidad/components/UnidadGrilla';
import ProductoGrilla from './module/producto/components/ProductoGrilla';
import RecetaGrilla from './module/receta/components/RecetaGrilla';
import { ReactNode } from 'react';
import Home from './module/core/components/Home';

interface PrivateRouteProps {
  children: ReactNode;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }  
  return <>{children}</>;
};

export default function AppRoutes() {
  return (
    <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/Home" element={<PrivateRoute><Home/></PrivateRoute>} />
        <Route path="/Unidades" element={<PrivateRoute><UnidadGrilla /></PrivateRoute>} />
        <Route path="/Paquetes" element={<PrivateRoute><ProductoGrilla /></PrivateRoute>} />
        <Route path="/Recetas" element={<PrivateRoute><RecetaGrilla /></PrivateRoute>} />
        <Route path="*" element={<Login />} />
    </Routes>
  );
}
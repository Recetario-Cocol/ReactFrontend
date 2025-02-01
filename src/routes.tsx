import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './module/contexts/AuthContext';
import Login from './module/usuarios/components/login';
import UnidadGrilla from './module/unidad/components/UnidadGrilla';
import ProductoGrilla from './module/producto/components/ProductoGrilla';
import RecetaGrilla from './module/receta/components/RecetaGrilla';
import { ReactNode } from 'react';
import Home from './module/core/components/Home';
import UsuariosGrilla from './module/usuarios/components/UsuariosGrilla';
import { PermisosProvider, usePermisos } from './module/contexts/Permisos';

interface PrivateRouteProps {
  children: ReactNode;
  asAdmin?: Boolean;
  requiredPermission?: string[];
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children, asAdmin = false, requiredPermission }) => {
  const { isAuthenticated, isAdmin, hasPermission } = useAuth();
  const userHasPermission = requiredPermission?.some(permission => hasPermission(permission)) || false;
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  if (asAdmin && !isAdmin) {
    return <Navigate to="/Home" replace />;
  }
  if (requiredPermission && !userHasPermission) {
    return <Navigate to="/Home" replace />;
  }
  return <>{children}</>;
};


function PrivateRoutes() {
  const { VIEW_PAQUETE, VIEW_RECETA, VIEW_UNIDAD } = usePermisos();
  return (
    <Routes>
      <Route path="/Home" element={<PrivateRoute><Home /></PrivateRoute>} />
      <Route path="/Unidades" element={<PrivateRoute requiredPermission={[VIEW_UNIDAD]}><UnidadGrilla /></PrivateRoute>} />
      <Route path="/Paquetes" element={<PrivateRoute requiredPermission={[VIEW_PAQUETE]}><ProductoGrilla /></PrivateRoute>} />
      <Route path="/Recetas" element={<PrivateRoute requiredPermission={[VIEW_RECETA]}><RecetaGrilla /></PrivateRoute>} />
      <Route path="/Usuarios" element={<PrivateRoute asAdmin><UsuariosGrilla /></PrivateRoute>} />
    </Routes>
  );
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/login" element={<Login />} />
      <Route path="/*" element={<PermisosProvider><PrivateRoutes /></PermisosProvider>}/>
      <Route path="*" element={<Login />} />
    </Routes>
  );
}

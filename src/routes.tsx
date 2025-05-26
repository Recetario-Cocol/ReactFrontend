import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./module/contexts/AuthContext";
import Login from "./module/usuarios/components/login";
import UnidadGrilla from "./module/unidad/components/UnidadGrilla";
import ProductoGrilla from "./module/producto/components/ProductoGrilla";
import RecetaGrilla from "./module/receta/components/RecetaGrilla";
import { ReactNode } from "react";
import Home from "./module/core/components/Home";
import UsuariosGrilla from "./module/usuarios/components/UsuariosGrilla";
import { PermisosProvider } from "./module/contexts/Permisos";
import UpdatePassword from "./module/usuarios/components/updatePassword";

interface PrivateRouteProps {
  children: ReactNode;
  asAdmin?: boolean;
  requiredPermission?: string[];
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({
  children,
  asAdmin = false,
  requiredPermission,
}) => {
  const { isAuthenticated, isAdmin, hasPermission } = useAuth();
  const userHasPermission =
    requiredPermission?.some((permission) => hasPermission(permission)) || false;
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

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/login" element={<Login />} />
      <Route path="/updatePassword" element={<UpdatePassword />} />
      <Route
        path="/Home"
        element={
          <PermisosProvider>
            <PrivateRoute>
              <Home />
            </PrivateRoute>
          </PermisosProvider>
        }
      />
      <Route
        path="/Unidades"
        element={
          <PermisosProvider>
            <PrivateRoute requiredPermission={["view_unidad"]}>
              <UnidadGrilla />
            </PrivateRoute>
          </PermisosProvider>
        }
      />
      <Route
        path="/Productos"
        element={
          <PermisosProvider>
            <PrivateRoute requiredPermission={["view_producto"]}>
              <ProductoGrilla />
            </PrivateRoute>
          </PermisosProvider>
        }
      />
      <Route
        path="/Recetas"
        element={
          <PermisosProvider>
            <PrivateRoute requiredPermission={["view_receta"]}>
              <RecetaGrilla />
            </PrivateRoute>
          </PermisosProvider>
        }
      />
      <Route
        path="/Usuarios"
        element={
          <PermisosProvider>
            <PrivateRoute asAdmin>
              <UsuariosGrilla />
            </PrivateRoute>
          </PermisosProvider>
        }
      />
      <Route path="*" element={<Login />} />
    </Routes>
  );
}

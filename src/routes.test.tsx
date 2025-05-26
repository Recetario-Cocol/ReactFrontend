import { render, screen, cleanup } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import AppRoutes from "./routes";
import * as AuthContext from "./module/contexts/AuthContext";
import * as PermisosContext from "./module/contexts/Permisos";

// Mocks para componentes
jest.mock("./module/usuarios/components/login", () => () => <div>LoginPage</div>);
jest.mock("./module/core/components/Home", () => () => <div>HomePage</div>);
jest.mock("./module/unidad/components/UnidadGrilla", () => () => <div>UnidadGrilla</div>);
jest.mock("./module/producto/components/ProductoGrilla", () => () => <div>ProductoGrilla</div>);
jest.mock("./module/receta/components/RecetaGrilla", () => () => <div>RecetaGrilla</div>);
jest.mock("./module/usuarios/components/UsuariosGrilla", () => () => <div>UsuariosGrilla</div>);
jest.mock("./module/usuarios/components/updatePassword", () => () => <div>UpdatePassword</div>);

const defaultAuthMock = {
  isAuthenticated: true,
  isAdmin: false,
  hasPermission: () => false,
  userName: "",
  email: "",
  token: "",
  signup: jest.fn(),
  login: jest.fn(),
  logout: jest.fn(),
  changePassword: jest.fn(),
  setUser: jest.fn(),
  forgotPassword: jest.fn(),
  updatePassword: jest.fn(),
};

const mockUseAuth = (overrides = {}) => {
  jest.spyOn(AuthContext, "useAuth").mockReturnValue({
    ...defaultAuthMock,
    ...overrides,
  });
};

const mockUsePermisos = (perms = {}) => {
  jest.spyOn(PermisosContext, "usePermisos").mockReturnValue({
    view_producto: "view_producto",
    view_receta: "view_receta",
    view_unidad: "view_unidad",
    ...perms,
  });
};

describe("AppRoutes", () => {
  afterEach(() => {
    jest.resetAllMocks();
    cleanup();
  });

  it("renders login on /", () => {
    mockUseAuth(); // Mock necesario para rutas públicas
    render(
      <MemoryRouter initialEntries={["/"]}>
        <AppRoutes />
      </MemoryRouter>,
    );
    expect(screen.getByText("LoginPage")).toBeInTheDocument();
  });

  it("renders login on /login", () => {
    mockUseAuth(); // Mock necesario para rutas públicas
    render(
      <MemoryRouter initialEntries={["/login"]}>
        <AppRoutes />
      </MemoryRouter>,
    );
    expect(screen.getByText("LoginPage")).toBeInTheDocument();
  });

  it("renders updatePassword on /updatePassword", () => {
    render(
      <MemoryRouter initialEntries={["/updatePassword"]}>
        <AppRoutes />
      </MemoryRouter>,
    );
    expect(screen.getByText("UpdatePassword")).toBeInTheDocument();
  });

  it("redirects unauthenticated users to login for private routes", () => {
    mockUseAuth({ isAuthenticated: false });
    mockUsePermisos();
    render(
      <MemoryRouter initialEntries={["/Home"]}>
        <AppRoutes />
      </MemoryRouter>,
    );
    expect(screen.getByText("LoginPage")).toBeInTheDocument();
  });

  it("renders Home for authenticated user", () => {
    mockUseAuth({ isAuthenticated: true });
    mockUsePermisos();
    render(
      <MemoryRouter initialEntries={["/Home"]}>
        <AppRoutes />
      </MemoryRouter>,
    );
    expect(screen.getByText("HomePage")).toBeInTheDocument();
  });

  it("renders UnidadGrilla if user has unidad permission", () => {
    mockUseAuth({
      isAuthenticated: true,
      hasPermission: (permCode: string) => permCode === "view_unidad",
    });
    mockUsePermisos();
    render(
      <MemoryRouter initialEntries={["/Unidades"]}>
        <AppRoutes />
      </MemoryRouter>,
    );
    expect(screen.getByText("UnidadGrilla")).toBeInTheDocument();
  });

  it("redirects to Home if user lacks unidad permission", () => {
    mockUseAuth({
      isAuthenticated: true,
      hasPermission: () => false,
    });
    mockUsePermisos();
    render(
      <MemoryRouter initialEntries={["/Unidades"]}>
        <AppRoutes />
      </MemoryRouter>,
    );
    expect(screen.getByText("HomePage")).toBeInTheDocument();
  });

  it("renders ProductoGrilla if user has producto permission", () => {
    mockUseAuth({
      isAuthenticated: true,
      hasPermission: (permCode: string) => permCode === "view_producto",
    });
    mockUsePermisos();
    render(
      <MemoryRouter initialEntries={["/Productos"]}>
        <AppRoutes />
      </MemoryRouter>,
    );
    expect(screen.getByText("ProductoGrilla")).toBeInTheDocument();
  });

  it("renders RecetaGrilla if user has receta permission", () => {
    mockUseAuth({
      isAuthenticated: true,
      hasPermission: (permCode: string) => permCode === "view_receta",
    });
    mockUsePermisos();
    render(
      <MemoryRouter initialEntries={["/Recetas"]}>
        <AppRoutes />
      </MemoryRouter>,
    );
    expect(screen.getByText("RecetaGrilla")).toBeInTheDocument();
  });

  it("renders UsuariosGrilla if user is admin", () => {
    mockUseAuth({
      isAuthenticated: true,
      isAdmin: true,
    });
    mockUsePermisos();
    render(
      <MemoryRouter initialEntries={["/Usuarios"]}>
        <AppRoutes />
      </MemoryRouter>,
    );
    expect(screen.getByText("UsuariosGrilla")).toBeInTheDocument();
  });

  it("redirects to Home if user is not admin for UsuariosGrilla", () => {
    mockUseAuth({
      isAuthenticated: true,
      isAdmin: false,
    });
    mockUsePermisos();
    render(
      <MemoryRouter initialEntries={["/Usuarios"]}>
        <AppRoutes />
      </MemoryRouter>,
    );
    expect(screen.getByText("HomePage")).toBeInTheDocument();
  });

  it("renders LoginPage for unknown routes", () => {
    mockUseAuth();
    render(
      <MemoryRouter initialEntries={["/unknown"]}>
        <AppRoutes />
      </MemoryRouter>,
    );
    expect(screen.getByText("LoginPage")).toBeInTheDocument();
  });
});

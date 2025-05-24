import { render, screen, fireEvent } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import Login from "./login";
import * as AuthContext from "../../contexts/AuthContext";

// Mock AuthContext
jest.mock("../../contexts/AuthContext", () => ({
  useAuth: () => ({
    login: jest.fn().mockResolvedValue(undefined),
    signup: jest.fn().mockResolvedValue(undefined),
  }),
}));

describe("Login component", () => {
  it("renders login and signup tabs", () => {
    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>,
    );
    expect(screen.getAllByText(/Inicia Sesión/i).length).toBeGreaterThanOrEqual(2);
    expect(screen.getByRole("tab", { name: /Inicia Sesión/i })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /Regístrate/i })).toBeInTheDocument();
  });

  it("renders login form fields", () => {
    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>,
    );
    expect(screen.getByLabelText(/Usuario/i)).toBeInTheDocument();
    // Selecciona solo el primer campo de contraseña (tab login)
    expect(screen.getAllByLabelText(/Contraseña/i)[0]).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Login/i })).toBeInTheDocument();
  });

  it("switches to signup tab and shows signup fields", () => {
    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>,
    );
    fireEvent.click(screen.getByText(/Regístrate/i));
    expect(screen.getByLabelText(/Nombre/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^Email$/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Registrarme/i })).toBeInTheDocument();
  });

  it("calls login API on login submit", async () => {
    const mockLogin = jest.fn().mockResolvedValue(undefined);

    jest.spyOn(AuthContext, "useAuth").mockReturnValue({
      login: mockLogin,
      signup: jest.fn(),
      userName: "",
      email: "",
      token: "",
      isAdmin: false,
      isAuthenticated: false,
      logout: jest.fn(),
      forgotPassword: jest.fn(),
      updatePassword: jest.fn(),
      hasPermission: jest.fn().mockReturnValue(false),
    });

    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>,
    );

    fireEvent.change(screen.getByLabelText(/Usuario/i), { target: { value: "test@email.com" } });
    fireEvent.change(screen.getAllByLabelText(/Contraseña/i)[0], {
      target: { value: "password123" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Login/i }));

    // Espera a que la función login sea llamada
    await screen.findByRole("button", { name: /Login/i });
    expect(mockLogin).toHaveBeenCalledWith({
      email: "test@email.com",
      password: "password123",
    });
  });

  it("calls signup API on signup submit", async () => {
    const mockSignup = jest.fn().mockResolvedValue(undefined);
    jest.spyOn(AuthContext, "useAuth").mockReturnValue({
      login: jest.fn(),
      signup: mockSignup,
      userName: "",
      email: "",
      token: "",
      isAdmin: false,
      isAuthenticated: false,
      logout: jest.fn(),
      forgotPassword: jest.fn(),
      updatePassword: jest.fn(),
      hasPermission: jest.fn().mockReturnValue(false),
    });

    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>,
    );

    fireEvent.click(screen.getByText(/Regístrate/i));
    fireEvent.change(screen.getByLabelText(/Nombre/i), { target: { value: "Juan" } });
    fireEvent.change(screen.getByLabelText(/^Email$/i), { target: { value: "juan@email.com" } });
    fireEvent.change(screen.getByLabelText(/^Contraseña$/i), { target: { value: "Password123!" } });
    fireEvent.click(screen.getByRole("button", { name: /Registrarme/i }));

    // Espera a que la función signup sea llamada
    await screen.findByRole("button", { name: /Registrarme/i });
    expect(mockSignup).toHaveBeenCalledWith({
      name: "Juan",
      email: "juan@email.com",
      password: "Password123!",
    });
  });

  it("toggles password visibility", () => {
    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>,
    );
    // Busca el campo de contraseña y el botón de mostrar/ocultar solo en el tab login
    const passwordInput = screen.getAllByLabelText(/Contraseña/i)[0];
    const toggleButton = screen.getByLabelText(/Mostrar contraseña/i);
    // Por defecto debe ser type="password"
    expect(passwordInput).toHaveAttribute("type", "password");
    // Click para mostrar contraseña
    fireEvent.click(toggleButton);
    expect(passwordInput).toHaveAttribute("type", "text");
    // Click para ocultar contraseña
    fireEvent.click(toggleButton);
    expect(passwordInput).toHaveAttribute("type", "password");
  });

  it("shows error on login failure", async () => {
    const mockLogin = jest.fn().mockRejectedValue(new Error("Login failed"));
    jest.spyOn(AuthContext, "useAuth").mockReturnValue({
      login: mockLogin,
      signup: jest.fn(),
      userName: "",
      email: "",
      token: "",
      isAdmin: false,
      isAuthenticated: false,
      logout: jest.fn(),
      forgotPassword: jest.fn(),
      updatePassword: jest.fn(),
      hasPermission: jest.fn().mockReturnValue(false),
    });

    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>,
    );

    fireEvent.change(screen.getByLabelText(/Usuario/i), { target: { value: "fail@email.com" } });
    fireEvent.change(screen.getAllByLabelText(/Contraseña/i)[0], {
      target: { value: "wrongpass" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Login/i }));

    // Espera a que aparezca el mensaje de error
    expect(await screen.findByText(/Login failed/i)).toBeInTheDocument();
  });

  it("shows error on signup failure", async () => {
    const mockSignup = jest.fn().mockRejectedValue(new Error("Signup failed"));
    jest.spyOn(AuthContext, "useAuth").mockReturnValue({
      login: jest.fn(),
      signup: mockSignup,
      userName: "",
      email: "",
      token: "",
      isAdmin: false,
      isAuthenticated: false,
      logout: jest.fn(),
      forgotPassword: jest.fn(),
      updatePassword: jest.fn(),
      hasPermission: jest.fn().mockReturnValue(false),
    });

    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>,
    );

    fireEvent.click(screen.getByText(/Regístrate/i));
    fireEvent.change(screen.getByLabelText(/Nombre/i), { target: { value: "Juan" } });
    fireEvent.change(screen.getByLabelText(/^Email$/i), { target: { value: "juan@email.com" } });
    fireEvent.change(screen.getByLabelText(/^Contraseña$/i), { target: { value: "Password123!" } });
    fireEvent.click(screen.getByRole("button", { name: /Registrarme/i }));

    // Espera a que aparezca el mensaje de error
    expect(await screen.findByText(/Signup failed/i)).toBeInTheDocument();
  });
});

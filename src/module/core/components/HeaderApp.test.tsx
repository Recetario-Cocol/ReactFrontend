import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import HeaderApp from "./HeaderApp";
import { BrowserRouter } from "react-router-dom";

// Mock de useNavigate
const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

// Mock del contexto de autenticación
jest.mock("../../contexts/AuthContext", () => ({
  useAuth: () => ({
    isAuthenticated: true,
    logout: jest.fn(),
    userName: "Test User",
    isAdmin: true,
  }),
}));

const renderWithRouter = (ui: React.ReactElement) => {
  return render(<BrowserRouter>{ui}</BrowserRouter>);
};

describe("HeaderApp", () => {
  it("muestra el título recibido por props", () => {
    renderWithRouter(<HeaderApp titulo="Mi Título" />);
    expect(screen.getByText("Mi Título")).toBeInTheDocument();
  });

  it("muestra el nombre de usuario cuando está autenticado", () => {
    renderWithRouter(<HeaderApp titulo="Test" />);
    expect(screen.getByText("Test User")).toBeInTheDocument();
  });

  it("muestra el botón de menú y el botón de usuario cuando está autenticado", () => {
    renderWithRouter(<HeaderApp titulo="Test" />);
    expect(screen.getByLabelText(/menu/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/account of current user/i)).toBeInTheDocument();
  });

  it("abre el menú de usuario al hacer click en el icono", () => {
    renderWithRouter(<HeaderApp titulo="Test" />);
    fireEvent.click(screen.getByLabelText(/account of current user/i));
    expect(screen.getByText(/Usuarios/i)).toBeInTheDocument();
    expect(screen.getByText(/Log out/i)).toBeInTheDocument();
  });

  it("abre el manu y ver que todos los items estan renderizados", async () => {
    renderWithRouter(<HeaderApp titulo="Test" />);
    await userEvent.click(screen.getByLabelText("menu"));
    await waitFor(() => {
      expect(screen.getByText(/Home/i)).toBeInTheDocument();
      expect(screen.getByText(/Unidades/i)).toBeInTheDocument();
      expect(screen.getByText(/Productos/i)).toBeInTheDocument();
      expect(screen.getByText(/Recetas/i)).toBeInTheDocument();
    });
    await userEvent.click(screen.getByText(/Unidades/i));
    expect(mockNavigate).toHaveBeenCalledWith("/Unidades");
  });
});

import { render, screen, waitFor } from "@testing-library/react";
import Home from "./Home";
import * as DashboardServiceModule from "../../dashboard/useDashboardService";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "../../contexts/AuthContext"; // importa tu AuthProvider

// Mock del servicio
const mockGetTotales = jest.fn().mockResolvedValue({
  unidades: 5,
  productos: 10,
  recetas: 3,
});

jest.spyOn(DashboardServiceModule, "useDashboardService").mockReturnValue({
  getTotales: mockGetTotales,
});

function renderWithProviders(ui: React.ReactElement) {
  return render(
    <AuthProvider>
      <BrowserRouter>{ui}</BrowserRouter>
    </AuthProvider>,
  );
}

describe("Home", () => {
  it("renderiza los títulos y cantidades correctamente", async () => {
    renderWithProviders(<Home />);
    // Espera a que se actualicen los datos
    await waitFor(() => {
      expect(screen.getByText(/Unidades \(5\)/)).toBeInTheDocument();
      expect(screen.getByText(/Productos \(10\)/)).toBeInTheDocument();
      expect(screen.getByText(/Recetas \(3\)/)).toBeInTheDocument();
    });
    // Verifica descripciones
    expect(screen.getByText(/Unidades basicas/)).toBeInTheDocument();
    expect(screen.getByText(/Diferentes paquetes de Productos/)).toBeInTheDocument();
    expect(screen.getByText(/Tus recetas privadas/)).toBeInTheDocument();
  });
});

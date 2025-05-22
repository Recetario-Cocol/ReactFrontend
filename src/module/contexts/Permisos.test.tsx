import { render, waitFor, screen } from "@testing-library/react";
import { PermisosProvider, usePermisos } from "./Permisos";

// Mock de useAxiosWithAuthentication
jest.mock("../core/useAxiosWithAuthentication", () => () => ({
  get: jest.fn().mockResolvedValue({
    data: [
      { id: 1, codename: "permiso_1", name: "Permiso 1", descripcion: "desc 1" },
      { id: 2, codename: "permiso_2", name: "Permiso 2", descripcion: "desc 2" },
    ],
  }),
}));

// Mock de useAuth para controlar isAuthenticated
jest.mock("./AuthContext", () => ({
  useAuth: () => ({
    isAuthenticated: true,
  }),
}));

const TestComponent = () => {
  const permisos = usePermisos();
  return (
    <div>
      {Object.keys(permisos).map((key) => (
        <span key={key} data-testid="permiso">
          {key}
        </span>
      ))}
    </div>
  );
};

describe("PermisosProvider", () => {
  it("carga y provee los permisos correctamente", async () => {
    render(
      <PermisosProvider>
        <TestComponent />
      </PermisosProvider>,
    );
    await waitFor(() => {
      expect(screen.getAllByTestId("permiso").length).toBe(2);
      expect(screen.getByText("permiso_1")).toBeInTheDocument();
      expect(screen.getByText("permiso_2")).toBeInTheDocument();
    });
  });
});

describe("usePermisos", () => {
  it("devuelve los permisos cuando está dentro del provider", async () => {
    render(
      <PermisosProvider>
        <TestComponent />
      </PermisosProvider>,
    );
    await waitFor(() => {
      expect(screen.getByText("permiso_1")).toBeInTheDocument();
      expect(screen.getByText("permiso_2")).toBeInTheDocument();
    });
  });

  it("devuelve defaultPermisos y muestra un warning si se usa fuera del provider", () => {
    const warnSpy = jest.spyOn(console, "warn").mockImplementation(() => {});
    render(<TestComponent />);
    expect(screen.queryByTestId("permiso")).toBeNull();
    expect(warnSpy).toHaveBeenCalledWith("usePermisos fue llamado fuera de PermisosProvider");
    warnSpy.mockRestore();
  });
});

import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import PermisosAutoComplete from "./PermisososAutoComplete";
import { Permiso } from "../../contexts/Permisos";

// Mock useAxiosWithAuthentication
const getMock: jest.Mock<Promise<{ data: Permiso[] }>, []> = jest.fn(() =>
  Promise.resolve({ data: [] }),
);
jest.mock("../../core/useAxiosWithAuthentication", () => () => ({
  get: getMock,
}));

const mockPermisos: Permiso[] = [
  {
    id: 1,
    codename: "Permiso 1 codename",
    name: "Permiso 1",
    descripcion: "Permiso 1 descripcion",
  },
  {
    id: 2,
    codename: "Permiso 2 codename",
    name: "Permiso 2",
    descripcion: "Permiso 2 descripcion",
  },
  {
    id: 3,
    codename: "Permiso 3 codename",
    name: "Permiso 3",
    descripcion: "Permiso 3 descripcion",
  },
];

describe("PermisosAutoComplete", () => {
  beforeEach(() => {
    jest.resetModules();
    getMock.mockResolvedValue({ data: mockPermisos });
  });

  it("renderiza y muestra opciones correctamente", async () => {
    render(<PermisosAutoComplete value={[1]} onChange={jest.fn()} />);
    // Espera a que cargue las opciones
    await waitFor(() => {
      expect(screen.getByText("Permiso 1")).toBeInTheDocument();
    });
    // El input debe estar presente
    expect(screen.getByPlaceholderText("Permisos")).toBeInTheDocument();
  });

  it("muestra los permisos seleccionados", async () => {
    render(<PermisosAutoComplete value={[2]} onChange={jest.fn()} />);
    await waitFor(() => {
      expect(screen.getByText("Permiso 2")).toBeInTheDocument();
    });
  });

  it("permite seleccionar y deseleccionar permisos", async () => {
    const handleChange = jest.fn();
    render(<PermisosAutoComplete value={[]} onChange={handleChange} />);
    // Espera a que cargue las opciones (pero no busques aún el texto)
    await waitFor(() => {
      expect(getMock).toHaveBeenCalled();
    });

    // Abre el dropdown usando el botón de apertura
    fireEvent.click(screen.getByLabelText("Open"));

    // Espera a que la opción esté visible en el DOM (en el portal)
    const option = await screen.findByText((content) => content.includes("Permiso 1"));
    fireEvent.click(option);

    expect(handleChange).toHaveBeenCalledWith(
      expect.arrayContaining([expect.objectContaining({ id: 1 })]),
    );
  });

  it("muestra mensaje de error si se pasa error", async () => {
    render(<PermisosAutoComplete value={[]} onChange={jest.fn()} error="Campo requerido" />);
    expect(screen.getByText("Campo requerido")).toBeInTheDocument();
  });

  it("muestra loading mientras carga", async () => {
    getMock.mockImplementation(() => new Promise(() => {})); // never resolves
    render(<PermisosAutoComplete value={[]} onChange={jest.fn()} />);
    // El input debe seguir presente durante el loading
    expect(screen.getByPlaceholderText("Permisos")).toBeInTheDocument();
  });

  it("maneja error de carga de permisos", async () => {
    getMock.mockRejectedValue(new Error("Error"));
    render(<PermisosAutoComplete value={[]} onChange={jest.fn()} />);
    await waitFor(() => {
      // No debe crashear ni mostrar opciones
      expect(screen.getByPlaceholderText("Permisos")).toBeInTheDocument();
    });
  });
});

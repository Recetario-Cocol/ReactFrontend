import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import RolesAutoComplete from "./RolesAutoComplete";
import { Rol } from "../../contexts/Permisos";

const mockRoles: Rol[] = [
  { code: "ROLE_ADMIN", nombre: "Administrador" },
  { code: "ROLE_USER", nombre: "Pasteleria" },
];

describe("RolesAutoComplete", () => {
  it("renderiza y muestra opciones correctamente", async () => {
    render(<RolesAutoComplete value={[mockRoles[0]]} onChange={jest.fn()} />);
    expect(screen.getByText("Administrador")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Roles")).toBeInTheDocument();
  });

  it("muestra los roles seleccionados", async () => {
    render(<RolesAutoComplete value={[mockRoles[1]]} onChange={jest.fn()} />);
    expect(screen.getByText("Pasteleria")).toBeInTheDocument();
  });

  it("permite seleccionar y deseleccionar roles", async () => {
    const handleChange = jest.fn();
    render(<RolesAutoComplete value={[]} onChange={handleChange} />);
    // Abre el dropdown usando el botón de apertura
    fireEvent.click(screen.getByLabelText("Open"));
    // Espera a que la opción esté visible en el DOM (en el portal)
    const option = await screen.findByText((content) => content.includes("Administrador"));
    fireEvent.click(option);

    expect(handleChange).toHaveBeenCalledWith(
      expect.arrayContaining([expect.objectContaining({ code: "ROLE_ADMIN" })]),
    );
  });

  it("muestra mensaje de error si se pasa error", async () => {
    render(<RolesAutoComplete value={[]} onChange={jest.fn()} error="Campo requerido" />);
    expect(screen.getByText("Campo requerido")).toBeInTheDocument();
  });

  it("input está presente siempre", async () => {
    render(<RolesAutoComplete value={[]} onChange={jest.fn()} />);
    expect(screen.getByPlaceholderText("Roles")).toBeInTheDocument();
  });
});

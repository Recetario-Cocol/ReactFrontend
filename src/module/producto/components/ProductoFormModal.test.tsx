import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import ProductoFormModal from "./ProductoFormModal";
import Producto from "../Producto";
import { Unidad } from "../../unidad/Unidad";

// Mock servicios
jest.mock("../useProductoService", () => ({
  useProductoService: () => ({
    get: jest.fn().mockResolvedValue(new Producto(0, "", 0, 0, 0)),
    crear: jest.fn().mockResolvedValue({}),
    actualizar: jest.fn().mockResolvedValue({}),
  }),
}));
jest.mock("../../unidad/useUnidadService", () => ({
  useUnidadService: () => ({
    getUnidades: jest
      .fn()
      .mockResolvedValue([new Unidad(1, "Unidad 1", "u1"), new Unidad(2, "Unidad 2", "u2")]),
  }),
}));

describe("ProductoFormModal", () => {
  it("debería renderizar los campos y botones del modal", async () => {
    render(<ProductoFormModal openArg={true} idToOpen={0} onClose={jest.fn()} />);

    // Espera a que termine el loading
    await waitFor(() =>
      expect(screen.getByRole("button", { name: /Enviar/i })).toBeInTheDocument(),
    );

    expect(screen.getByLabelText(/^Id$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^Nombre$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^Cantidad$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^Unidad$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^Precio$/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Enviar/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Cancelar/i })).toBeInTheDocument();
  });

  it("debería mostrar error si se envía sin nombre", async () => {
    render(<ProductoFormModal openArg={true} idToOpen={0} onClose={jest.fn()} />);
    await waitFor(() =>
      expect(screen.getByRole("button", { name: /Enviar/i })).toBeInTheDocument(),
    );
    fireEvent.click(screen.getByRole("button", { name: /Enviar/i }));
    const errores = await screen.findAllByText(/Ingrese un nombre./i);
    expect(errores.length).toBeGreaterThan(0);
  });

  it("debería mostrar error si se envía sin precio", async () => {
    render(<ProductoFormModal openArg={true} idToOpen={0} onClose={jest.fn()} />);
    await waitFor(() =>
      expect(screen.getByRole("button", { name: /Enviar/i })).toBeInTheDocument(),
    );
    fireEvent.change(screen.getByLabelText(/^Nombre$/i), { target: { value: "Test" } });
    fireEvent.click(screen.getByRole("button", { name: /Enviar/i }));
    expect(await screen.findByText(/Ingrese un precio/i)).toBeInTheDocument();
  });

  it("debería mostrar error si se envía sin unidad", async () => {
    render(<ProductoFormModal openArg={true} idToOpen={0} onClose={jest.fn()} />);
    await waitFor(() =>
      expect(screen.getByRole("button", { name: /Enviar/i })).toBeInTheDocument(),
    );
    fireEvent.change(screen.getByLabelText(/^Nombre$/i), { target: { value: "Test" } });
    fireEvent.change(screen.getByLabelText(/^Precio$/i), { target: { value: "10" } });
    fireEvent.click(screen.getByRole("button", { name: /Enviar/i }));
    const errores = await screen.findAllByText(/Selecione una unidad./i);
    expect(errores.length).toBeGreaterThan(0);
  });

  it("debería mostrar error si la cantidad es inválida", async () => {
    render(<ProductoFormModal openArg={true} idToOpen={0} onClose={jest.fn()} />);
    await waitFor(() =>
      expect(screen.getByRole("button", { name: /Enviar/i })).toBeInTheDocument(),
    );
    fireEvent.change(screen.getByLabelText(/^Nombre$/i), { target: { value: "Test" } });
    fireEvent.change(screen.getByLabelText(/^Precio$/i), { target: { value: "10" } });
    fireEvent.mouseDown(screen.getByLabelText(/^Unidad$/i));
    fireEvent.click(screen.getByText("Unidad 1"));
    fireEvent.change(screen.getByLabelText(/^Cantidad$/i), { target: { value: "0" } });
    fireEvent.click(screen.getByRole("button", { name: /Enviar/i }));
    expect(await screen.findByText(/Selecione una cantidad valida/i)).toBeInTheDocument();
  });

  it("debería llamar crear con los datos correctos", async () => {
    const onClose = jest.fn();
    render(<ProductoFormModal openArg={true} idToOpen={0} onClose={onClose} />);
    await waitFor(() =>
      expect(screen.getByRole("button", { name: /Enviar/i })).toBeInTheDocument(),
    );
    fireEvent.change(screen.getByLabelText(/^Nombre$/i), { target: { value: "Test" } });
    fireEvent.change(screen.getByLabelText(/^Precio$/i), { target: { value: "10" } });
    fireEvent.mouseDown(screen.getByLabelText(/^Unidad$/i));
    fireEvent.click(screen.getByText("Unidad 1"));
    fireEvent.change(screen.getByLabelText(/^Cantidad$/i), { target: { value: "5" } });
    fireEvent.click(screen.getByRole("button", { name: /Enviar/i }));
    await waitFor(() => expect(onClose).toHaveBeenCalled());
  });
});

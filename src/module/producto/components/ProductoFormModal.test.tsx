import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import ProductoFormModal from "./ProductoFormModal";
import Producto from "../Producto";
import { Unidad } from "../../unidad/Unidad";

// Mocks reutilizables
const mockGet = jest.fn().mockResolvedValue(new Producto(0, "", 0, 0, 0));
const mockCrear = jest.fn().mockResolvedValue({});
const mockActualizar = jest.fn().mockResolvedValue({});
const mockGetUnidades = jest
  .fn()
  .mockResolvedValue([new Unidad(1, "Unidad 1", "u1"), new Unidad(2, "Unidad 2", "u2")]);

jest.mock("../useProductoService", () => ({
  useProductoService: () => ({
    get: mockGet,
    crear: mockCrear,
    actualizar: mockActualizar,
  }),
}));
jest.mock("../../unidad/useUnidadService", () => ({
  useUnidadService: () => ({
    getUnidades: mockGetUnidades,
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

  it("debería llamar actualizar si idToOpen es distinto de 0", async () => {
    const onClose = jest.fn();
    // Simula que el producto ya existe (id=1)
    render(<ProductoFormModal openArg={true} idToOpen={1} onClose={onClose} />);
    await waitFor(() =>
      expect(screen.getByRole("button", { name: /Enviar/i })).toBeInTheDocument(),
    );
    fireEvent.change(screen.getByLabelText(/^Nombre$/i), { target: { value: "Editado" } });
    fireEvent.change(screen.getByLabelText(/^Precio$/i), { target: { value: "20" } });
    fireEvent.mouseDown(screen.getByLabelText(/^Unidad$/i));
    fireEvent.click(screen.getByText("Unidad 1"));
    fireEvent.change(screen.getByLabelText(/^Cantidad$/i), { target: { value: "2" } });
    fireEvent.click(screen.getByRole("button", { name: /Enviar/i }));
    await waitFor(() => expect(mockActualizar).toHaveBeenCalled());
    expect(onClose).toHaveBeenCalled();
  });

  it("debería mostrar mensaje de error si el service.crear falla", async () => {
    mockCrear.mockRejectedValueOnce(new Error("Error al crear producto"));
    render(<ProductoFormModal openArg={true} idToOpen={0} onClose={jest.fn()} />);
    await waitFor(() =>
      expect(screen.getByRole("button", { name: /Enviar/i })).toBeInTheDocument(),
    );
    fireEvent.change(screen.getByLabelText(/^Nombre$/i), { target: { value: "Test" } });
    fireEvent.change(screen.getByLabelText(/^Precio$/i), { target: { value: "10" } });
    fireEvent.mouseDown(screen.getByLabelText(/^Unidad$/i));
    fireEvent.click(screen.getByText("Unidad 1"));
    fireEvent.change(screen.getByLabelText(/^Cantidad$/i), { target: { value: "5" } });
    fireEvent.click(screen.getByRole("button", { name: /Enviar/i }));
    await waitFor(() =>
      expect(screen.getByText(/Error al crear un producto/i)).toBeInTheDocument(),
    );
  });

  it("debería mostrar mensaje de error si el service.actualizar falla", async () => {
    mockActualizar.mockRejectedValueOnce(new Error("Error al actualizar producto"));
    render(<ProductoFormModal openArg={true} idToOpen={1} onClose={jest.fn()} />);
    await waitFor(() =>
      expect(screen.getByRole("button", { name: /Enviar/i })).toBeInTheDocument(),
    );
    fireEvent.change(screen.getByLabelText(/^Nombre$/i), { target: { value: "Editado" } });
    fireEvent.change(screen.getByLabelText(/^Precio$/i), { target: { value: "20" } });
    fireEvent.mouseDown(screen.getByLabelText(/^Unidad$/i));
    fireEvent.click(screen.getByText("Unidad 1"));
    fireEvent.change(screen.getByLabelText(/^Cantidad$/i), { target: { value: "2" } });
    fireEvent.click(screen.getByRole("button", { name: /Enviar/i }));
    await waitFor(() =>
      expect(screen.getByText(/Error al actualizar el producto/i)).toBeInTheDocument(),
    );
  });

  it("debería llamar getUnidades del service de unidad", async () => {
    render(<ProductoFormModal openArg={true} idToOpen={0} onClose={jest.fn()} />);
    await waitFor(() => expect(mockGetUnidades).toHaveBeenCalled());
  });

  it("debería llamar get del service de producto si idToOpen > 0", async () => {
    render(<ProductoFormModal openArg={true} idToOpen={2} onClose={jest.fn()} />);
    await waitFor(() => expect(mockGet).toHaveBeenCalledWith(2));
  });
});

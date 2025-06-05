import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import IngredienteModal, { AlertDialogBorrarIngrediente } from "./IngredienteModal";
import { Unidad } from "../../unidad/Unidad";
import Producto from "../../producto/Producto";

const mockProductos = [
  new Producto(1, "Producto A", 10, 1500, 1000),
  new Producto(2, "Producto b", 10, 2000, 1000),
];
const mockUnidades = [new Unidad(10, "Gramo", "g"), new Unidad(20, "Litro", "lt")];

// Limpia los mocks después de cada test
afterEach(() => {
  jest.clearAllMocks();
});

describe("IngredienteModal", () => {
  it("debería renderizar los campos y botones del modal", () => {
    render(
      <IngredienteModal
        openArg={true}
        onSubmit={jest.fn()}
        ingredienteParam={undefined}
        unidadesParam={mockUnidades}
        productosParam={mockProductos}
        onClose={jest.fn()}
      />,
    );
    // Cambia el título esperado a "Ingrediente"
    expect(screen.getByRole("heading", { name: /Ingrediente/i })).toBeInTheDocument();
    // Verifica los campos por label
    waitFor(() => {
      expect(screen.getByLabelText(/^Producto$/i)).toBeInTheDocument();
    });
    expect(screen.getByLabelText(/^Cantidad$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^Unidad$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^Precio$/i)).toBeInTheDocument();
    // Cambia el nombre del botón a "Guardar"
    expect(screen.getByRole("button", { name: /Guardar/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Cancelar/i })).toBeInTheDocument();
  });

  it("debería mostrar error si se envía sin seleccionar producto", () => {
    render(
      <IngredienteModal
        openArg={true}
        onSubmit={jest.fn()}
        ingredienteParam={undefined}
        unidadesParam={mockUnidades}
        productosParam={mockProductos}
        onClose={jest.fn()}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: /Guardar/i }));
    // Cambia el mensaje de error esperado
    expect(screen.getByText(/Seleccione un producto/i)).toBeInTheDocument();
  });

  it("debería llamar onSubmit con los datos correctos", async () => {
    const onSubmit = jest.fn();
    render(
      <IngredienteModal
        openArg={true}
        onSubmit={onSubmit}
        ingredienteParam={undefined}
        unidadesParam={mockUnidades}
        productosParam={mockProductos}
        onClose={jest.fn()}
      />,
    );
    // Select product
    await waitFor(() => {
      expect(screen.getByLabelText(/^Producto$/i)).toBeInTheDocument();
    });
    fireEvent.mouseDown(screen.getByLabelText(/^Seleccione un Producto$/i));
    fireEvent.click(screen.getByText("Producto A"));
    // Enter cantidad
    fireEvent.change(screen.getByLabelText(/^Cantidad$/i), { target: { value: "5" } });
    // Submit
    fireEvent.click(screen.getByRole("button", { name: /Guardar/i }));
    await waitFor(() => expect(onSubmit).toHaveBeenCalled());
    const arg = onSubmit.mock.calls[0][0];
    // Extrae las propiedades públicas relevantes para comparar
    expect({
      productoId: arg.productoId ?? arg._productoId,
      cantidad: Number(arg.cantidad ?? arg._cantidad),
    }).toEqual({
      productoId: 1,
      cantidad: 5,
    });
  });

  // Test adicional: cantidad inválida
  it("debería mostrar error si la cantidad es inválida", async () => {
    render(
      <IngredienteModal
        openArg={true}
        onSubmit={jest.fn()}
        ingredienteParam={undefined}
        unidadesParam={mockUnidades}
        productosParam={mockProductos}
        onClose={jest.fn()}
      />,
    );
    // Selecciona producto
    fireEvent.mouseDown(screen.getByLabelText(/^Producto$/i));
    fireEvent.click(screen.getByText("Producto A"));
    // Ingresa cantidad inválida
    fireEvent.change(screen.getByLabelText(/^Cantidad$/i), { target: { value: "-1" } });
    fireEvent.click(screen.getByRole("button", { name: /Guardar/i }));
    // Espera a que aparezca el mensaje de error
    await waitFor(() => expect(screen.getByText(/cantidad válida mayor a 0/i)).toBeInTheDocument());
  });
});

describe("AlertDialogBorrarIngrediente", () => {
  it("renders dialog and handles button clicks", () => {
    const onSubmit = jest.fn();
    const onClose = jest.fn();
    render(<AlertDialogBorrarIngrediente paramId={123} onSubmit={onSubmit} onClose={onClose} />);
    expect(screen.getByText(/¿Desea Borrar el Ingrediente/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /No/i }));
    expect(onClose).toHaveBeenCalled();
    // Re-render to test "Si"
    render(<AlertDialogBorrarIngrediente paramId={123} onSubmit={onSubmit} onClose={onClose} />);
    fireEvent.click(screen.getByRole("button", { name: /Si/i }));
    expect(onSubmit).toHaveBeenCalledWith(123);
  });
});

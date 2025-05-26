import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import AlertDialogBorrarProducto from "./AlertDialogBorrarProducto";
import * as useProductoServiceModule from "../useProductoService";

// Helper para renderizar el componente y capturar el mensaje de cierre
function renderDialog(
  mockEliminar: (id: number) => Promise<void>,
  onClose?: (msg: string) => void,
) {
  jest.spyOn(useProductoServiceModule, "useProductoService").mockReturnValue({
    getAll: jest.fn(),
    get: jest.fn(),
    crear: jest.fn(),
    actualizar: jest.fn(),
    eliminar: mockEliminar,
  });
  return render(<AlertDialogBorrarProducto paramId={1} onClose={onClose} />);
}

describe("AlertDialogBorrarProducto", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("cierra el diálogo y llama onClose con string vacío al hacer click en 'No'", () => {
    const onClose = jest.fn();
    renderDialog(jest.fn(), onClose);
    fireEvent.click(screen.getByText("No"));
    expect(onClose).toHaveBeenCalledWith("");
  });

  it("llama eliminar y onClose con mensaje de éxito al hacer click en 'Si'", async () => {
    const onClose = jest.fn();
    const eliminar = jest.fn().mockResolvedValue({});
    renderDialog(eliminar, onClose);
    fireEvent.click(screen.getByText("Si"));
    await waitFor(() => expect(onClose).toHaveBeenCalledWith("Producto eliminado correctamente."));
    expect(eliminar).toHaveBeenCalledWith(1);
  });

  it("maneja error 409 correctamente", async () => {
    const onClose = jest.fn();
    const error = { response: { status: 409 } };
    const eliminar = jest.fn().mockRejectedValue(error);
    renderDialog(eliminar, onClose);
    fireEvent.click(screen.getByText("Si"));
    await waitFor(() =>
      expect(onClose).toHaveBeenCalledWith(
        "No se puede eliminar el producto porque está relacionado con alguna receta.",
      ),
    );
  });

  it("maneja error 404 correctamente", async () => {
    const onClose = jest.fn();
    const error = { response: { status: 404 } };
    const eliminar = jest.fn().mockRejectedValue(error);
    renderDialog(eliminar, onClose);
    fireEvent.click(screen.getByText("Si"));
    await waitFor(() =>
      expect(onClose).toHaveBeenCalledWith("El producto que intentas eliminar no existe."),
    );
  });

  it("maneja error de conexión correctamente", async () => {
    const onClose = jest.fn();
    const eliminar = jest.fn().mockRejectedValue({});
    renderDialog(eliminar, onClose);
    fireEvent.click(screen.getByText("Si"));
    await waitFor(() =>
      expect(onClose).toHaveBeenCalledWith("Error de conexión. Intenta de nuevo más tarde."),
    );
  });
});

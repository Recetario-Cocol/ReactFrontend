import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import AlertDialogBorrarReceta from "./AlertDialogBorrarReceta";
import * as useRecetaServiceModule from "../useRecetaService";

// Helper para renderizar el componente y capturar el mensaje de cierre
function renderDialog(
  mockEliminar: (id: number) => Promise<void>,
  onClose?: (mensaje: string) => void,
) {
  jest.spyOn(useRecetaServiceModule, "useRecetaService").mockReturnValue({
    getAll: jest.fn(),
    get: jest.fn(),
    crear: jest.fn(),
    actualizar: jest.fn(),
    eliminar: mockEliminar,
    getGrilla: jest.fn(),
  });
  return render(<AlertDialogBorrarReceta paramId={1} onClose={onClose} />);
}

describe("AlertDialogBorrarReceta", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("cierra el diálogo y llama onClose con string vacío al hacer click en 'No'", async () => {
    const onClose = jest.fn();
    renderDialog(jest.fn(), onClose);
    await act(async () => {
      fireEvent.click(screen.getByText("No"));
    });
    expect(onClose).toHaveBeenCalledWith("");
  });

  it("llama eliminar y onClose con mensaje de éxito al hacer click en 'Si'", async () => {
    const onClose = jest.fn();
    const eliminar = jest.fn().mockResolvedValue({});
    renderDialog(eliminar, onClose);
    await act(async () => {
      fireEvent.click(screen.getByText("Si"));
    });
    await waitFor(() => expect(onClose).toHaveBeenCalledWith("Receta eliminada correctamente."));
    expect(eliminar).toHaveBeenCalledWith(1);
  });

  it("maneja error 404 correctamente", async () => {
    const onClose = jest.fn();
    const error = { response: { status: 404 } };
    const eliminar = jest.fn().mockRejectedValue(error);
    renderDialog(eliminar, onClose);
    await act(async () => {
      fireEvent.click(screen.getByText("Si"));
    });
    await waitFor(() =>
      expect(onClose).toHaveBeenCalledWith(
        "Error al intentar borra la receta. Intenta de nuevo más tarde.",
      ),
    );
  });

  it("maneja error de conexión correctamente", async () => {
    const onClose = jest.fn();
    const eliminar = jest.fn().mockRejectedValue({});
    renderDialog(eliminar, onClose);
    await act(async () => {
      fireEvent.click(screen.getByText("Si"));
    });
    await waitFor(() =>
      expect(onClose).toHaveBeenCalledWith(
        "Error al intentar borra la receta. Intenta de nuevo más tarde.",
      ),
    );
  });
});

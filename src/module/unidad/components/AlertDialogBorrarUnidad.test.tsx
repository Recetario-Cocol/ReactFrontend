import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import AlertDialogBorrarUnidad from "./AlertDialogBorrarUnidad";
import * as useUnidadServiceModule from "../useUnidadService";

// Helper para renderizar el componente y capturar el mensaje de cierre
function renderDialog(
  mockEliminarUnidad: (id: number) => Promise<void>,
  onClose?: (msg: string) => void,
) {
  jest.spyOn(useUnidadServiceModule, "useUnidadService").mockReturnValue({
    getUnidades: jest.fn(),
    getUnidad: jest.fn(),
    crearUnidad: jest.fn(),
    actualizarUnidad: jest.fn(),
    eliminarUnidad: mockEliminarUnidad,
  });
  return render(<AlertDialogBorrarUnidad paramId={1} onClose={onClose} />);
}

describe("AlertDialogBorrarUnidad", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("cierra el diálogo y llama onClose con string vacío al hacer click en 'No'", () => {
    const onClose = jest.fn();
    renderDialog(jest.fn(), onClose);
    fireEvent.click(screen.getByText("No"));
    expect(onClose).toHaveBeenCalledWith("");
  });

  it("llama eliminarUnidad y onClose con mensaje de éxito al hacer click en 'Si'", async () => {
    const onClose = jest.fn();
    const eliminarUnidad = jest.fn().mockResolvedValue({});
    renderDialog(eliminarUnidad, onClose);
    fireEvent.click(screen.getByText("Si"));
    await waitFor(() => expect(onClose).toHaveBeenCalledWith("Unidad eliminada correctamente."));
    expect(eliminarUnidad).toHaveBeenCalledWith(1);
  });

  it("maneja error 409 correctamente", async () => {
    const onClose = jest.fn();
    const error = { response: { status: 409 } };
    const eliminarUnidad = jest.fn().mockRejectedValue(error);
    renderDialog(eliminarUnidad, onClose);
    fireEvent.click(screen.getByText("Si"));
    await waitFor(() =>
      expect(onClose).toHaveBeenCalledWith(
        "No se puede eliminar la unidad porque está relacionada con otros recursos.",
      ),
    );
  });

  it("maneja error 404 correctamente", async () => {
    const onClose = jest.fn();
    const error = { response: { status: 404 } };
    const eliminarUnidad = jest.fn().mockRejectedValue(error);
    renderDialog(eliminarUnidad, onClose);
    fireEvent.click(screen.getByText("Si"));
    await waitFor(() =>
      expect(onClose).toHaveBeenCalledWith("La unidad que intentas eliminar no existe."),
    );
  });

  it("maneja error de conexión correctamente", async () => {
    const onClose = jest.fn();
    const eliminarUnidad = jest.fn().mockRejectedValue({});
    renderDialog(eliminarUnidad, onClose);
    fireEvent.click(screen.getByText("Si"));
    await waitFor(() =>
      expect(onClose).toHaveBeenCalledWith("Error de conexión. Intenta de nuevo más tarde."),
    );
  });
});

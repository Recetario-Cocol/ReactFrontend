import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import AlertDialogBorrarUsuario from "./AlertDialogBorrarUsuario";
import * as useUserServiceModule from "../useUserService";

function renderDialog(
  mockEliminarUsuario: (id: number, forced?: boolean) => Promise<void>,
  onClose?: (msg: string) => void,
  forced?: boolean,
) {
  jest.spyOn(useUserServiceModule, "useUserService").mockReturnValue({
    getUsuarios: jest.fn(),
    getUsuario: jest.fn(),
    crearUsuario: jest.fn(),
    actualizarUsuario: jest.fn(),
    eliminarUsuario: mockEliminarUsuario,
  });
  return render(<AlertDialogBorrarUsuario paramId={1} onClose={onClose} forced={forced} />);
}

describe("AlertDialogBorrarUsuario", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("cierra el diálogo y llama onClose con string vacío al hacer click en 'No'", () => {
    const onClose = jest.fn();
    renderDialog(jest.fn(), onClose);
    fireEvent.click(screen.getByText("No"));
    expect(onClose).toHaveBeenCalledWith("");
  });

  it("llama eliminarUsuario y onClose con mensaje de éxito al hacer click en 'Sí'", async () => {
    const onClose = jest.fn();
    const eliminarUsuario = jest.fn().mockResolvedValue({});
    renderDialog(eliminarUsuario, onClose);
    fireEvent.click(screen.getByText("Sí"));
    await waitFor(() => expect(onClose).toHaveBeenCalledWith("Usuario eliminado correctamente."));
    expect(eliminarUsuario).toHaveBeenCalledWith(1, undefined);
  });

  it("maneja error 409 correctamente", async () => {
    const onClose = jest.fn();
    const error = { response: { status: 409 } };
    const eliminarUsuario = jest.fn().mockRejectedValue(error);
    renderDialog(eliminarUsuario, onClose);
    fireEvent.click(screen.getByText("Sí"));
    await waitFor(() =>
      expect(onClose).toHaveBeenCalledWith(
        "No se puede eliminar el usuario porque está relacionado con otros recursos.",
      ),
    );
  });

  it("maneja error 404 correctamente", async () => {
    const onClose = jest.fn();
    const error = { response: { status: 404 } };
    const eliminarUsuario = jest.fn().mockRejectedValue(error);
    renderDialog(eliminarUsuario, onClose);
    fireEvent.click(screen.getByText("Sí"));
    await waitFor(() =>
      expect(onClose).toHaveBeenCalledWith("El usuario que intentas eliminar no existe."),
    );
  });

  it("maneja error de conexión correctamente", async () => {
    const onClose = jest.fn();
    const eliminarUsuario = jest.fn().mockRejectedValue({});
    renderDialog(eliminarUsuario, onClose);
    fireEvent.click(screen.getByText("Sí"));
    await waitFor(() =>
      expect(onClose).toHaveBeenCalledWith("Error de conexión. Intenta de nuevo más tarde."),
    );
  });

  it("flujo de confirmación forzada: muestra segundo diálogo y elimina al confirmar", async () => {
    const onClose = jest.fn();
    const eliminarUsuario = jest.fn().mockResolvedValue({});
    renderDialog(eliminarUsuario, onClose, true);
    // Primer confirmación
    fireEvent.click(screen.getByText("Sí"));
    // Debe aparecer el segundo diálogo
    expect(await screen.findByText(/Esta acción es irreversible/i)).toBeInTheDocument();
    // Confirmar eliminación definitiva
    fireEvent.click(screen.getByText("Sí, eliminar"));
    await waitFor(() => expect(onClose).toHaveBeenCalledWith("Usuario eliminado correctamente."));
    expect(eliminarUsuario).toHaveBeenCalledWith(1, true);
  });

  it("flujo de confirmación forzada: cancela en el segundo diálogo", async () => {
    const onClose = jest.fn();
    const eliminarUsuario = jest.fn();
    renderDialog(eliminarUsuario, onClose, true);
    fireEvent.click(screen.getByText("Sí"));
    expect(await screen.findByText(/Esta acción es irreversible/i)).toBeInTheDocument();
    // Hay dos botones "No", selecciona el del segundo diálogo
    const noButtons = screen.getAllByText("No");
    fireEvent.click(noButtons[1]);
    expect(onClose).toHaveBeenCalledWith("");
    expect(eliminarUsuario).not.toHaveBeenCalled();
  });
});

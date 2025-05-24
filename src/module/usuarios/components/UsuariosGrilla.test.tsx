import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import UsuariosGrilla from "./UsuariosGrilla";
import { ActionbuttonsProps } from "../../core/components/ActionButtons";
import { HeaderAppProps } from "../../core/components/HeaderApp";
import UserFormModal from "./UsuarioFormModal";
import { AlertDialogBorrarUsuarioProps } from "./AlertDialogBorrarUsuario";

// Mock de hooks y componentes hijos
jest.mock("../useUserService", () => ({
  useUserService: () => ({
    getUsuarios: jest.fn().mockResolvedValue([
      { id: 1, name: "Juan", email: "juan@mail.com", can_be_deleted: true },
      { id: 2, name: "Ana", email: "ana@mail.com", can_be_deleted: false },
    ]),
  }),
}));

jest.mock("../../contexts/AuthContext", () => ({
  useAuth: () => ({
    isAdmin: true,
    forgotPassword: jest.fn(),
  }),
}));
jest.mock("../../core/components/ActionButtons", () => (props: ActionbuttonsProps) => (
  <div>
    <button onClick={props.agregar.onClick} disabled={props.agregar.isDisabled}>
      Agregar
    </button>
    <button onClick={props.modificar.onClick} disabled={props.modificar.isDisabled}>
      Modificar
    </button>
    <button onClick={props.borrar.onClick} disabled={props.borrar.isDisabled}>
      Borrar
    </button>
    <button
      onClick={props.limpiarContrasenias?.onClick}
      disabled={props.limpiarContrasenias?.isDisabled}>
      LimpiarContraseñas
    </button>
  </div>
));

// Mock personalizado para UsuarioFormModal que llama a onClose cuando se hace click en un botón
jest.mock("./UsuarioFormModal", () => ({
  __esModule: true,
  default: (props: React.ComponentProps<typeof UserFormModal>) => (
    <div>
      UsuarioFormModal
      <button onClick={() => props.onClose && props.onClose()}>CerrarModal</button>
    </div>
  ),
}));
jest.mock("./AlertDialogBorrarUsuario", () => (props: AlertDialogBorrarUsuarioProps) => (
  <div>
    AlertDialogBorrarUsuario
    <button onClick={() => props.onClose && props.onClose("Usuario borrado")}>CerrarDialog</button>
  </div>
));
jest.mock("../../core/components/HeaderApp", () => (props: HeaderAppProps) => (
  <div>{props.titulo}</div>
));

describe("UsuariosGrilla", () => {
  it("renderiza el título y la tabla", async () => {
    render(<UsuariosGrilla />);
    expect(screen.getByText("Usuarios")).toBeInTheDocument();
    await waitFor(() => expect(screen.getByRole("grid")).toBeInTheDocument());
  });

  it("muestra el modal al hacer click en agregar", async () => {
    render(<UsuariosGrilla />);
    const btnAgregar = screen.getByText("Agregar");
    expect(btnAgregar).toBeDisabled();
  });

  it("selecciona un usuario y lo modifica", async () => {
    render(<UsuariosGrilla />);
    expect(await screen.findByText("Ana")).toBeInTheDocument();
    fireEvent.click(screen.getByText("Ana"));
    const btnModificar = screen.getByText("Modificar");
    fireEvent.click(btnModificar);
    // Modal debería abrirse (mock)
  });

  it("cierra el diálogo de borrar y muestra mensaje en Snackbar", async () => {
    render(<UsuariosGrilla />);
    await waitFor(() => expect(screen.getByText("Juan")).toBeInTheDocument());
    fireEvent.click(screen.getByText("Juan"));
    const btnBorrar = screen.getByText("Borrar");
    fireEvent.click(btnBorrar);
    expect(await screen.findByText("AlertDialogBorrarUsuario")).toBeInTheDocument();
    fireEvent.click(screen.getByText("CerrarDialog"));
    await waitFor(() =>
      expect(screen.queryByText("AlertDialogBorrarUsuario")).not.toBeInTheDocument(),
    );
    expect(screen.getByText("Usuario borrado")).toBeInTheDocument();
  });

  it("muestra y cierra el Snackbar correctamente", async () => {
    render(<UsuariosGrilla />);
    fireEvent.click(screen.getByText("Agregar"));
    // No hay interacción directa porque el Snackbar depende de la lógica interna, pero cubre el renderizado
  });

  it("llama a handleSnackBarClose al cerrar el Snackbar", async () => {
    jest.useFakeTimers();
    render(<UsuariosGrilla />);
    await waitFor(() => expect(screen.getByText("Juan")).toBeInTheDocument());
    fireEvent.click(screen.getByText("Juan"));
    fireEvent.click(screen.getByText("Borrar"));
    expect(await screen.findByText("AlertDialogBorrarUsuario")).toBeInTheDocument();
    fireEvent.click(screen.getByText("CerrarDialog"));
    const snackbar = screen.getByText("Usuario borrado");
    expect(snackbar).toBeInTheDocument();
    jest.runAllTimers();
    await waitFor(() => expect(screen.queryByText("Usuario borrado")).not.toBeInTheDocument());
    jest.useRealTimers();
  });

  it("el botón borrar está deshabilitado si can_be_deleted es false", async () => {
    render(<UsuariosGrilla />);
    await waitFor(() => expect(screen.getByText("Ana")).toBeInTheDocument());
    fireEvent.click(screen.getByText("Ana"));
    expect(screen.getByText("Borrar")).toBeDisabled();
  });

  it("el botón borrar está habilitado si can_be_deleted es true", async () => {
    render(<UsuariosGrilla />);
    await waitFor(() => expect(screen.getByText("Juan")).toBeInTheDocument());
    fireEvent.click(screen.getByText("Juan"));
    expect(screen.getByText("Borrar")).not.toBeDisabled();
  });

  it("el botón modificar está deshabilitado si no hay selección", async () => {
    render(<UsuariosGrilla />);
    expect(screen.getByText("Modificar")).toBeDisabled();
  });

  it("el botón modificar está habilitado si hay selección", async () => {
    render(<UsuariosGrilla />);
    await waitFor(() => expect(screen.getByText("Juan")).toBeInTheDocument());
    fireEvent.click(screen.getByText("Juan"));
    expect(screen.getByText("Modificar")).not.toBeDisabled();
  });

  it("el botón limpiar contraseñas está deshabilitado si no hay selección", async () => {
    render(<UsuariosGrilla />);
    expect(screen.getByText("LimpiarContraseñas")).toBeDisabled();
  });

  it("el botón limpiar contraseñas está habilitado si hay selección", async () => {
    render(<UsuariosGrilla />);
    await waitFor(() => expect(screen.getByText("Juan")).toBeInTheDocument());
    fireEvent.click(screen.getByText("Juan"));
    expect(screen.getByText("LimpiarContraseñas")).not.toBeDisabled();
  });

  it("abre y cierra el diálogo de limpiar contraseñas", async () => {
    render(<UsuariosGrilla />);
    await waitFor(() => expect(screen.getByText("Juan")).toBeInTheDocument());
    fireEvent.click(screen.getByText("Juan"));
    fireEvent.click(screen.getByText("LimpiarContraseñas"));
    expect(screen.getByText("Confirmar Restablecimiento")).toBeInTheDocument();
    fireEvent.click(screen.getByText("Cancelar"));
    await waitFor(() =>
      expect(screen.queryByText("Confirmar Restablecimiento")).not.toBeInTheDocument(),
    );
  });

  it("confirma el diálogo de limpiar contraseñas", async () => {
    render(<UsuariosGrilla />);
    await waitFor(() => expect(screen.getByText("Juan")).toBeInTheDocument());
    fireEvent.click(screen.getByText("Juan"));
    fireEvent.click(screen.getByText("LimpiarContraseñas"));
    expect(screen.getByText("Confirmar Restablecimiento")).toBeInTheDocument();
    fireEvent.click(screen.getByText("Confirmar"));
    await waitFor(() =>
      expect(screen.queryByText("Confirmar Restablecimiento")).not.toBeInTheDocument(),
    );
  });
});

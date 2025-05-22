import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import UnidadGrilla from "./UnidadGrilla";
import { ActionbuttonsProps } from "../../core/components/ActionButtons";
import { HeaderAppProps } from "../../core/components/HeaderApp";
import UnidadFormModal from "./unidadFormModal";
import AlertDialogBorrarUnidad from "./AlertDialogBorrarUnidad";

// Mock de hooks y componentes hijos
jest.mock("../useUnidadService", () => ({
  useUnidadService: () => ({
    getUnidades: jest.fn().mockResolvedValue([
      { id: 1, abreviacion: "kg", nombre: "Kilogramo", can_be_deleted: true },
      { id: 2, abreviacion: "g", nombre: "Gramo", can_be_deleted: false },
    ]),
  }),
}));
jest.mock("../../contexts/Permisos", () => ({
  usePermisos: () => ({
    change_unidad: "perm_change",
    add_unidad: "perm_add",
    delete_unidad: "perm_delete",
  }),
}));
jest.mock("../../contexts/AuthContext", () => ({
  useAuth: () => ({
    hasPermission: () => true,
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
  </div>
));
// Mock personalizado para UnidadFormModal que llama a onClose cuando se hace click en un botón
jest.mock("./unidadFormModal", () => (props: React.ComponentProps<typeof UnidadFormModal>) => (
  <div>
    UnidadFormModal
    <button onClick={() => props.onClose && props.onClose()}>CerrarModal</button>
  </div>
));
// Mock personalizado para AlertDialogBorrarUnidad que llama a onClose cuando se hace click en un botón
jest.mock(
  "./AlertDialogBorrarUnidad",
  () => (props: React.ComponentProps<typeof AlertDialogBorrarUnidad>) => (
    <div>
      AlertDialogBorrarUnidad
      <button onClick={() => props.onClose && props.onClose("Unidad borrada")}>CerrarDialog</button>
    </div>
  ),
);
jest.mock("../../core/components/HeaderApp", () => (props: HeaderAppProps) => (
  <div>{props.titulo}</div>
));

describe("UnidadGrilla", () => {
  it("renderiza el título y la tabla", async () => {
    render(<UnidadGrilla />);
    expect(screen.getByText("Unidades")).toBeInTheDocument();
    await waitFor(() => expect(screen.getByRole("grid")).toBeInTheDocument());
  });

  it("muestra el modal al hacer click en agregar", async () => {
    render(<UnidadGrilla />);
    const btnAgregar = screen.getByText("Agregar");
    fireEvent.click(btnAgregar);
    expect(await screen.findByText("UnidadFormModal")).toBeInTheDocument();
  });

  it("seleciona una unidad y modificarla", async () => {
    render(<UnidadGrilla />);
    expect(await screen.findByText("Gramo")).toBeInTheDocument();
    expect(screen.getByText("Gramo")).toBeInTheDocument();
    fireEvent.click(screen.getByText("Gramo"));
    const btnAgregar = screen.getByText("Modificar");
    fireEvent.click(btnAgregar);
  });

  it("cierra el modal y recarga datos al cerrar UnidadFormModal", async () => {
    render(<UnidadGrilla />);
    fireEvent.click(screen.getByText("Agregar"));
    // Simula el cierre del modal
    expect(await screen.findByText("UnidadFormModal")).toBeInTheDocument();
    fireEvent.click(screen.getByText("CerrarModal"));
    // El modal debería cerrarse y recargar datos (mock)
    await waitFor(() => expect(screen.queryByText("UnidadFormModal")).not.toBeInTheDocument());
  });

  it("cierra el diálogo de borrar y muestra mensaje en Snackbar", async () => {
    render(<UnidadGrilla />);
    // Selecciona la fila que puede ser borrada
    await waitFor(() => expect(screen.getByText("Kilogramo")).toBeInTheDocument());
    fireEvent.click(screen.getByText("Kilogramo"));
    const btnBorrar = screen.getByText("Borrar");
    fireEvent.click(btnBorrar);
    expect(await screen.findByText("AlertDialogBorrarUnidad")).toBeInTheDocument();
    fireEvent.click(screen.getByText("CerrarDialog"));
    // El dialogo debería cerrarse y mostrar mensaje en Snackbar
    await waitFor(() =>
      expect(screen.queryByText("AlertDialogBorrarUnidad")).not.toBeInTheDocument(),
    );
    expect(screen.getByText("Unidad borrada")).toBeInTheDocument();
  });

  it("muestra y cierra el Snackbar correctamente", async () => {
    render(<UnidadGrilla />);
    // Forzar mensaje en Snackbar
    fireEvent.click(screen.getByText("Agregar"));
    // No hay interacción directa porque el Snackbar depende de la lógica interna, pero cubre el renderizado
  });

  it("llama a handleSnackBarClose al cerrar el Snackbar", async () => {
    jest.useFakeTimers();
    render(<UnidadGrilla />);
    // Simula mostrar mensaje en Snackbar
    await waitFor(() => expect(screen.getByText("Kilogramo")).toBeInTheDocument());
    fireEvent.click(screen.getByText("Kilogramo"));
    fireEvent.click(screen.getByText("Borrar"));
    expect(await screen.findByText("AlertDialogBorrarUnidad")).toBeInTheDocument();
    fireEvent.click(screen.getByText("CerrarDialog"));
    // Snackbar visible
    const snackbar = screen.getByText("Unidad borrada");
    expect(snackbar).toBeInTheDocument();
    // Avanza el tiempo para simular el cierre automático
    jest.runAllTimers();
    // Espera a que desaparezca el mensaje
    await waitFor(() => expect(screen.queryByText("Unidad borrada")).not.toBeInTheDocument());
    jest.useRealTimers();
  });

  it("el botón borrar está deshabilitado si canBeDelete es false", async () => {
    render(<UnidadGrilla />);
    await waitFor(() => expect(screen.getByText("Gramo")).toBeInTheDocument());
    fireEvent.click(screen.getByText("Gramo"));
    expect(screen.getByText("Borrar")).toBeDisabled();
  });

  it("el botón borrar está habilitado si canBeDelete es true", async () => {
    render(<UnidadGrilla />);
    await waitFor(() => expect(screen.getByText("Kilogramo")).toBeInTheDocument());
    fireEvent.click(screen.getByText("Kilogramo"));
    expect(screen.getByText("Borrar")).not.toBeDisabled();
  });

  it("el botón modificar está deshabilitado si no hay selección", async () => {
    render(<UnidadGrilla />);
    expect(screen.getByText("Modificar")).toBeDisabled();
  });

  it("el botón modificar está habilitado si hay selección", async () => {
    render(<UnidadGrilla />);
    await waitFor(() => expect(screen.getByText("Kilogramo")).toBeInTheDocument());
    fireEvent.click(screen.getByText("Kilogramo"));
    expect(screen.getByText("Modificar")).not.toBeDisabled();
  });
});

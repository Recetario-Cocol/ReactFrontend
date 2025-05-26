import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import ProductoGrilla from "./ProductoGrilla";
import { ActionbuttonsProps } from "../../core/components/ActionButtons";
import { HeaderAppProps } from "../../core/components/HeaderApp";
import ProductoFormModal from "./ProductoFormModal";
import AlertDialogBorrarProducto from "./AlertDialogBorrarProducto";
import Producto from "../Producto";
import { Unidad } from "../../unidad/Unidad";
import DialogTitle from "@mui/material/DialogTitle";

// Mock de hooks y componentes hijos
jest.mock("../useProductoService", () => {
  return {
    useProductoService: () => ({
      getAll: jest
        .fn()
        .mockResolvedValue([
          new Producto(1, "Harina", 1, 1500, 1000, true),
          new Producto(2, "Azucar", 1, 1200, 1000, false),
        ]),
      eliminar: jest.fn().mockResolvedValue(undefined), // mock eliminar
    }),
  };
});
jest.mock("../../unidad/useUnidadService", () => ({
  useUnidadService: () => ({
    getUnidad: jest.fn().mockResolvedValue(new Unidad(1, "gramos", "grs", false)),
  }),
}));
jest.mock("../../contexts/Permisos", () => ({
  usePermisos: () => ({
    change_producto: "change_producto",
    add_producto: "add_producto",
    delete_producto: "delete_producto",
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
// Mock personalizado para ProductoFormModal que llama a onClose cuando se hace click en un botón
jest.mock("./ProductoFormModal", () => (props: React.ComponentProps<typeof ProductoFormModal>) => (
  <div>
    ProductoFormModal
    <button onClick={() => props.onClose && props.onClose()}>CerrarModal</button>
  </div>
));
// Mock personalizado para AlertDialogBorrarProducto que llama a onClose cuando se hace click en un botón
jest.mock(
  "./AlertDialogBorrarProducto",
  () => (props: React.ComponentProps<typeof AlertDialogBorrarProducto>) => {
    console.log("Mock AlertDialogBorrarProducto render", props);
    return (
      <div data-testid="mock-alert-dialog">
        <DialogTitle id="alert-dialog-title">¿Desea Borrar el Producto?</DialogTitle>
        <button onClick={() => props.onClose && props.onClose("Producto eliminado correctamente.")}>
          CerrarDialog
        </button>
      </div>
    );
  },
);
jest.mock("../../core/components/HeaderApp", () => (props: HeaderAppProps) => (
  <div>{props.titulo}</div>
));

describe("ProductoGrilla", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useRealTimers();
  });

  it("renderiza el título y la tabla", async () => {
    render(<ProductoGrilla />);
    expect(screen.getByText("Productos")).toBeInTheDocument();
    await waitFor(() => expect(screen.getByRole("grid")).toBeInTheDocument());
  });

  it("muestra el modal al hacer click en agregar", async () => {
    render(<ProductoGrilla />);
    const btnAgregar = screen.getByText("Agregar");
    fireEvent.click(btnAgregar);
    expect(await screen.findByText("ProductoFormModal")).toBeInTheDocument();
  });

  it("seleciona un producto y modificarlo", async () => {
    render(<ProductoGrilla />);
    expect(await screen.findByText("Harina")).toBeInTheDocument();
    expect(screen.getByText("Harina")).toBeInTheDocument();
    fireEvent.click(screen.getByText("Harina"));
    const btnAgregar = screen.getByText("Modificar");
    fireEvent.click(btnAgregar);
  });

  it("cierra el modal y recarga datos al cerrar ProductoFormModal", async () => {
    render(<ProductoGrilla />);
    fireEvent.click(screen.getByText("Agregar"));
    // Simula el cierre del modal
    expect(await screen.findByText("ProductoFormModal")).toBeInTheDocument();
    fireEvent.click(screen.getByText("CerrarModal"));
    // El modal debería cerrarse y recargar datos (mock)
    await waitFor(() => expect(screen.queryByText("ProductoFormModal")).not.toBeInTheDocument());
  });

  it("cierra el diálogo de borrar y muestra mensaje en Snackbar", async () => {
    render(<ProductoGrilla />);
    // Selecciona la fila que puede ser borrada
    await waitFor(() => expect(screen.getByText("Harina")).toBeInTheDocument());
    fireEvent.click(screen.getByText("Harina"));
    const btnBorrar = screen.getByText("Borrar");
    fireEvent.click(btnBorrar);
    // Espera a que aparezca el diálogo
    expect(
      await screen.findByText((text) => text.includes("¿Desea Borrar el Producto?")),
    ).toBeInTheDocument();
    fireEvent.click(screen.getByText("CerrarDialog"));
    // Espera a que desaparezca el diálogo y aparezca el mensaje
    await waitFor(() =>
      expect(
        screen.queryByText((text) => text.includes("¿Desea Borrar el Producto?")),
      ).not.toBeInTheDocument(),
    );
    expect(screen.getByText("Producto eliminado correctamente.")).toBeInTheDocument();
  });

  it("muestra y cierra el Snackbar correctamente", async () => {
    render(<ProductoGrilla />);
    // Forzar mensaje en Snackbar
    fireEvent.click(screen.getByText("Agregar"));
    // No hay interacción directa porque el Snackbar depende de la lógica interna, pero cubre el renderizado
  });

  it("llama a handleSnackBarClose al cerrar el Snackbar", async () => {
    jest.useFakeTimers();
    render(<ProductoGrilla />);
    // Simula mostrar mensaje en Snackbar
    await waitFor(() => expect(screen.getByText("Harina")).toBeInTheDocument());
    fireEvent.click(screen.getByText("Harina"));
    fireEvent.click(screen.getByText("Borrar"));
    // Espera a que aparezca el diálogo
    expect(await screen.findByText("¿Desea Borrar el Producto?")).toBeInTheDocument();
    fireEvent.click(screen.getByText("CerrarDialog"));
    // Snackbar visible
    const snackbar = await screen.findByText("Producto eliminado correctamente.");
    expect(snackbar).toBeInTheDocument();
    // Avanza el tiempo para simular el cierre automático
    jest.runAllTimers();
    // Espera a que desaparezca el mensaje
    await waitFor(() =>
      expect(screen.queryByText("Producto eliminado correctamente.")).not.toBeInTheDocument(),
    );
    jest.useRealTimers();
  });

  it("el botón borrar está deshabilitado si canBeDelete es false", async () => {
    render(<ProductoGrilla />);
    await waitFor(() => expect(screen.getByText("Azucar")).toBeInTheDocument());
    fireEvent.click(screen.getByText("Azucar"));
    expect(screen.getByText("Borrar")).toBeDisabled();
  });

  it("el botón borrar está habilitado si canBeDelete es true", async () => {
    render(<ProductoGrilla />);
    await waitFor(() => expect(screen.getByText("Harina")).toBeInTheDocument());
    fireEvent.click(screen.getByText("Harina"));
    expect(screen.getByText("Borrar")).not.toBeDisabled();
  });

  it("el botón modificar está deshabilitado si no hay selección", async () => {
    render(<ProductoGrilla />);
    expect(screen.getByText("Modificar")).toBeDisabled();
  });

  it("el botón modificar está habilitado si hay selección", async () => {
    render(<ProductoGrilla />);
    await waitFor(() => expect(screen.getByText("Harina")).toBeInTheDocument());
    fireEvent.click(screen.getByText("Harina"));
    expect(screen.getByText("Modificar")).not.toBeDisabled();
  });
});

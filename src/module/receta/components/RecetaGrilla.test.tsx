import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import RecetaGrilla from "./RecetaGrilla";
import { ActionbuttonsProps } from "../../core/components/ActionButtons";
import { HeaderAppProps } from "../../core/components/HeaderApp";
import RecetaFormModal from "./RecetaFormModal";
import AlertDialogBorrarReceta from "./AlertDialogBorrarReceta";
import DialogTitle from "@mui/material/DialogTitle";

// Mock de hooks y componentes hijos
jest.mock("../useRecetaService", () => {
  return {
    useRecetaService: () => ({
      getGrilla: jest.fn().mockResolvedValue([
        { id: 1, nombre: "Tarta", ingredientes: "Harina, Huevo" },
        { id: 2, nombre: "Bizcochuelo", ingredientes: "Azucar, Huevo" },
      ]),
      eliminar: jest.fn().mockResolvedValue(undefined),
    }),
  };
});
jest.mock("../../contexts/Permisos", () => ({
  usePermisos: () => ({
    change_receta: "change_receta",
    add_receta: "add_receta",
    delete_receta: "delete_receta",
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
// Mock personalizado para RecetaFormModal que llama a onClose cuando se hace click en un botón
jest.mock("./RecetaFormModal", () => (props: React.ComponentProps<typeof RecetaFormModal>) => (
  <div>
    RecetaFormModal
    <button onClick={() => props.onClose && props.onClose()}>CerrarModal</button>
  </div>
));
// Mock personalizado para AlertDialogBorrarReceta que llama a onClose cuando se hace click en un botón
jest.mock(
  "./AlertDialogBorrarReceta",
  () => (props: React.ComponentProps<typeof AlertDialogBorrarReceta>) => {
    return (
      <div data-testid="mock-alert-dialog">
        <DialogTitle id="alert-dialog-title">¿Desea Borrar la Receta?</DialogTitle>
        <button onClick={() => props.onClose && props.onClose("Receta eliminada correctamente.")}>
          CerrarDialog
        </button>
      </div>
    );
  },
);
jest.mock("../../core/components/HeaderApp", () => (props: HeaderAppProps) => (
  <div>{props.titulo}</div>
));

describe("RecetaGrilla", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useRealTimers();
  });

  it("renderiza el título y la tabla", async () => {
    render(<RecetaGrilla />);
    expect(screen.getByText("Recetas")).toBeInTheDocument();
    await waitFor(() => expect(screen.getByRole("grid")).toBeInTheDocument());
  });

  it("muestra el modal al hacer click en agregar", async () => {
    render(<RecetaGrilla />);
    const btnAgregar = screen.getByText("Agregar");
    fireEvent.click(btnAgregar);
    expect(await screen.findByText("RecetaFormModal")).toBeInTheDocument();
  });

  it("selecciona una receta y modificarla", async () => {
    render(<RecetaGrilla />);
    expect(await screen.findByText("Tarta")).toBeInTheDocument();
    fireEvent.click(screen.getByText("Tarta"));
    const btnModificar = screen.getByText("Modificar");
    fireEvent.click(btnModificar);
  });

  it("cierra el modal y recarga datos al cerrar RecetaFormModal", async () => {
    render(<RecetaGrilla />);
    fireEvent.click(screen.getByText("Agregar"));
    expect(await screen.findByText("RecetaFormModal")).toBeInTheDocument();
    fireEvent.click(screen.getByText("CerrarModal"));
    await waitFor(() => expect(screen.queryByText("RecetaFormModal")).not.toBeInTheDocument());
  });

  it("cierra el diálogo de borrar y muestra mensaje", async () => {
    render(<RecetaGrilla />);
    await waitFor(() => expect(screen.getByText("Tarta")).toBeInTheDocument());
    fireEvent.click(screen.getByText("Tarta"));
    const btnBorrar = screen.getByText("Borrar");
    fireEvent.click(btnBorrar);
    expect(
      await screen.findByText((text) => text.includes("¿Desea Borrar la Receta?")),
    ).toBeInTheDocument();
    fireEvent.click(screen.getByText("CerrarDialog"));
    await waitFor(() =>
      expect(
        screen.queryByText((text) => text.includes("¿Desea Borrar la Receta?")),
      ).not.toBeInTheDocument(),
    );
    expect(screen.getByText("Receta eliminada correctamente.")).toBeInTheDocument();
  });

  it("el botón modificar está deshabilitado si no hay selección", async () => {
    render(<RecetaGrilla />);
    expect(screen.getByText("Modificar")).toBeDisabled();
  });

  it("el botón modificar está habilitado si hay selección", async () => {
    render(<RecetaGrilla />);
    await waitFor(() => expect(screen.getByText("Tarta")).toBeInTheDocument());
    fireEvent.click(screen.getByText("Tarta"));
    expect(screen.getByText("Modificar")).not.toBeDisabled();
  });

  it("el botón borrar está deshabilitado si no hay selección", async () => {
    render(<RecetaGrilla />);
    expect(screen.getByText("Borrar")).toBeDisabled();
  });

  it("el botón borrar está habilitado si hay selección", async () => {
    render(<RecetaGrilla />);
    await waitFor(() => expect(screen.getByText("Tarta")).toBeInTheDocument());
    fireEvent.click(screen.getByText("Tarta"));
    expect(screen.getByText("Borrar")).not.toBeDisabled();
  });
});

import { render, screen, fireEvent } from "@testing-library/react";
import UnidadFormModal from "./unidadFormModal";
import { Unidad } from "../Unidad";

// Mock del servicio
const mockGetUnidad = jest.fn((id) => Promise.resolve(new Unidad(id, "Nombre", "Abv")));
const mockActualizarUnidad = jest.fn(() => Promise.resolve());
const mockCrearUnidad = jest.fn(() => Promise.resolve());

jest.mock("../useUnidadService", () => ({
  useUnidadService: () => ({
    getUnidad: mockGetUnidad,
    actualizarUnidad: mockActualizarUnidad,
    crearUnidad: mockCrearUnidad,
  }),
}));

describe("UnidadFormModal", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("debería renderizar los campos y botones del modal", async () => {
    render(<UnidadFormModal openArg={true} onClose={jest.fn()} idToOpen={0} />);
    expect(screen.getByRole("heading", { name: /Unidad/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/^Id$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^Nombre$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^Abreviación$/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Enviar/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Cancelar/i })).toBeInTheDocument();
  });

  it("debería mostrar error si se envía sin nombre", () => {
    render(<UnidadFormModal openArg={true} onClose={jest.fn()} idToOpen={0} />);
    fireEvent.change(screen.getByLabelText(/^Nombre$/i), { target: { value: "" } });
    fireEvent.change(screen.getByLabelText(/^Abreviación$/i), { target: { value: "kg" } });
    fireEvent.click(screen.getByRole("button", { name: /Enviar/i }));
    expect(screen.getByText(/Ingrese un nombre/i)).toBeInTheDocument();
  });

  it("debería mostrar error si se envía sin abreviación", () => {
    render(<UnidadFormModal openArg={true} onClose={jest.fn()} idToOpen={0} />);
    fireEvent.change(screen.getByLabelText(/^Nombre$/i), { target: { value: "Kilo" } });
    fireEvent.change(screen.getByLabelText(/^Abreviación$/i), { target: { value: "" } });
    fireEvent.click(screen.getByRole("button", { name: /Enviar/i }));
    expect(screen.getByText(/Ingrese una abreviacion/i)).toBeInTheDocument();
  });

  it("debería llamar crearUnidad al enviar datos válidos", async () => {
    const onClose = jest.fn();
    render(<UnidadFormModal openArg={true} onClose={onClose} idToOpen={0} />);
    fireEvent.change(screen.getByLabelText(/^Nombre$/i), { target: { value: "Kilo" } });
    fireEvent.change(screen.getByLabelText(/^Abreviación$/i), { target: { value: "kg" } });
    fireEvent.click(screen.getByRole("button", { name: /Enviar/i }));
    // Espera a que se cierre el modal (onClose llamado)
    await screen.findByRole("heading", { name: /Unidad/i });
    expect(onClose).toHaveBeenCalled();
    expect(mockCrearUnidad).toHaveBeenCalledWith(
      expect.objectContaining({ nombre: "Kilo", abreviacion: "kg" }),
    );
  });

  it("debería llamar actualizarUnidad al enviar datos válidos con id existente", async () => {
    const onClose = jest.fn();
    render(<UnidadFormModal openArg={true} onClose={onClose} idToOpen={123} />);
    // Espera a que se cargue el form con getUnidad
    await screen.findByDisplayValue("Nombre");
    fireEvent.change(screen.getByLabelText(/^Nombre$/i), { target: { value: "NuevoNombre" } });
    fireEvent.change(screen.getByLabelText(/^Abreviación$/i), { target: { value: "NN" } });
    fireEvent.click(screen.getByRole("button", { name: /Enviar/i }));
    await screen.findByRole("heading", { name: /Unidad/i });
    expect(onClose).toHaveBeenCalled();
    expect(mockActualizarUnidad).toHaveBeenCalledWith(
      123,
      expect.objectContaining({ nombre: "NuevoNombre", abreviacion: "NN" }),
    );
  });

  it("debería llamar getUnidad si idToOpen es distinto de 0", async () => {
    render(<UnidadFormModal openArg={true} onClose={jest.fn()} idToOpen={42} />);
    expect(mockGetUnidad).toHaveBeenCalledWith(42);
    await screen.findByDisplayValue("Nombre");
  });

  it("no debería llamar getUnidad si idToOpen es 0", async () => {
    render(<UnidadFormModal openArg={true} onClose={jest.fn()} idToOpen={0} />);
    expect(mockGetUnidad).not.toHaveBeenCalled();
  });
});

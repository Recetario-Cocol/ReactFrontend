import { act } from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import UnidadFormModal from "./unidadFormModal";
import { Unidad } from "../Unidad";
import { useUnidadService } from "../useUnidadService";

// Mock del servicio
jest.mock("../useUnidadService");
const mockUseUnidadService = useUnidadService as jest.Mock;

// Mock de showConfirmDialog
jest.mock("../../core/components/ConfirmDialog", () => ({
  showConfirmDialog: jest.fn(),
}));
import { showConfirmDialog } from "../../core/components/ConfirmDialog";
const mockShowConfirmDialog = showConfirmDialog as jest.Mock;

describe("UnidadFormModal", () => {
  const mockOnClose = jest.fn();

  const unidadEjemplo: Unidad = new Unidad(1, "Kilogramo", "Kg");
  const actualizarUnidad = jest.fn().mockResolvedValue({});
  const crearUnidad = jest.fn().mockResolvedValue({});
  beforeEach(() => {
    jest.clearAllMocks();

    mockUseUnidadService.mockReturnValue({
      getUnidad: jest.fn(() => Promise.resolve(unidadEjemplo)),
      crearUnidad: crearUnidad,
      actualizarUnidad: actualizarUnidad,
    });
  });

  it("debería renderizar los campos del formulario y el título", async () => {
    render(<UnidadFormModal openArg={true} onClose={mockOnClose} idToOpen={1} />);

    expect(await screen.findByRole("heading", { name: /unidad/i })).toBeInTheDocument();
    const nombreInput = await screen.findByLabelText(/nombre/i);
    const abreviacionInput = await screen.findByLabelText(/abreviación/i);
    await waitFor(() => {
      expect(nombreInput).toHaveValue("Kilogramo");
      expect(abreviacionInput).toHaveValue("Kg");
    });
  });

  it("debería mostrar validaciones si se dejan campos vacíos", async () => {
    render(<UnidadFormModal openArg={true} onClose={mockOnClose} idToOpen={0} />);

    fireEvent.click(await screen.findByRole("button", { name: /enviar/i }));

    await waitFor(() => {
      expect(screen.getByText(/Ingrese un Nombre/i)).toBeInTheDocument();
      expect(screen.getByText(/Ingrese una abreviacion/i)).toBeInTheDocument();
    });
  });

  it("debería llamar a actualizarUnidad si idToOpen es distinto de 0", async () => {
    render(<UnidadFormModal openArg={true} onClose={mockOnClose} idToOpen={1} />);

    fireEvent.change(await screen.findByLabelText(/Nombre/i), {
      target: { value: "Litro" },
    });

    fireEvent.click(screen.getByRole("button", { name: /enviar/i }));

    await waitFor(() => {
      expect(actualizarUnidad).toHaveBeenCalledWith(
        1,
        expect.objectContaining({ nombre: "Litro" }),
      );
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  it("debería llamar a crearUnidad si idToOpen es 0", async () => {
    render(<UnidadFormModal openArg={true} onClose={mockOnClose} idToOpen={0} />);

    fireEvent.change(await screen.findByLabelText(/Nombre/i), {
      target: { value: "Metro" },
    });

    fireEvent.change(screen.getByLabelText(/Abreviación/i), {
      target: { value: "m" },
    });

    fireEvent.click(screen.getByRole("button", { name: /enviar/i }));

    await waitFor(() => {
      expect(crearUnidad).toHaveBeenCalledWith(
        expect.objectContaining({ nombre: "Metro", abreviacion: "m" }),
      );
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  it("debería mostrar mensaje de error si crearUnidad falla", async () => {
    crearUnidad.mockRejectedValueOnce(new Error("Error al crear unidad"));
    render(<UnidadFormModal openArg={true} onClose={mockOnClose} idToOpen={0} />);
    fireEvent.change(await screen.findByLabelText(/Nombre/i), {
      target: { value: "Metro" },
    });
    fireEvent.change(screen.getByLabelText(/Abreviación/i), {
      target: { value: "m" },
    });
    fireEvent.click(screen.getByRole("button", { name: /enviar/i }));
    await waitFor(() =>
      expect(screen.getByText(/Error al tratar de crear la unidad/i)).toBeInTheDocument(),
    );
  });

  it("debería cerrar directamente si no hay cambios en el formulario", async () => {
    render(<UnidadFormModal openArg={true} onClose={mockOnClose} idToOpen={0} />);

    fireEvent.click(screen.getByRole("button", { name: /close/i }));

    expect(mockOnClose).toHaveBeenCalled();
  });

  it("debería mostrar confirmación si hay cambios en el formulario", async () => {
    render(<UnidadFormModal openArg={true} onClose={mockOnClose} idToOpen={0} />);

    // Simular cambio en input para que isDirty se vuelva true
    fireEvent.change(await screen.findByLabelText(/Nombre/i), {
      target: { value: "Litro" },
    });

    fireEvent.click(screen.getByRole("button", { name: /close/i }));

    expect(mockShowConfirmDialog).toHaveBeenCalledWith({
      question: "Tenés cambios sin guardar. ¿Estás seguro de que querés salir?",
      onYes: expect.any(Function),
      onNo: expect.any(Function),
    });
  });

  it("debería cerrar si el usuario confirma en el diálogo", async () => {
    render(<UnidadFormModal openArg={true} onClose={mockOnClose} idToOpen={0} />);

    fireEvent.change(await screen.findByLabelText(/Nombre/i), {
      target: { value: "Litro" },
    });

    fireEvent.click(screen.getByRole("button", { name: /close/i }));

    // Obtener el onYes pasado al mock
    const { onYes } = mockShowConfirmDialog.mock.calls[0][0];

    act(() => {
      onYes(); // simular click en "Sí"
    });

    expect(mockOnClose).toHaveBeenCalled();
  });

  it("no debería cerrar si el usuario elige 'No' en el diálogo", async () => {
    render(<UnidadFormModal openArg={true} onClose={mockOnClose} idToOpen={0} />);

    fireEvent.change(await screen.findByLabelText(/Nombre/i), {
      target: { value: "Litro" },
    });

    fireEvent.click(screen.getByRole("button", { name: /close/i }));

    // Obtener el onNo pasado al mock
    const { onNo } = mockShowConfirmDialog.mock.calls[0][0];

    act(() => {
      onNo(); // simular click en "No"
    });

    expect(mockOnClose).not.toHaveBeenCalled();
  });
});

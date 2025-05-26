import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import RecetaFormModal from "./RecetaFormModal";
import Receta from "../Receta";
import Producto from "../../producto/Producto";
import { Unidad } from "../../unidad/Unidad";
import Ingrediente from "../../ingrediente/Ingrediente";

// Mocks reutilizables
const mockGetReceta = jest.fn();
const mockCrearReceta = jest.fn();
const mockActualizarReceta = jest.fn();
const mockGetAllProductos = jest.fn();
const mockGetUnidades = jest.fn();

jest.mock("../useRecetaService", () => ({
  useRecetaService: () => ({
    get: mockGetReceta,
    crear: mockCrearReceta,
    actualizar: mockActualizarReceta,
  }),
}));
jest.mock("../../producto/useProductoService", () => ({
  useProductoService: () => ({
    getAll: mockGetAllProductos,
  }),
}));
jest.mock("../../unidad/useUnidadService", () => ({
  useUnidadService: () => ({
    getUnidades: mockGetUnidades,
  }),
}));

const productos = [new Producto(1, "Harina", 1, 100, 1), new Producto(2, "Azúcar", 2, 200, 2)];
const unidades = [new Unidad(1, "Kilo", "kg"), new Unidad(2, "Gramo", "g")];
const ingredientes = [new Ingrediente(1, 1, 1, 2), new Ingrediente(2, 2, 2, 3)];
const receta = new Receta(1, "Bizcochuelo", 8, ingredientes, "Rica receta");

beforeEach(() => {
  jest.clearAllMocks();
  mockGetAllProductos.mockResolvedValue(productos);
  mockGetUnidades.mockResolvedValue(unidades);
  mockGetReceta.mockResolvedValue(receta);
  mockCrearReceta.mockResolvedValue({});
  mockActualizarReceta.mockResolvedValue({});
});

describe("RecetaFormModal", () => {
  it("debería renderizar los campos principales y botones", async () => {
    render(<RecetaFormModal openArg={true} idToOpen={0} onClose={jest.fn()} />);
    await waitFor(() => expect(screen.getByLabelText(/Nombre/i)).toBeInTheDocument());
    expect(screen.getByLabelText(/Rinde:$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Observaciones/i)).toBeInTheDocument();

    expect(screen.getByTestId("enviar-btn")).toBeInTheDocument();
    expect(screen.getByTestId("cancelar-btn")).toBeInTheDocument();
    expect(screen.getByText(/Ingredientes/i)).toBeInTheDocument();
  });

  it("debería mostrar error si se envía sin nombre", async () => {
    render(<RecetaFormModal openArg={true} idToOpen={0} onClose={jest.fn()} />);
    await waitFor(() => expect(screen.getByTestId("enviar-btn")).toBeInTheDocument());
    fireEvent.click(screen.getByTestId("enviar-btn"));
    expect(await screen.findByText(/Ingrese un nombre/i)).toBeInTheDocument();
  });

  it("debería mostrar error si se envía sin rinde", async () => {
    render(<RecetaFormModal openArg={true} idToOpen={0} onClose={jest.fn()} />);
    await waitFor(() => expect(screen.getByTestId("enviar-btn")).toBeInTheDocument());
    fireEvent.change(screen.getByLabelText(/Nombre/i), { target: { value: "Torta" } });
    fireEvent.click(screen.getByTestId("enviar-btn"));
    expect(
      await screen.findByText(/Ingrese cuantas porciones rinde la receta/i),
    ).toBeInTheDocument();
  });

  it("debería mostrar error si no hay ingredientes", async () => {
    render(<RecetaFormModal openArg={true} idToOpen={0} onClose={jest.fn()} />);
    await waitFor(() => expect(screen.getByTestId("enviar-btn")).toBeInTheDocument());
    fireEvent.change(screen.getByLabelText(/Nombre/i), { target: { value: "Torta" } });
    fireEvent.change(screen.getByLabelText(/^Rinde:$/i), { target: { value: "8" } });
    fireEvent.click(screen.getByTestId("enviar-btn"));
    expect(await screen.findByText(/Ingrese al menos un ingrediente/i)).toBeInTheDocument();
  });

  it("debería llamar crear si el formulario es válido y es nueva receta", async () => {
    render(<RecetaFormModal openArg={true} idToOpen={0} onClose={jest.fn()} />);
    await waitFor(() => expect(screen.getByTestId("enviar-btn")).toBeInTheDocument());
    fireEvent.change(screen.getByLabelText(/Nombre/i), { target: { value: "Torta" } });
    fireEvent.change(screen.getByLabelText(/^Rinde:$/i), { target: { value: "8" } });

    // Abrir modal de ingrediente
    fireEvent.click(screen.getByRole("button", { name: /Agregar/i }));
    // Esperar modal ingrediente
    await waitFor(() => expect(screen.getByText(/Ingrediente/i)).toBeInTheDocument());

    // Seleccionar producto
    fireEvent.mouseDown(screen.getByLabelText(/Producto/i));
    await waitFor(() =>
      expect(screen.getByRole("option", { name: /Harina/i })).toBeInTheDocument(),
    );
    fireEvent.click(screen.getByRole("option", { name: /Harina/i }));

    // Ingresar cantidad
    fireEvent.change(screen.getByLabelText(/Cantidad/i), { target: { value: "2" } });

    // Guardar ingrediente
    fireEvent.click(screen.getByRole("button", { name: /Enviar/i }));

    // Enviar
    fireEvent.click(screen.getByTestId("enviar-btn"));
    await waitFor(() => expect(mockCrearReceta).toHaveBeenCalled());
  });

  it("debería llamar actualizar si idToOpen es distinto de 0", async () => {
    render(<RecetaFormModal openArg={true} idToOpen={1} onClose={jest.fn()} />);
    await waitFor(() => expect(mockGetReceta).toHaveBeenCalledWith(1));
    await waitFor(() => expect(screen.getByLabelText(/Nombre/i)).toHaveValue("Bizcochuelo"));
    fireEvent.change(screen.getByLabelText(/Nombre/i), {
      target: { value: "Bizcochuelo Editado" },
    });
    fireEvent.click(screen.getByTestId("enviar-btn"));
    await waitFor(() => expect(mockActualizarReceta).toHaveBeenCalled());
  });

  it("debería mostrar mensaje de error si el service.crear falla", async () => {
    mockCrearReceta.mockRejectedValueOnce(new Error("Error al crear receta"));
    render(<RecetaFormModal openArg={true} idToOpen={0} onClose={jest.fn()} />);
    await waitFor(() => expect(screen.getByTestId("enviar-btn")).toBeInTheDocument());
    fireEvent.change(screen.getByLabelText(/Nombre/i), { target: { value: "Torta" } });
    fireEvent.change(screen.getByLabelText(/^Rinde:$/i), { target: { value: "8" } });
    fireEvent.change(screen.getByLabelText(/^observaciones$/i), {
      target: { value: "pasos a seguir" },
    });

    // Agrega ingrediente como en el test exitoso
    fireEvent.click(screen.getByRole("button", { name: /Agregar/i }));
    await waitFor(() => expect(screen.getByText(/Ingrediente/i)).toBeInTheDocument());
    fireEvent.mouseDown(screen.getByLabelText(/Producto/i));
    await waitFor(() =>
      expect(screen.getByRole("option", { name: /Harina/i })).toBeInTheDocument(),
    );
    fireEvent.click(screen.getByRole("option", { name: /Harina/i }));
    fireEvent.mouseDown(screen.getByLabelText(/Unidad/i));
    fireEvent.change(screen.getByLabelText(/Cantidad/i), { target: { value: "2" } });
    fireEvent.click(screen.getByRole("button", { name: /Enviar/i }));

    fireEvent.click(screen.getByRole("button", { name: /Enviar/i }));
    await waitFor(() => expect(mockCrearReceta).toHaveBeenCalled());
    await waitFor(() => expect(screen.getByText(/Error al crear la receta./i)).toBeInTheDocument());
  });

  it("debería mostrar mensaje de error si el service.actualizar falla", async () => {
    mockActualizarReceta.mockRejectedValueOnce(new Error("Error al actualizar receta"));
    render(<RecetaFormModal openArg={true} idToOpen={1} onClose={jest.fn()} />);
    await waitFor(() => expect(mockGetReceta).toHaveBeenCalledWith(1));
    fireEvent.change(screen.getByLabelText(/Nombre/i), {
      target: { value: "Bizcochuelo Editado" },
    });
    fireEvent.click(screen.getByTestId("enviar-btn"));
    await waitFor(() => expect(mockActualizarReceta).toHaveBeenCalled());
    await waitFor(() =>
      expect(screen.getByText(/Error al actualizar la receta./i)).toBeInTheDocument(),
    );
  });

  it("debería llamar getUnidades y getAll productos al montar", async () => {
    render(<RecetaFormModal openArg={true} idToOpen={0} onClose={jest.fn()} />);
    await waitFor(() => expect(mockGetUnidades).toHaveBeenCalled());
    await waitFor(() => expect(mockGetAllProductos).toHaveBeenCalled());
  });

  it("debería llamar get del service de receta si idToOpen > 0", async () => {
    render(<RecetaFormModal openArg={true} idToOpen={2} onClose={jest.fn()} />);
    await waitFor(() => expect(mockGetReceta).toHaveBeenCalledWith(2));
  });
});

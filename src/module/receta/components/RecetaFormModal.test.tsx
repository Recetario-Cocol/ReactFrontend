import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
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
    get: jest.fn((id) => Promise.resolve(mockGetReceta(id))),
    crear: jest.fn(() => Promise.resolve(mockCrearReceta())),
    actualizar: jest.fn(() => Promise.resolve(mockActualizarReceta())),
  }),
}));
jest.mock("../../producto/useProductoService", () => ({
  useProductoService: () => ({
    getAll: jest.fn(() => Promise.resolve(mockGetAllProductos())),
  }),
}));
jest.mock("../../unidad/useUnidadService", () => ({
  useUnidadService: () => ({
    getUnidades: jest.fn(() => Promise.resolve(mockGetUnidades())),
  }),
}));
jest.mock("../../core/components/ConfirmDialog", () => ({
  showConfirmDialog: jest.fn(),
}));
import { showConfirmDialog } from "../../core/components/ConfirmDialog";
const mockShowConfirmDialog = showConfirmDialog as jest.Mock;

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
    await waitFor(() => expect(screen.getByLabelText(/Nombre/i)).toBeInTheDocument(), {
      timeout: 2000,
    });
    expect(screen.getByLabelText(/Rinde:$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Observaciones/i)).toBeInTheDocument();
    expect(screen.getByTestId("enviar-btn")).toBeInTheDocument();
    expect(screen.getByTestId("cancelar-btn")).toBeInTheDocument();
    expect(screen.getByText(/Ingredientes/i)).toBeInTheDocument();
  });

  it("debería mostrar error si se envía sin nombre", async () => {
    const user = userEvent.setup();
    render(<RecetaFormModal openArg={true} idToOpen={0} onClose={jest.fn()} />);
    await waitFor(() => expect(screen.getByTestId("enviar-btn")).toBeInTheDocument(), {
      timeout: 2000,
    });
    await user.click(screen.getByTestId("enviar-btn"));
    expect(
      await screen.findByText(/Ingrese un nombre/i, {}, { timeout: 2000 }),
    ).toBeInTheDocument();
  });

  it("debería mostrar error si se envía sin rinde", async () => {
    const user = userEvent.setup();
    render(<RecetaFormModal openArg={true} idToOpen={0} onClose={jest.fn()} />);
    await waitFor(() => expect(screen.getByTestId("enviar-btn")).toBeInTheDocument(), {
      timeout: 2000,
    });
    await user.type(screen.getByLabelText(/Nombre/i), "Torta");
    await user.click(screen.getByTestId("enviar-btn"));
    expect(
      await screen.findByText(/Ingrese cuantas porciones rinde la receta/i, {}, { timeout: 2000 }),
    ).toBeInTheDocument();
  });

  it("debería mostrar error si no hay ingredientes", async () => {
    const user = userEvent.setup();
    render(<RecetaFormModal openArg={true} idToOpen={0} onClose={jest.fn()} />);
    await waitFor(() => expect(screen.getByTestId("enviar-btn")).toBeInTheDocument(), {
      timeout: 2000,
    });
    await user.type(screen.getByLabelText(/Nombre/i), "Torta");
    await user.type(screen.getByLabelText(/^Rinde:$/i), "8");
    await user.click(screen.getByTestId("enviar-btn"));
    expect(
      await screen.findByText(/Ingrese al menos un ingrediente/i, {}, { timeout: 2000 }),
    ).toBeInTheDocument();
  });

  it("debería llamar crear si el formulario es válido y es nueva receta", async () => {
    const user = userEvent.setup();
    render(<RecetaFormModal openArg={true} idToOpen={0} onClose={jest.fn()} />);
    await waitFor(() => expect(screen.getByText(/Ingredientes/i)).toBeInTheDocument(), {
      timeout: 2000,
    });

    await user.type(screen.getByLabelText(/Nombre/i), "Torta");
    await user.type(screen.getByLabelText(/^Rinde:$/i), "8");
    expect(screen.getByLabelText(/Nombre/i)).toHaveValue("Torta");

    await user.click(screen.getByRole("button", { name: /Agregar/i }));
    await waitFor(
      () => expect(screen.getByRole("dialog", { name: /Ingrediente/i })).toBeInTheDocument(),
      { timeout: 2000 },
    );

    // Seleccionar producto
    await user.click(screen.getByLabelText(/Producto/i));
    await waitFor(
      () => expect(screen.getByRole("option", { name: /Harina/i })).toBeInTheDocument(),
      { timeout: 2000 },
    );
    await user.click(screen.getByRole("option", { name: /Harina/i }));

    await user.type(screen.getByLabelText(/Cantidad/i), "2");
    await user.click(screen.getByRole("button", { name: /Guardar/i }));

    await waitFor(() => expect(screen.getByText(/Harina/i)).toBeInTheDocument(), { timeout: 2000 });
    await user.click(screen.getByTestId("enviar-btn"));

    await waitFor(
      () => {
        expect(screen.queryByText(/Ingrese al menos un ingrediente/i)).not.toBeInTheDocument();
      },
      { timeout: 2000 },
    );

    await waitFor(() => expect(mockCrearReceta).toHaveBeenCalled(), { timeout: 2000 });
    expect(mockActualizarReceta).not.toHaveBeenCalled();
  }, 15000);

  it("debería llamar actualizar si idToOpen es distinto de 0", async () => {
    const user = userEvent.setup();
    render(<RecetaFormModal openArg={true} idToOpen={1} onClose={jest.fn()} />);
    await waitFor(() => expect(mockGetReceta).toHaveBeenCalledWith(1), { timeout: 2000 });
    await waitFor(() => expect(screen.getByLabelText(/Nombre/i)).toHaveValue("Bizcochuelo"), {
      timeout: 2000,
    });
    await user.clear(screen.getByLabelText(/Nombre/i));
    await user.type(screen.getByLabelText(/Nombre/i), "Bizcochuelo Editado");
    await user.click(screen.getByTestId("enviar-btn"));
    await waitFor(() => expect(mockActualizarReceta).toHaveBeenCalled(), { timeout: 2000 });
  });

  it("debería mostrar mensaje de error si el service.crear falla", async () => {
    const user = userEvent.setup();
    mockCrearReceta.mockRejectedValueOnce(new Error("Error al crear receta"));
    render(<RecetaFormModal openArg={true} idToOpen={0} onClose={jest.fn()} />);
    await waitFor(() => expect(screen.getByTestId("enviar-btn")).toBeInTheDocument(), {
      timeout: 2000,
    });
    await user.type(screen.getByLabelText(/Nombre/i), "Torta");
    await user.type(screen.getByLabelText(/^Rinde:$/i), "8");
    await user.type(screen.getByLabelText(/^observaciones$/i), "pasos a seguir");

    await waitFor(() => expect(screen.getByText(/Ingredientes/i)).toBeInTheDocument(), {
      timeout: 2000,
    });
    await user.click(screen.getByRole("button", { name: /Agregar/i }));
    await waitFor(
      () => expect(screen.getByRole("dialog", { name: /Ingrediente/i })).toBeInTheDocument(),
      { timeout: 2000 },
    );
    await user.click(screen.getByLabelText(/Producto/i));
    await waitFor(
      () => expect(screen.getByRole("option", { name: /Harina/i })).toBeInTheDocument(),
      { timeout: 2000 },
    );
    await user.click(screen.getByRole("option", { name: /Harina/i }));
    //await user.click(screen.getByLabelText(/Unidad/i));
    await user.type(screen.getByLabelText(/Cantidad/i), "2");
    await user.click(screen.getByRole("button", { name: /Guardar/i }));

    await user.click(screen.getByRole("button", { name: /Enviar/i }));
    await waitFor(() => expect(mockCrearReceta).toHaveBeenCalled(), { timeout: 2000 });
    await waitFor(
      () => expect(screen.getByText(/Error al crear la receta./i)).toBeInTheDocument(),
      { timeout: 2000 },
    );
  }, 15000);

  it("debería mostrar mensaje de error si el service.actualizar falla", async () => {
    const user = userEvent.setup();
    mockActualizarReceta.mockRejectedValueOnce(new Error("Error al actualizar receta"));
    render(<RecetaFormModal openArg={true} idToOpen={1} onClose={jest.fn()} />);
    await waitFor(() => expect(mockGetReceta).toHaveBeenCalledWith(1), { timeout: 2000 });
    await user.clear(screen.getByLabelText(/Nombre/i));
    await user.type(screen.getByLabelText(/Nombre/i), "Bizcochuelo Editado");
    await user.click(screen.getByTestId("enviar-btn"));
    await waitFor(() => expect(mockActualizarReceta).toHaveBeenCalled(), { timeout: 2000 });
    await waitFor(
      () => expect(screen.getByText(/Error al actualizar la receta./i)).toBeInTheDocument(),
      { timeout: 2000 },
    );
  });

  it("debería llamar getUnidades y getAll productos al montar", async () => {
    userEvent.setup();
    render(<RecetaFormModal openArg={true} idToOpen={0} onClose={jest.fn()} />);
    await waitFor(() => expect(mockGetUnidades).toHaveBeenCalled(), { timeout: 2000 });
    await waitFor(() => expect(mockGetAllProductos).toHaveBeenCalled(), { timeout: 2000 });
  });

  it("debería llamar get del service de receta si idToOpen > 0", async () => {
    userEvent.setup();
    render(<RecetaFormModal openArg={true} idToOpen={2} onClose={jest.fn()} />);
    await waitFor(() => expect(mockGetReceta).toHaveBeenCalledWith(2), { timeout: 2000 });
  });

  it("debería permitir agregar, modificar y borrar ingredientes", async () => {
    const user = userEvent.setup();
    render(<RecetaFormModal openArg={true} idToOpen={0} onClose={jest.fn()} />);
    await waitFor(() => expect(screen.getByTestId("enviar-btn")).toBeInTheDocument(), {
      timeout: 2000,
    });
    await waitFor(() => expect(screen.getByText(/Ingredientes/i)).toBeInTheDocument(), {
      timeout: 2000,
    });

    // Agregar ingrediente
    await user.click(screen.getByRole("button", { name: /Agregar/i }));
    await waitFor(
      () => expect(screen.getByRole("dialog", { name: /Ingrediente/i })).toBeInTheDocument(),
      { timeout: 2000 },
    );
    await user.click(screen.getByLabelText(/Producto/i));
    await waitFor(
      () => expect(screen.getByRole("option", { name: /Harina/i })).toBeInTheDocument(),
      { timeout: 2000 },
    );
    await user.click(screen.getByRole("option", { name: /Harina/i }));
    await user.type(screen.getByLabelText(/Cantidad/i), "2");
    await user.click(screen.getByRole("button", { name: /Guardar/i }));
    await waitFor(() => expect(screen.getByText(/Harina/i)).toBeInTheDocument(), { timeout: 2000 });

    // Seleccionar ingrediente para modificar
    await user.click(screen.getByText(/Harina/i));
    await user.click(screen.getByRole("button", { name: /Modificar/i }));
    await waitFor(
      () => expect(screen.getByRole("dialog", { name: /Ingrediente/i })).toBeInTheDocument(),
      { timeout: 2000 },
    );
    await user.clear(screen.getByLabelText(/Cantidad/i));
    await user.type(screen.getByLabelText(/Cantidad/i), "3");
    await user.click(screen.getByRole("button", { name: /Guardar/i }));
    await waitFor(() => expect(screen.getByText(/3 kg/i)).toBeInTheDocument(), { timeout: 2000 });

    // Seleccionar ingrediente para borrar
    await waitFor(() => {
      expect(screen.getByRole("button", { name: /Eliminar/i })).toBeEnabled();
    });
    await user.click(screen.getByRole("button", { name: /Eliminar/i }));
    await waitFor(
      () => expect(screen.getByText(/¿Desea Borrar el Ingrediente\?/i)).toBeInTheDocument(),
      { timeout: 2000 },
    );
    await user.click(screen.getByRole("button", { name: /Si/i }));
    await waitFor(() => expect(screen.queryByText(/Harina/i)).not.toBeInTheDocument(), {
      timeout: 2000,
    });
  }, 15000);

  it("debería permitir editar observaciones", async () => {
    const user = userEvent.setup();
    render(<RecetaFormModal openArg={true} idToOpen={0} onClose={jest.fn()} />);
    await waitFor(() => expect(screen.getByTestId("observaciones-input")).toBeInTheDocument(), {
      timeout: 2000,
    });
    await user.type(screen.getByTestId("observaciones-input"), "Nueva observación");
    await waitFor(
      () => {
        expect(screen.getByTestId("observaciones-input")).toHaveValue("Nueva observación");
      },
      { timeout: 2000 },
    );
  }, 15000);

  it("debería mostrar error si el nombre es muy corto", async () => {
    const user = userEvent.setup();
    render(<RecetaFormModal openArg={true} idToOpen={0} onClose={jest.fn()} />);
    await waitFor(() => expect(screen.getByLabelText(/Nombre/i)).toBeInTheDocument(), {
      timeout: 2000,
    });

    await user.clear(screen.getByLabelText(/Nombre/i)); // asegúrate que no haya un valor previo
    await user.type(screen.getByLabelText(/Nombre/i), "A");
    await user.click(screen.getByTestId("enviar-btn"));

    await waitFor(() => expect(screen.getByText(/al menos 2 caracteres/i)).toBeInTheDocument(), {
      timeout: 2000,
    });
  });

  it("debería mostrar error si rinde es menor a 1", async () => {
    const user = userEvent.setup();
    render(<RecetaFormModal openArg={true} idToOpen={0} onClose={jest.fn()} />);
    await waitFor(() => expect(screen.getByTestId("enviar-btn")).toBeInTheDocument(), {
      timeout: 2000,
    });
    await user.type(screen.getByLabelText(/Nombre/i), "Torta");
    await user.type(screen.getByLabelText(/^Rinde:$/i), "0");
    await user.click(screen.getByTestId("enviar-btn"));
    expect(
      await screen.findByText(/Ingrese cuantas porciones rinde la receta/i, {}, { timeout: 2000 }),
    ).toBeInTheDocument();
  });

  it("debería permitir agregar varios ingredientes y mostrarlos en la grilla", async () => {
    const user = userEvent.setup();
    render(<RecetaFormModal openArg={true} idToOpen={0} onClose={jest.fn()} />);
    await waitFor(() => expect(screen.getByLabelText(/Nombre/i)).toBeInTheDocument(), {
      timeout: 2000,
    });
    await waitFor(() => expect(screen.getByText(/Ingredientes/i)).toBeInTheDocument(), {
      timeout: 2000,
    });

    // Agregar primer ingrediente
    await user.click(screen.getByRole("button", { name: /Agregar/i }));
    await waitFor(
      () => expect(screen.getByRole("dialog", { name: /Ingrediente/i })).toBeInTheDocument(),
      { timeout: 2000 },
    );
    await user.click(screen.getByLabelText(/Producto/i));
    await waitFor(
      () => expect(screen.getByRole("option", { name: /Harina/i })).toBeInTheDocument(),
      { timeout: 2000 },
    );
    await user.click(screen.getByRole("option", { name: /Harina/i }));
    await user.type(screen.getByLabelText(/Cantidad/i), "2");
    await user.click(screen.getByRole("button", { name: /Guardar/i }));
    await waitFor(() => expect(screen.getByText(/Harina/i)).toBeInTheDocument(), { timeout: 2000 });

    // Agregar segundo ingrediente
    await user.click(screen.getByRole("button", { name: /Agregar/i }));
    await waitFor(
      () => expect(screen.getByRole("dialog", { name: /Ingrediente/i })).toBeInTheDocument(),
      { timeout: 2000 },
    );
    await user.click(screen.getByLabelText(/Producto/i));
    await waitFor(
      () => expect(screen.getByRole("option", { name: /Azúcar/i })).toBeInTheDocument(),
      { timeout: 2000 },
    );
    await user.click(screen.getByRole("option", { name: /Azúcar/i }));
    await user.type(screen.getByLabelText(/Cantidad/i), "1");
    await user.click(screen.getByRole("button", { name: /Guardar/i }));
    await waitFor(() => expect(screen.getByText(/Azúcar/i)).toBeInTheDocument(), { timeout: 2000 });
    await waitFor(() => expect(screen.getByText(/1 g/i)).toBeInTheDocument(), { timeout: 2000 });
  }, 15000);

  it("no debería cerrar si el usuario elige 'No' en el diálogo", async () => {
    const user = userEvent.setup();
    const mockOnClose = jest.fn();
    render(<RecetaFormModal openArg={true} idToOpen={0} onClose={mockOnClose} />);
    await waitFor(() => expect(screen.getByLabelText(/Nombre/i)).toBeInTheDocument(), {
      timeout: 2000,
    });
    await user.type(screen.getByLabelText(/Nombre/i), "Torta");
    await user.click(screen.getByRole("button", { name: /close/i }));
    const { onNo } = mockShowConfirmDialog.mock.calls[0][0];

    act(() => {
      onNo(); // simular click en "No"
    });

    expect(mockOnClose).not.toHaveBeenCalled();
  });
});

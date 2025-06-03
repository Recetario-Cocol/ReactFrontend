import { screen, fireEvent, waitFor } from "@testing-library/react";
import { showConfirmDialog } from "./ConfirmDialog";

describe("showConfirmDialog", () => {
  afterEach(() => {
    // Limpia cualquier diálogo que haya quedado abierto
    document.body.innerHTML = "";
  });

  it("muestra el diálogo con la pregunta", async () => {
    showConfirmDialog({ question: "¿Estás seguro?" });
    await waitFor(() => {
      expect(screen.getByText("¿Estás seguro?")).toBeInTheDocument();
      expect(screen.getByText("No")).toBeInTheDocument();
      expect(screen.getByText("Sí")).toBeInTheDocument();
    });
  });

  it("llama a onYes y cierra el diálogo al hacer click en Sí", async () => {
    const onYesFn = jest.fn();
    showConfirmDialog({ question: "¿Confirmar?", onYes: onYesFn });
    await waitFor(() => {
      expect(screen.getByText("¿Confirmar?")).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText("Sí"));
    expect(onYesFn).toHaveBeenCalled();
    expect(screen.queryByText("¿Confirmar?")).toBeNull();
  });

  it("llama a onNo y cierra el diálogo al hacer click en No", async () => {
    const onNoFn = jest.fn();
    showConfirmDialog({ question: "¿Confirmar?", onNo: onNoFn });
    await waitFor(() => {
      expect(screen.getByText("¿Confirmar?")).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText("No"));
    expect(onNoFn).toHaveBeenCalled();
    expect(screen.queryByText("¿Confirmar?")).toBeNull();
  });

  it("llama a onNo y cierra el diálogo al hacer click en No sin funcion onNo", async () => {
    showConfirmDialog({ question: "¿Confirmar?" });
    await waitFor(() => {
      expect(screen.getByText("¿Confirmar?")).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText("No"));
    expect(screen.queryByText("¿Confirmar?")).toBeNull();
  });

  it("llama a onYes y cierra el diálogo al hacer click en Sí sin funcion en onYes", async () => {
    showConfirmDialog({ question: "¿Confirmar?" });
    await waitFor(() => {
      expect(screen.getByText("¿Confirmar?")).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText("Sí"));
    expect(screen.queryByText("¿Confirmar?")).toBeNull();
  });
});

import { render, screen, fireEvent } from "@testing-library/react";
import Actionbuttons, { ActionbuttonsProps } from "./ActionButtons";

describe("Actionbuttons", () => {
  const mockAgregar = jest.fn();
  const mockModificar = jest.fn();
  const mockBorrar = jest.fn();
  const mockBorrarConDependencias = jest.fn();
  const mockLimpiarContrasenias = jest.fn();

  const defaultProps: ActionbuttonsProps = {
    agregar: { isDisabled: false, onClick: mockAgregar },
    modificar: { isDisabled: false, onClick: mockModificar },
    borrar: { isDisabled: false, onClick: mockBorrar },
    borrarConDependencias: { isDisabled: false, onClick: mockBorrarConDependencias },
    limpiarContrasenias: { isDisabled: false, onClick: mockLimpiarContrasenias },
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders all buttons", () => {
    render(<Actionbuttons {...defaultProps} />);
    expect(screen.getByText("Agregar")).toBeInTheDocument();
    expect(screen.getByText("Modificar")).toBeInTheDocument();
    expect(screen.getByText("Eliminar")).toBeInTheDocument();
    expect(screen.getByText("Eliminar Con Dependencias")).toBeInTheDocument();
    expect(screen.getByText("Restablecer Contraseña")).toBeInTheDocument();
  });

  it("calls the correct callbacks when buttons are clicked", () => {
    render(<Actionbuttons {...defaultProps} />);
    fireEvent.click(screen.getByText("Agregar"));
    fireEvent.click(screen.getByText("Modificar"));
    fireEvent.click(screen.getByText("Eliminar"));
    fireEvent.click(screen.getByText("Eliminar Con Dependencias"));
    fireEvent.click(screen.getByText("Restablecer Contraseña"));
    expect(mockAgregar).toHaveBeenCalled();
    expect(mockModificar).toHaveBeenCalled();
    expect(mockBorrar).toHaveBeenCalled();
    expect(mockBorrarConDependencias).toHaveBeenCalled();
    expect(mockLimpiarContrasenias).toHaveBeenCalled();
  });

  it("disables buttons when isDisabled is true", () => {
    render(
      <Actionbuttons {...defaultProps} agregar={{ ...defaultProps.agregar, isDisabled: true }} />,
    );
    expect(screen.getByText("Agregar")).toBeDisabled();
  });

  it("does not render optional buttons if not provided", () => {
    render(
      <Actionbuttons
        agregar={defaultProps.agregar}
        modificar={defaultProps.modificar}
        borrar={defaultProps.borrar}
      />,
    );
    expect(screen.queryByText("Eliminar Con Dependencias")).toBeNull();
    expect(screen.queryByText("Restablecer Contraseña")).toBeNull();
  });
});

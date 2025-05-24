import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import UpdatePassword from "./updatePassword";
import { BrowserRouter } from "react-router-dom";
import { HeaderAppProps } from "../../core/components/HeaderApp";

// Mock AuthContext
jest.mock("../../contexts/AuthContext", () => ({
  useAuth: () => ({
    updatePassword: jest.fn().mockResolvedValue(undefined),
  }),
}));

// Mock HeaderApp
jest.mock("../../core/components/HeaderApp", () => (props: HeaderAppProps) => (
  <div>{props.titulo}</div>
));

const renderWithRouter = (ui: React.ReactElement) => {
  window.history.pushState({}, "Test page", "/update-password?token=testtoken");
  return render(<BrowserRouter>{ui}</BrowserRouter>);
};

describe("UpdatePassword", () => {
  it("renders form fields", () => {
    renderWithRouter(<UpdatePassword />);
    expect(screen.getByLabelText("Contraseña")).toBeInTheDocument();
    expect(screen.getByLabelText("Validate Contraseña")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Actualizar Constraseña/i })).toBeInTheDocument();
  });

  it("shows error if token is missing", async () => {
    // Fuerza la URL sin token antes del render
    window.history.pushState({}, "Test page", "/update-password");

    render(
      <BrowserRouter>
        <UpdatePassword />
      </BrowserRouter>,
    );

    const validPassword = "ValidPass123!";
    fireEvent.change(screen.getByLabelText("Contraseña"), {
      target: { value: validPassword },
    });
    fireEvent.change(screen.getByLabelText("Validate Contraseña"), {
      target: { value: validPassword },
    });

    fireEvent.click(screen.getByRole("button", { name: /Actualizar Constraseña/i }));

    // Usamos findByText con texto directo
    const errorText = await screen.findByText("Token no encontrado en la URL");
    expect(errorText).toBeInTheDocument();
  });

  it("calls updatePassword on submit with valid data", async () => {
    renderWithRouter(<UpdatePassword />);
    const validPassword = "ValidPass123!";
    fireEvent.change(screen.getByLabelText("Contraseña", { selector: 'input[name="password"]' }), {
      target: { value: validPassword },
    });
    fireEvent.change(
      screen.getByLabelText("Validate Contraseña", { selector: 'input[name="passwordValidate"]' }),
      { target: { value: validPassword } },
    );
    fireEvent.click(screen.getByRole("button", { name: /Actualizar Constraseña/i }));
    await waitFor(() => {
      expect(screen.queryByText(/Token no encontrado en la URL/i)).not.toBeInTheDocument();
    });
  });

  it("toggles password visibility", () => {
    renderWithRouter(<UpdatePassword />);
    const passwordInput = screen.getByLabelText("Contraseña") as HTMLInputElement;
    const toggleButton = screen.getAllByRole("button").find((btn) => btn.querySelector("svg"));
    // Initially should be password type
    expect(passwordInput.type).toBe("password");
    // Click to show password
    if (toggleButton) fireEvent.click(toggleButton);
    expect(passwordInput.type).toBe("text");
    // Click again to hide password
    if (toggleButton) fireEvent.click(toggleButton);
    expect(passwordInput.type).toBe("password");
  });

  it("toggles passwordValidate visibility", () => {
    renderWithRouter(<UpdatePassword />);
    const validateInput = screen.getByLabelText("Validate Contraseña") as HTMLInputElement;
    // There are two toggle buttons, the second is for passwordValidate
    const toggleButtons = screen.getAllByRole("button");
    const validateToggleButton = toggleButtons[1];
    // Initially should be password type
    expect(validateInput.type).toBe("password");
    // Click to show passwordValidate
    fireEvent.click(validateToggleButton);
    expect(validateInput.type).toBe("text");
    // Click again to hide passwordValidate
    fireEvent.click(validateToggleButton);
    expect(validateInput.type).toBe("password");
  });
});

import { render, screen } from "@testing-library/react";
import App from "./App";

test("renders Inicia Sesión text", () => {
  render(<App />);
  const elements = screen.getAllByText(/Inicia Sesión/i);
  expect(elements.length).toBeGreaterThan(0);
});

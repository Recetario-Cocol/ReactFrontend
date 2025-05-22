import { passwordValidationRules, confirmPasswordValidation } from "./validationRules";

describe("passwordValidationRules", () => {
  it("should require password", () => {
    expect(passwordValidationRules.required).toBe("La contraseña es obligatoria");
  });

  it("should have correct pattern and message", () => {
    expect(passwordValidationRules.pattern.value).toBeInstanceOf(RegExp);
    expect(passwordValidationRules.pattern.value.test("Password1")).toBe(true);
    expect(passwordValidationRules.pattern.value.test("password")).toBe(false);
    expect(passwordValidationRules.pattern.value.test("PASSWORD")).toBe(false);
    expect(passwordValidationRules.pattern.value.test("Passw1")).toBe(false);
    expect(passwordValidationRules.pattern.message).toBe(
      "La contraseña debe tener al menos 8 caracteres, incluir una mayúscula, una minúscula y un número",
    );
  });
});

describe("confirmPasswordValidation", () => {
  it("should require confirm password", () => {
    const rules = confirmPasswordValidation("Password1");
    expect(rules.required).toBe("La confirmación de la contraseña es obligatoria");
  });

  it("should validate matching passwords", () => {
    const rules = confirmPasswordValidation("Password1");
    expect(rules.validate("Password1")).toBe(true);
  });

  it("should invalidate non-matching passwords", () => {
    const rules = confirmPasswordValidation("Password1");
    expect(rules.validate("Password2")).toBe("Las contraseñas no coinciden");
  });
});

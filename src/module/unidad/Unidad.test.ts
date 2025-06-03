import { Unidad } from "./Unidad";

describe("Unidad", () => {
  it("should create with default values", () => {
    const unidad = new Unidad();
    expect(unidad.id).toBe(0);
    expect(unidad.nombre).toBe("");
    expect(unidad.abreviacion).toBe("");
    expect(unidad.can_be_deleted).toBe(false);
  });

  it("should create with provided values", () => {
    const unidad = new Unidad(1, "Metro", "m", true);
    expect(unidad.id).toBe(1);
    expect(unidad.nombre).toBe("Metro");
    expect(unidad.abreviacion).toBe("m");
    expect(unidad.can_be_deleted).toBe(true);
  });

  it("should set and get id", () => {
    const unidad = new Unidad();
    unidad.id = 5;
    expect(unidad.id).toBe(5);
  });

  it("should set and get nombre", () => {
    const unidad = new Unidad();
    unidad.nombre = "Litro";
    expect(unidad.nombre).toBe("Litro");
  });

  it("should set and get abreviacion", () => {
    const unidad = new Unidad();
    unidad.abreviacion = "L";
    expect(unidad.abreviacion).toBe("L");
  });

  it("should set and get can_be_deleted", () => {
    const unidad = new Unidad();
    unidad.can_be_deleted = true;
    expect(unidad.can_be_deleted).toBe(true);
  });

  it("should return correct JSON", () => {
    const unidad = new Unidad(2, "Segundo", "s", true);
    expect(unidad.toJSON()).toEqual({
      id: 2,
      nombre: "Segundo",
      abreviacion: "s",
    });
  });

  it("has any value", () => {
    const unidad = new Unidad();
    expect(unidad.isEmpty());
    const unidadWithId = new Unidad(1);
    expect(!unidadWithId.isEmpty());
    const unidadWithNombre = new Unidad(0, "nombre");
    expect(!unidadWithNombre.isEmpty());
    const unidadWithAbreviacion = new Unidad(0, "", "nom");
    expect(!unidadWithAbreviacion.isEmpty());
    const unidadWith0idSpacesName = new Unidad(0, "   ", "   ");
    expect(!unidadWith0idSpacesName.isEmpty());
  });
});

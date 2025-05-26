import Ingrediente from "./Ingrediente";

describe("Ingrediente", () => {
  it("should construct with default values", () => {
    const ingrediente = new Ingrediente();
    expect(ingrediente.id).toBe(0);
    expect(ingrediente.productoId).toBe(0);
    expect(ingrediente.cantidad).toBe(0);
    expect(ingrediente.unidadId).toEqual(0);
  });

  it("should set and get properties", () => {
    const ingrediente = new Ingrediente();
    ingrediente.id = 5;
    ingrediente.productoId = 2;
    ingrediente.cantidad = 1000;
    ingrediente.unidadId = 1;

    expect(ingrediente.id).toBe(5);
    expect(ingrediente.productoId).toBe(2);
    expect(ingrediente.cantidad).toBe(1000);
    expect(ingrediente.unidadId).toEqual(1);
  });

  it("should serialize to JSON", () => {
    const ingrediente = new Ingrediente(5, 2, 1, 1500);
    const json = ingrediente.toJSON();
    expect(json).toEqual({
      id: 5,
      productoId: 2,
      unidadId: 1,
      cantidad: 1500,
    });
  });

  it("clone de object", () => {
    const ingrediente = new Ingrediente(5, 2, 1, 1500);
    const json = ingrediente.toJSON();
    const ingrediente2 = ingrediente.clone();
    expect(json).toEqual({
      id: 5,
      productoId: 2,
      unidadId: 1,
      cantidad: 1500,
    });
    expect(ingrediente2.toJSON()).toEqual({
      id: 5,
      productoId: 2,
      unidadId: 1,
      cantidad: 1500,
    });
    expect(ingrediente !== ingrediente2);
  });
});

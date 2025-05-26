import Producto from "./Producto";

describe("Producto", () => {
  it("should construct with default values", () => {
    const producto = new Producto();
    expect(producto.id).toBe(0);
    expect(producto.nombre).toBe("");
    expect(producto.cantidad).toBe(0);
    expect(producto.precio).toBe(0);
    expect(producto.can_be_deleted).toBe(false);
    expect(producto.unidadId).toEqual(0);
  });

  it("should set and get properties", () => {
    const producto = new Producto();
    producto.id = 5;
    producto.nombre = "Harina";
    producto.cantidad = 1000;
    producto.precio = 1500;
    producto.can_be_deleted = true;
    producto.unidadId = 1;

    expect(producto.id).toBe(5);
    expect(producto.nombre).toBe("Harina");
    expect(producto.cantidad).toBe(1000);
    expect(producto.precio).toBe(1500);
    expect(producto.can_be_deleted).toEqual(true);
    expect(producto.unidadId).toEqual(1);
  });

  it("should serialize to JSON", () => {
    const producto = new Producto(5, "Harina", 1, 1500, 1000, true);
    const json = producto.toJSON();
    expect(json).toEqual({
      id: 5,
      nombre: "Harina",
      cantidad: 1000,
      precio: 1500,
      unidadId: 1,
    });
  });
});

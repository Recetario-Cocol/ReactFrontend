import Receta from "./Receta";
import Ingrediente from "../ingrediente/Ingrediente";

describe("Clase Receta", () => {
  // Test constructor y valores por defecto
  describe("Constructor", () => {
    it("debería crear una instancia con valores por defecto", () => {
      const receta = new Receta();

      expect(receta.id).toBe(0);
      expect(receta.nombre).toBe("");
      expect(receta.rinde).toBe(0);
      expect(receta.ingredientes).toEqual([]);
      expect(receta.observaciones).toBe("");
    });

    it("debería inicializar con valores personalizados", () => {
      const ingredientes = [new Ingrediente(1, 1, 1, 100)];
      const receta = new Receta(1, "Pizza Margarita", 4, ingredientes, "Hornear a 200°C");

      expect(receta.id).toBe(1);
      expect(receta.nombre).toBe("Pizza Margarita");
      expect(receta.rinde).toBe(4);
      expect(receta.ingredientes).toEqual(ingredientes);
      expect(receta.observaciones).toBe("Hornear a 200°C");
    });
  });

  // Test getters y setters
  describe("Getters y Setters", () => {
    let receta: Receta;

    beforeEach(() => {
      receta = new Receta();
    });

    it("debería manejar la propiedad id", () => {
      receta.id = 5;
      expect(receta.id).toBe(5);

      receta.id = -2;
      expect(receta.id).toBe(-2);
    });

    it("debería manejar la propiedad nombre", () => {
      receta.nombre = "Pan integral";
      expect(receta.nombre).toBe("Pan integral");

      receta.nombre = "";
      expect(receta.nombre).toBe("");
    });

    it("debería manejar la propiedad rinde", () => {
      receta.rinde = 10;
      expect(receta.rinde).toBe(10);

      receta.rinde = 0;
      expect(receta.rinde).toBe(0);

      receta.rinde = -5;
      expect(receta.rinde).toBe(-5);
    });

    it("debería manejar la propiedad ingredientes", () => {
      const ingredientes = [new Ingrediente(1, 1, 1, 500), new Ingrediente(2, 2, 2, 300)];

      receta.ingredientes = ingredientes;
      expect(receta.ingredientes).toEqual(ingredientes);

      receta.ingredientes = [];
      expect(receta.ingredientes).toEqual([]);
    });

    it("debería manejar la propiedad observaciones", () => {
      receta.observaciones = "Dejar reposar 30 minutos";
      expect(receta.observaciones).toBe("Dejar reposar 30 minutos");

      receta.observaciones = "";
      expect(receta.observaciones).toBe("");
    });
  });

  // Test método toJSON
  describe("Método toJSON", () => {
    it("debería generar el JSON correctamente", () => {
      const ingredienteMock = new Ingrediente(1, 100, 2, 500);
      jest.spyOn(ingredienteMock, "toJSON").mockReturnValue({
        id: 1,
        productoId: 100,
        unidadId: 2,
        cantidad: 500,
      });

      const receta = new Receta(1, "Lasagna", 6, [ingredienteMock], "Congelar por porciones", 10, 60);

      const expectedJSON = {
        id: 1,
        nombre: "Lasagna",
        rinde: 6,
        ingredientes: [
          {
            id: 1,
            productoId: 100,
            unidadId: 2,
            cantidad: 500,
          },
        ],
        observaciones: "Congelar por porciones",
        precio: 10,
        precio_unidad: 60,
      };

      expect(receta.toJSON()).toEqual(expectedJSON);
      expect(ingredienteMock.toJSON).toHaveBeenCalled();
    });

    it("debería manejar ingredientes vacíos", () => {
      const receta = new Receta();
      const expectedJSON = {
        id: 0,
        nombre: "",
        rinde: 0,
        ingredientes: [],
        observaciones: "",
        precio: 0,
        precio_unidad: 0,
      };

      expect(receta.toJSON()).toEqual(expectedJSON);
    });

    it("debería convertir correctamente los tipos de datos", () => {
      const receta = new Receta();
      receta.rinde = "10" as unknown as number; // Test tipo incorrecto

      const json = receta.toJSON();
      expect(typeof json.rinde).toBe("number");
      expect(json.rinde).toBe(10);
    });
  });

  // Test edge cases
  describe("Casos extremos", () => {
    it("debería manejar valores máximos", () => {
      const receta = new Receta();

      receta.id = Number.MAX_SAFE_INTEGER;
      receta.nombre = "A".repeat(1000);
      receta.rinde = Number.MAX_VALUE;
      receta.observaciones = "B".repeat(2000);

      expect(receta.id).toBe(Number.MAX_SAFE_INTEGER);
      expect(receta.nombre.length).toBe(1000);
      expect(receta.rinde).toBe(Number.MAX_VALUE);
      expect(receta.observaciones.length).toBe(2000);
    });

    it("debería manejar valores especiales en ingredientes", () => {
      const receta = new Receta();
      const ingredientes = [
        new Ingrediente(),
        null as unknown as Ingrediente,
        undefined as unknown as Ingrediente,
      ];

      receta.ingredientes = ingredientes.filter(Boolean) as Ingrediente[];
      expect(receta.ingredientes.length).toBe(1);
    });
  });
});

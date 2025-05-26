// useRecetaService.test.ts
import { renderHook } from "@testing-library/react";
import useAxiosWithAuthentication from "../core/useAxiosWithAuthentication";
import { useRecetaService } from "./useRecetaService";
import Receta from "./Receta";
import Ingrediente from "../ingrediente/Ingrediente";
import { AxiosError } from "axios";

jest.mock("../core/useAxiosWithAuthentication");

const mockAxios = {
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
};

(useAxiosWithAuthentication as jest.Mock).mockReturnValue(mockAxios);

describe("useRecetaService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("debe obtener todas las recetas", async () => {
    const mockRecetas = [new Receta(1, "Torta", 10, [], "Muy rica")];
    mockAxios.get.mockResolvedValueOnce({ data: mockRecetas });

    const { result } = renderHook(() => useRecetaService());
    const recetas = await result.current.getAll();

    expect(mockAxios.get).toHaveBeenCalled();
    expect(recetas).toEqual(mockRecetas);
  });

  it("debe obtener una receta por ID", async () => {
    const recetaData = {
      id: 1,
      nombre: "Tarta",
      rinde: 6,
      ingredientes: [
        {
          id: 1,
          productoId: 2,
          unidadId: 3,
          cantidad: 100,
        },
      ],
      observaciones: "Horno 180°",
    };
    mockAxios.get.mockResolvedValueOnce({ data: recetaData });

    const { result } = renderHook(() => useRecetaService());
    const receta = await result.current.get(1);

    expect(mockAxios.get).toHaveBeenCalledWith(expect.stringContaining("/1/"), {
      params: { projection: "unidadProjection" },
    });

    expect(receta).toBeInstanceOf(Receta);
    expect(receta.id).toBe(1);
    expect(receta.ingredientes[0]).toBeInstanceOf(Ingrediente);
  });

  it("debe crear una receta", async () => {
    const receta = new Receta(1, "Bizcochuelo", 8, [], "");
    mockAxios.post.mockResolvedValueOnce({ data: receta });

    const { result } = renderHook(() => useRecetaService());
    const data = await result.current.crear(receta);

    expect(mockAxios.post).toHaveBeenCalledWith(expect.any(String), receta.toJSON());
    expect(data).toEqual(receta);
  });

  it("debe actualizar una receta", async () => {
    const receta = new Receta(1, "Chocotorta", 10, [], "Con dulce de leche");
    mockAxios.put.mockResolvedValueOnce({ data: receta });

    const { result } = renderHook(() => useRecetaService());
    const updated = await result.current.actualizar(1, receta);

    expect(mockAxios.put).toHaveBeenCalledWith(
      expect.stringContaining("/1/"),
      receta.toJSON(),
      expect.objectContaining({ headers: expect.any(Object) }),
    );
    expect(updated).toEqual(receta);
  });

  it("debe eliminar una receta", async () => {
    mockAxios.delete.mockResolvedValueOnce({});
    const { result } = renderHook(() => useRecetaService());

    await result.current.eliminar(1);

    expect(mockAxios.delete).toHaveBeenCalledWith(expect.stringContaining("/1/"));
  });

  it("debe obtener grilla de recetas", async () => {
    const grilla = [
      {
        id: 1,
        nombre: "Torta de limón",
        ingredientes: "harina, azúcar, huevo",
      },
    ];
    mockAxios.get.mockResolvedValueOnce({ data: grilla });

    const { result } = renderHook(() => useRecetaService());
    const data = await result.current.getGrilla();

    expect(mockAxios.get).toHaveBeenCalledWith(expect.stringContaining("/grilla/"));
    expect(data).toEqual(grilla);
  });

  it("debe lanzar error si el ID es inválido", async () => {
    const { result } = renderHook(() => useRecetaService());

    await expect(result.current.get(0)).rejects.toBeInstanceOf(Error);
    await expect(result.current.actualizar(-1, new Receta())).rejects.toBeInstanceOf(Error);
    await expect(result.current.eliminar(NaN)).rejects.toBeInstanceOf(Error);
  });

  it("debe lanzar error si el ID es NaN, string, null o undefined en get/actualizar/eliminar", async () => {
    const { result } = renderHook(() => useRecetaService());

    // get
    await expect(result.current.get(NaN)).rejects.toBeInstanceOf(Error);
    await expect(result.current.get("a" as unknown as number)).rejects.toBeInstanceOf(Error);
    await expect(result.current.get(null as unknown as number)).rejects.toBeInstanceOf(Error);
    await expect(result.current.get(undefined as unknown as number)).rejects.toBeInstanceOf(Error);

    // actualizar
    await expect(result.current.actualizar(NaN, new Receta())).rejects.toBeInstanceOf(Error);
    await expect(
      result.current.actualizar("a" as unknown as number, new Receta()),
    ).rejects.toBeInstanceOf(Error);
    await expect(
      result.current.actualizar(null as unknown as number, new Receta()),
    ).rejects.toBeInstanceOf(Error);
    await expect(
      result.current.actualizar(undefined as unknown as number, new Receta()),
    ).rejects.toBeInstanceOf(Error);

    // eliminar
    await expect(result.current.eliminar(NaN)).rejects.toBeInstanceOf(Error);
    await expect(result.current.eliminar("a" as unknown as number)).rejects.toBeInstanceOf(Error);
    await expect(result.current.eliminar(null as unknown as number)).rejects.toBeInstanceOf(Error);
    await expect(result.current.eliminar(undefined as unknown as number)).rejects.toBeInstanceOf(
      Error,
    );
  });

  it("debe lanzar ServiceError si getAll falla con error desconocido", async () => {
    mockAxios.get.mockRejectedValueOnce({ foo: "bar" });

    const { result } = renderHook(() => useRecetaService());
    await expect(result.current.getAll()).rejects.toMatchObject({
      message: expect.stringContaining("Error desconocido al obtener recetas"),
    });
  });

  it("debe lanzar ServiceError si getGrilla falla con AxiosError", async () => {
    const error = new AxiosError("fallo grilla");
    mockAxios.get.mockRejectedValueOnce(error);

    const { result } = renderHook(() => useRecetaService());
    await expect(result.current.getGrilla()).rejects.toMatchObject({
      message: expect.stringContaining("Error al obtener la grilla de recetas"),
    });
  });

  it("debe lanzar ServiceError si getGrilla falla con error desconocido", async () => {
    mockAxios.get.mockRejectedValueOnce("otro error grilla");

    const { result } = renderHook(() => useRecetaService());
    await expect(result.current.getGrilla()).rejects.toMatchObject({
      message: expect.stringContaining("Error desconocido al obtener la grilla de recetas"),
    });
  });

  it("debe lanzar ServiceError si crear falla con AxiosError", async () => {
    const error = new AxiosError("fallo crear");
    mockAxios.post.mockRejectedValueOnce(error);

    const { result } = renderHook(() => useRecetaService());
    await expect(result.current.crear(new Receta())).rejects.toMatchObject({
      message: expect.stringContaining("Error al crear receta"),
    });
  });

  it("debe lanzar ServiceError si actualizar falla con error desconocido", async () => {
    mockAxios.put.mockRejectedValueOnce("otro error actualizar");

    const { result } = renderHook(() => useRecetaService());
    await expect(result.current.actualizar(1, new Receta())).rejects.toMatchObject({
      message: expect.stringContaining("Error desconocido al actualizar receta 1"),
    });
  });

  it("debe lanzar ServiceError si eliminar falla con error desconocido", async () => {
    mockAxios.delete.mockRejectedValueOnce("otro error eliminar");

    const { result } = renderHook(() => useRecetaService());
    await expect(result.current.eliminar(1)).rejects.toMatchObject({
      message: expect.stringContaining("Error desconocido al eliminar receta 1"),
    });
  });

  it("debe manejar receta sin ingredientes válidos", async () => {
    const recetaData = {
      id: 2,
      nombre: "Vacía",
      rinde: 0,
      ingredientes: undefined,
      observaciones: "",
    };
    mockAxios.get.mockResolvedValueOnce({ data: recetaData });

    const { result } = renderHook(() => useRecetaService());
    await expect(result.current.get(2)).rejects.toMatchObject({
      message: expect.stringContaining("Error"),
    });
  });

  it("debe lanzar ServiceError sin status si response es undefined", async () => {
    const error = new AxiosError("fallo sin response");
    // No seteamos error.response
    mockAxios.get.mockRejectedValueOnce(error);

    const { result } = renderHook(() => useRecetaService());
    await expect(result.current.getAll()).rejects.toMatchObject({
      message: expect.stringContaining("Error al obtener recetas"),
      status: undefined,
    });
  });

  it("debe lanzar error si toJSON lanza excepción en crear", async () => {
    const receta = new Receta(1, "Error", 1, [], "");
    receta.toJSON = () => {
      throw new Error("fallo serialización");
    };

    const { result } = renderHook(() => useRecetaService());
    await expect(result.current.crear(receta)).rejects.toMatchObject({
      message: expect.stringContaining("fallo serialización"),
    });
  });

  it("debe lanzar ServiceError si get falla con AxiosError", async () => {
    const error = new AxiosError("fallo el get");
    mockAxios.get.mockRejectedValueOnce(error);

    const { result } = renderHook(() => useRecetaService());
    await expect(result.current.get(1)).rejects.toMatchObject({
      message: expect.stringContaining("Error al obtener receta 1"),
    });
  });

  it("debe lanzar ServiceError si actualizar falla con AxiosError", async () => {
    const error = new AxiosError("fallo el update");
    mockAxios.put.mockRejectedValueOnce(error);

    const { result } = renderHook(() => useRecetaService());
    await expect(result.current.actualizar(1, new Receta())).rejects.toMatchObject({
      message: expect.stringContaining("Error al actualizar receta 1"),
    });
  });

  it("debe lanzar ServiceError si elimar falla con AxiosError", async () => {
    const error = new AxiosError("fallo el update");
    mockAxios.delete.mockRejectedValueOnce(error);

    const { result } = renderHook(() => useRecetaService());
    await expect(result.current.eliminar(1)).rejects.toMatchObject({
      message: expect.stringContaining("Error al eliminar receta 1"),
    });
  });
});

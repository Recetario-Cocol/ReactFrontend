import { renderHook } from "@testing-library/react";
import { useProductoService } from "./useProductoService";
import useAxiosWithAuthentication from "../core/useAxiosWithAuthentication";
import Producto from "./Producto";
import { AxiosError } from "axios";

jest.mock("../core/useAxiosWithAuthentication");

const mockAxios = {
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
};

(useAxiosWithAuthentication as jest.Mock).mockReturnValue(mockAxios);

describe("useProductoService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("debe obtener la lista de Productos", async () => {
    const productosApi: Producto[] = [new Producto(1, "Harima", 1, 1500, 1000, false)];
    mockAxios.get.mockResolvedValueOnce({ data: productosApi });
    const { result } = renderHook(() => useProductoService());
    const data = await result.current.getAll();
    expect(mockAxios.get).toHaveBeenCalled();
    expect(data).toEqual(productosApi);
  });

  it("debe obtener un producto por ID", async () => {
    const productosApi: Producto[] = [new Producto(1, "Harima", 1, 1500, 1000, false)];
    mockAxios.get.mockResolvedValueOnce({ data: productosApi });

    const { result } = renderHook(() => useProductoService());
    const data = await result.current.get(1);

    expect(mockAxios.get).toHaveBeenCalled();
    expect(data).toEqual(productosApi);
  });

  it("debe crear un Producto", async () => {
    const azucar: Producto = new Producto(1, "Azucar", 1, 1450, 1000, false);
    mockAxios.post.mockResolvedValueOnce({ data: azucar });

    const { result } = renderHook(() => useProductoService());
    const data = await result.current.crear(azucar);

    expect(mockAxios.post).toHaveBeenCalled();
    expect(data).toEqual(azucar);
  });

  it("debe actualizar un Producto", async () => {
    const azucar: Producto = new Producto(1, "Azucar", 1, 1450, 1000, false);
    mockAxios.put.mockResolvedValueOnce({ data: azucar });

    const { result } = renderHook(() => useProductoService());
    const data = await result.current.actualizar(1, azucar);

    expect(mockAxios.put).toHaveBeenCalled();
    expect(data).toEqual(azucar);
  });

  it("debe eliminar un producto", async () => {
    mockAxios.delete.mockResolvedValueOnce({});
    const { result } = renderHook(() => useProductoService());
    await result.current.eliminar(1);
    expect(mockAxios.delete).toHaveBeenCalled();
  });

  it("debe lanzar error si el id es inválido", async () => {
    const { result } = renderHook(() => useProductoService());
    await expect(result.current.get(-1)).rejects.toBeInstanceOf(Error);
    await expect(result.current.actualizar(0, new Producto())).rejects.toBeInstanceOf(Error);
    await expect(result.current.eliminar(NaN)).rejects.toBeInstanceOf(Error);
  });

  it("debe lanzar ServiceError en get con AxiosError", async () => {
    const error = new AxiosError("fail");
    mockAxios.get.mockRejectedValueOnce(error);

    const { result } = renderHook(() => useProductoService());
    await expect(result.current.get(1)).rejects.toMatchObject({
      message: expect.stringContaining("Error al obtener producto 1"),
      status: undefined,
    });
  });

  it("debe lanzar ServiceError en get con error desconocido (string)", async () => {
    mockAxios.get.mockRejectedValueOnce("otro error");
    const { result } = renderHook(() => useProductoService());
    await expect(result.current.get(1)).rejects.toMatchObject({
      message: expect.stringContaining("Error desconocido al obtener producto 1"),
    });
  });

  it("debe lanzar ServiceError en get con error desconocido (objeto)", async () => {
    mockAxios.get.mockRejectedValueOnce({ message: "fail" });

    const { result } = renderHook(() => useProductoService());
    await expect(result.current.get(1)).rejects.toMatchObject({
      message: expect.stringContaining("Error desconocido al obtener producto 1"),
    });
  });

  it("debe lanzar ServiceError en get con error desconocido (null)", async () => {
    mockAxios.get.mockRejectedValueOnce(null);

    const { result } = renderHook(() => useProductoService());
    await expect(result.current.get(1)).rejects.toMatchObject({
      message: expect.stringContaining("Error desconocido al obtener producto 1"),
    });
  });

  it("debe lanzar ServiceError en getAll con AxiosError", async () => {
    const error = new AxiosError("fail");
    mockAxios.get.mockRejectedValueOnce(error);

    const { result } = renderHook(() => useProductoService());
    await expect(result.current.getAll()).rejects.toMatchObject({
      message: expect.stringContaining("Error al obtener productos"),
      status: undefined,
    });
  });

  it("debe lanzar ServiceError en getAll con error desconocido (string)", async () => {
    mockAxios.get.mockRejectedValueOnce("otro error");

    const { result } = renderHook(() => useProductoService());
    await expect(result.current.getAll()).rejects.toMatchObject({
      message: expect.stringContaining("Error desconocido al obtener productos"),
    });
  });

  it("debe lanzar ServiceError en getAll con error desconocido (objeto)", async () => {
    mockAxios.get.mockRejectedValueOnce({ message: "fail" });

    const { result } = renderHook(() => useProductoService());
    await expect(result.current.getAll()).rejects.toMatchObject({
      message: expect.stringContaining("Error desconocido al obtener productos"),
    });
  });

  it("debe lanzar ServiceError en getAll con error desconocido (null)", async () => {
    mockAxios.get.mockRejectedValueOnce(null);

    const { result } = renderHook(() => useProductoService());
    await expect(result.current.getAll()).rejects.toMatchObject({
      message: expect.stringContaining("Error desconocido al obtener productos"),
    });
  });

  it("debe lanzar ServiceError en crear con AxiosError", async () => {
    const error = new AxiosError("fail");
    mockAxios.post.mockRejectedValueOnce(error);

    const { result } = renderHook(() => useProductoService());
    await expect(result.current.crear(new Producto())).rejects.toMatchObject({
      message: expect.stringContaining("Error al crear producto"),
      status: undefined,
    });
  });

  it("debe lanzar ServiceError en crear con error desconocido (string)", async () => {
    mockAxios.post.mockRejectedValueOnce("otro error");

    const { result } = renderHook(() => useProductoService());
    await expect(result.current.crear(new Producto())).rejects.toMatchObject({
      message: expect.stringContaining("Error desconocido al crear producto"),
    });
  });

  it("debe lanzar ServiceError en crear con error desconocido (objeto)", async () => {
    mockAxios.post.mockRejectedValueOnce({ message: "fail" });

    const { result } = renderHook(() => useProductoService());
    await expect(result.current.crear(new Producto())).rejects.toMatchObject({
      message: expect.stringContaining("Error desconocido al crear producto"),
    });
  });

  it("debe lanzar ServiceError en crear con error desconocido (null)", async () => {
    mockAxios.post.mockRejectedValueOnce(null);

    const { result } = renderHook(() => useProductoService());
    await expect(result.current.crear(new Producto())).rejects.toMatchObject({
      message: expect.stringContaining("Error desconocido al crear producto"),
    });
  });

  it("debe lanzar ServiceError en actualizar con AxiosError", async () => {
    const error = new AxiosError("fail");
    mockAxios.put.mockRejectedValueOnce(error);

    const { result } = renderHook(() => useProductoService());
    await expect(result.current.actualizar(1, new Producto())).rejects.toMatchObject({
      message: expect.stringContaining("Error al actualizar producto 1"),
      status: undefined,
    });
  });

  it("debe lanzar ServiceError en actualizar con error desconocido (string)", async () => {
    mockAxios.put.mockRejectedValueOnce("otro error");

    const { result } = renderHook(() => useProductoService());
    await expect(result.current.actualizar(1, new Producto())).rejects.toMatchObject({
      message: expect.stringContaining("Error desconocido al actualizar producto 1"),
    });
  });

  it("debe lanzar ServiceError en actualizar con error desconocido (objeto)", async () => {
    mockAxios.put.mockRejectedValueOnce({ message: "fail" });

    const { result } = renderHook(() => useProductoService());
    await expect(result.current.actualizar(1, new Producto())).rejects.toMatchObject({
      message: expect.stringContaining("Error desconocido al actualizar producto 1"),
    });
  });

  it("debe lanzar ServiceError en actualizar con error desconocido (null)", async () => {
    mockAxios.put.mockRejectedValueOnce(null);

    const { result } = renderHook(() => useProductoService());
    await expect(result.current.actualizar(1, new Producto())).rejects.toMatchObject({
      message: expect.stringContaining("Error desconocido al actualizar producto 1"),
    });
  });

  it("debe lanzar ServiceError en eliminar con AxiosError", async () => {
    const error = new AxiosError("fail");
    mockAxios.delete.mockRejectedValueOnce(error);

    const { result } = renderHook(() => useProductoService());
    await expect(result.current.eliminar(1)).rejects.toMatchObject({
      message: expect.stringContaining("Error al eliminar producto 1"),
      status: undefined,
    });
  });

  it("debe lanzar ServiceError en eliminar con error desconocido (string)", async () => {
    mockAxios.delete.mockRejectedValueOnce("otro error");

    const { result } = renderHook(() => useProductoService());
    await expect(result.current.eliminar(1)).rejects.toMatchObject({
      message: expect.stringContaining("Error desconocido al eliminar producto 1"),
    });
  });

  it("debe lanzar ServiceError en eliminar con error desconocido (objeto)", async () => {
    mockAxios.delete.mockRejectedValueOnce({ message: "fail" });

    const { result } = renderHook(() => useProductoService());
    await expect(result.current.eliminar(1)).rejects.toMatchObject({
      message: expect.stringContaining("Error desconocido al eliminar producto 1"),
    });
  });

  it("debe lanzar ServiceError en eliminar con error desconocido (null)", async () => {
    mockAxios.delete.mockRejectedValueOnce(null);

    const { result } = renderHook(() => useProductoService());
    await expect(result.current.eliminar(1)).rejects.toMatchObject({
      message: expect.stringContaining("Error desconocido al eliminar producto 1"),
    });
  });
});

import { useUnidadService } from "./useUnidadService";
import { Unidad } from "./Unidad";
import { AxiosError } from "axios";
import useAxiosWithAuthentication from "../core/useAxiosWithAuthentication";

jest.mock("../core/useAxiosWithAuthentication", () => ({
  __esModule: true,
  default: jest.fn(),
}));

const mockGet = jest.fn();
const mockPost = jest.fn();
const mockPut = jest.fn();
const mockDelete = jest.fn();

// Configura el mock después de importar
(useAxiosWithAuthentication as jest.Mock).mockImplementation(() => ({
  get: mockGet,
  post: mockPost,
  put: mockPut,
  delete: mockDelete,
}));

const unidadObj = new Unidad(1, "Metro", "m", true);

describe("useUnidadService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getUnidades", () => {
    it("should return unidades on success", async () => {
      mockGet.mockResolvedValue({ data: [unidadObj] });
      const service = useUnidadService();
      const result = await service.getUnidades();
      expect(result).toEqual([unidadObj]);
      expect(mockGet).toHaveBeenCalled();
    });

    it("should throw ServiceError on AxiosError", async () => {
      const error = new AxiosError("fail");
      mockGet.mockRejectedValue(error);
      const service = useUnidadService();
      await expect(service.getUnidades()).rejects.toMatchObject({
        message: expect.stringContaining("Error al obtener unidades"),
        status: undefined,
      });
    });

    it("should throw ServiceError on unknown error", async () => {
      mockGet.mockRejectedValue("other error");
      const service = useUnidadService();
      await expect(service.getUnidades()).rejects.toMatchObject({
        message: expect.stringContaining("Error desconocido al obtener unidades"),
      });
    });

    it("should throw ServiceError on unknown object error", async () => {
      mockGet.mockRejectedValue({ message: "fail" });
      const service = useUnidadService();
      await expect(service.getUnidades()).rejects.toMatchObject({
        message: expect.stringContaining("Error desconocido al obtener unidades"),
      });
    });

    it("should throw ServiceError on null error", async () => {
      mockGet.mockRejectedValue(null);
      const service = useUnidadService();
      await expect(service.getUnidades()).rejects.toMatchObject({
        message: expect.stringContaining("Error desconocido al obtener unidades"),
      });
    });
  });

  describe("getUnidad", () => {
    it("should return unidad on success", async () => {
      mockGet.mockResolvedValue({ data: unidadObj });
      const service = useUnidadService();
      const result = await service.getUnidad(1);
      expect(result).toEqual(unidadObj);
      expect(mockGet).toHaveBeenCalledWith(
        expect.stringContaining("/1/"),
        expect.objectContaining({ params: { projection: "unidadProjection" } }),
      );
    });

    it("should throw error if id is invalid", async () => {
      const service = useUnidadService();
      await expect(service.getUnidad(0)).rejects.toThrow(
        "El ID debe ser un número entero positivo",
      );
      await expect(service.getUnidad(-1)).rejects.toThrow(
        "El ID debe ser un número entero positivo",
      );
      await expect(service.getUnidad(NaN)).rejects.toThrow(
        "El ID debe ser un número entero positivo",
      );
    });

    it("should throw ServiceError on AxiosError", async () => {
      const error = new AxiosError("fail");
      mockGet.mockRejectedValue(error);
      const service = useUnidadService();
      await expect(service.getUnidad(1)).rejects.toMatchObject({
        message: expect.stringContaining("Error al obtener unidad 1"),
      });
    });

    it("should throw ServiceError on unknown error", async () => {
      mockGet.mockRejectedValue("other error");
      const service = useUnidadService();
      await expect(service.getUnidad(1)).rejects.toMatchObject({
        message: expect.stringContaining("Error desconocido al obtener unidad 1"),
      });
    });

    it("should throw ServiceError on unknown object error", async () => {
      mockGet.mockRejectedValue({ message: "fail" });
      const service = useUnidadService();
      await expect(service.getUnidad(1)).rejects.toMatchObject({
        message: expect.stringContaining("Error desconocido al obtener unidad 1"),
      });
    });

    it("should throw ServiceError on null error", async () => {
      mockGet.mockRejectedValue(null);
      const service = useUnidadService();
      await expect(service.getUnidad(1)).rejects.toMatchObject({
        message: expect.stringContaining("Error desconocido al obtener unidad 1"),
      });
    });
  });

  describe("crearUnidad", () => {
    it("should return unidad on success", async () => {
      mockPost.mockResolvedValue({ data: unidadObj });
      const service = useUnidadService();
      const result = await service.crearUnidad(unidadObj);
      expect(result).toEqual(unidadObj);
      expect(mockPost).toHaveBeenCalledWith(expect.any(String), unidadObj);
    });

    it("should throw ServiceError on AxiosError", async () => {
      const error = new AxiosError("fail");
      mockPost.mockRejectedValue(error);
      const service = useUnidadService();
      await expect(service.crearUnidad(unidadObj)).rejects.toMatchObject({
        message: expect.stringContaining("Error al crear unidad"),
      });
    });

    it("should throw ServiceError on unknown error", async () => {
      mockPost.mockRejectedValue("other error");
      const service = useUnidadService();
      await expect(service.crearUnidad(unidadObj)).rejects.toMatchObject({
        message: expect.stringContaining("Error desconocido al crear unidad"),
      });
    });

    it("should throw ServiceError on unknown object error", async () => {
      mockPost.mockRejectedValue({ message: "fail" });
      const service = useUnidadService();
      await expect(service.crearUnidad(unidadObj)).rejects.toMatchObject({
        message: expect.stringContaining("Error desconocido al crear unidad"),
      });
    });

    it("should throw ServiceError on null error", async () => {
      mockPost.mockRejectedValue(null);
      const service = useUnidadService();
      await expect(service.crearUnidad(unidadObj)).rejects.toMatchObject({
        message: expect.stringContaining("Error desconocido al crear unidad"),
      });
    });
  });

  describe("actualizarUnidad", () => {
    it("should return unidad on success", async () => {
      mockPut.mockResolvedValue({ data: unidadObj });
      const service = useUnidadService();
      const result = await service.actualizarUnidad(1, unidadObj);
      expect(result).toEqual(unidadObj);
      expect(mockPut).toHaveBeenCalledWith(expect.stringContaining("/1/"), unidadObj);
    });

    it("should throw error if id is invalid", async () => {
      const service = useUnidadService();
      await expect(service.actualizarUnidad(0, unidadObj)).rejects.toThrow(
        "El ID debe ser un número entero positivo",
      );
      await expect(service.actualizarUnidad(-1, unidadObj)).rejects.toThrow(
        "El ID debe ser un número entero positivo",
      );
      await expect(service.actualizarUnidad(NaN, unidadObj)).rejects.toThrow(
        "El ID debe ser un número entero positivo",
      );
    });

    it("should throw ServiceError on AxiosError", async () => {
      const error = new AxiosError("fail");
      mockPut.mockRejectedValue(error);
      const service = useUnidadService();
      await expect(service.actualizarUnidad(1, unidadObj)).rejects.toMatchObject({
        message: expect.stringContaining("Error al actualizar unidad 1"),
      });
    });

    it("should throw ServiceError on unknown error", async () => {
      mockPut.mockRejectedValue("other error");
      const service = useUnidadService();
      await expect(service.actualizarUnidad(1, unidadObj)).rejects.toMatchObject({
        message: expect.stringContaining("Error desconocido al actualizar unidad 1"),
      });
    });

    it("should throw ServiceError on unknown object error", async () => {
      mockPut.mockRejectedValue({ message: "fail" });
      const service = useUnidadService();
      await expect(service.actualizarUnidad(1, unidadObj)).rejects.toMatchObject({
        message: expect.stringContaining("Error desconocido al actualizar unidad 1"),
      });
    });

    it("should throw ServiceError on null error", async () => {
      mockPut.mockRejectedValue(null);
      const service = useUnidadService();
      await expect(service.actualizarUnidad(1, unidadObj)).rejects.toMatchObject({
        message: expect.stringContaining("Error desconocido al actualizar unidad 1"),
      });
    });
  });

  describe("eliminarUnidad", () => {
    it("should resolve on success", async () => {
      mockDelete.mockResolvedValue({});
      const service = useUnidadService();
      await expect(service.eliminarUnidad(1)).resolves.toBeUndefined();
      expect(mockDelete).toHaveBeenCalledWith(expect.stringContaining("/1/"));
    });

    it("should throw error if id is invalid", async () => {
      const service = useUnidadService();
      await expect(service.eliminarUnidad(0)).rejects.toThrow(
        "El ID debe ser un número entero positivo",
      );
      await expect(service.eliminarUnidad(-1)).rejects.toThrow(
        "El ID debe ser un número entero positivo",
      );
      await expect(service.eliminarUnidad(NaN)).rejects.toThrow(
        "El ID debe ser un número entero positivo",
      );
    });

    it("should throw ServiceError on AxiosError", async () => {
      const error = new AxiosError("fail");
      mockDelete.mockRejectedValue(error);
      const service = useUnidadService();
      await expect(service.eliminarUnidad(1)).rejects.toMatchObject({
        message: expect.stringContaining("Error al eliminar unidad 1"),
      });
    });

    it("should throw ServiceError on unknown error", async () => {
      mockDelete.mockRejectedValue("other error");
      const service = useUnidadService();
      await expect(service.eliminarUnidad(1)).rejects.toMatchObject({
        message: expect.stringContaining("Error desconocido al eliminar unidad 1"),
      });
    });

    it("should throw ServiceError on unknown object error", async () => {
      mockDelete.mockRejectedValue({ message: "fail" });
      const service = useUnidadService();
      await expect(service.eliminarUnidad(1)).rejects.toMatchObject({
        message: expect.stringContaining("Error desconocido al eliminar unidad 1"),
      });
    });

    it("should throw ServiceError on null error", async () => {
      mockDelete.mockRejectedValue(null);
      const service = useUnidadService();
      await expect(service.eliminarUnidad(1)).rejects.toMatchObject({
        message: expect.stringContaining("Error desconocido al eliminar unidad 1"),
      });
    });
  });
});

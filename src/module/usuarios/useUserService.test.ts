import { renderHook } from "@testing-library/react";
import { useUserService } from "./useUserService";
import useAxiosWithAuthentication from "../core/useAxiosWithAuthentication";
import { Usuario, UserFromApi } from "./Usuario";
import { AxiosError } from "axios";

jest.mock("../core/useAxiosWithAuthentication");

const mockAxios = {
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
};

(useAxiosWithAuthentication as jest.Mock).mockReturnValue(mockAxios);

describe("useUserService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("debe obtener la lista de usuarios", async () => {
    const fecha = new Date();
    const isoString = fecha.toISOString();

    const usuariosApi: UserFromApi[] = [
      {
        id: 1,
        name: "usuario",
        email: "usuario@test.com",
        created_at: isoString,
        updated_at: isoString,
        user_permissions: [1, 2, 3],
        roles: [],
        can_be_deleted: true,
      },
    ];
    mockAxios.get.mockResolvedValueOnce({ data: usuariosApi });

    const { result } = renderHook(() => useUserService());
    const data = await result.current.getUsuarios();

    expect(mockAxios.get).toHaveBeenCalled();
    expect(data.map((u) => u.toJSON())).toEqual(
      usuariosApi.map((u) => ({
        ...u,
        created_at: new Date(u.created_at).getTime().toString(),
        updated_at: new Date(u.updated_at).getTime().toString(),
      })),
    );
  });

  it("debe obtener un usuario por ID", async () => {
    const fecha = new Date();
    const isoString = fecha.toISOString();
    const usuarioApi: UserFromApi = {
      id: 1,
      name: "Test User",
      email: "test@test.com",
      created_at: isoString,
      updated_at: isoString,
      user_permissions: [],
      roles: [],
      can_be_deleted: true,
    };
    mockAxios.get.mockResolvedValueOnce({ data: usuarioApi });

    const { result } = renderHook(() => useUserService());
    const data = await result.current.getUsuario(1);

    expect(mockAxios.get).toHaveBeenCalled();
    expect(data.toJSON()).toEqual({
      ...usuarioApi,
      created_at: new Date(usuarioApi.created_at).getTime().toString(),
      updated_at: new Date(usuarioApi.updated_at).getTime().toString(),
    });
  });

  it("debe crear un usuario", async () => {
    const usuario: Usuario = new Usuario(
      2,
      "Nuevo Usuario",
      "nuevo@test.com",
      new Date(),
      new Date(),
      [],
      [],
      true,
    );
    mockAxios.post.mockResolvedValueOnce({ data: usuario });

    const { result } = renderHook(() => useUserService());
    const data = await result.current.crearUsuario(usuario);

    expect(mockAxios.post).toHaveBeenCalled();
    expect(data).toEqual(usuario);
  });

  it("debe actualizar un usuario", async () => {
    const usuario: Usuario = new Usuario(
      1,
      "Actualizado",
      "actualizado@test.com",
      new Date(),
      new Date(),
      [],
      [],
      true,
    );
    mockAxios.put.mockResolvedValueOnce({ data: usuario });

    const { result } = renderHook(() => useUserService());
    const data = await result.current.actualizarUsuario(1, usuario);

    expect(mockAxios.put).toHaveBeenCalled();
    expect(data).toEqual(usuario);
  });

  it("debe eliminar un usuario", async () => {
    mockAxios.delete.mockResolvedValueOnce({});

    const { result } = renderHook(() => useUserService());
    await result.current.eliminarUsuario(1);

    expect(mockAxios.delete).toHaveBeenCalled();
  });

  it("debe lanzar error si el id es inválido", async () => {
    const { result } = renderHook(() => useUserService());
    await expect(result.current.getUsuario(-1)).rejects.toBeInstanceOf(Error);
    await expect(result.current.actualizarUsuario(0, new Usuario())).rejects.toBeInstanceOf(Error);
    await expect(result.current.eliminarUsuario(NaN)).rejects.toBeInstanceOf(Error);
  });

  it("debe lanzar ServiceError en getUsuarios con AxiosError", async () => {
    const error = new AxiosError("fail");
    mockAxios.get.mockRejectedValueOnce(error);

    const { result } = renderHook(() => useUserService());
    await expect(result.current.getUsuarios()).rejects.toMatchObject({
      message: expect.stringContaining("Error al obtener usuarios"),
      status: undefined,
    });
  });

  it("debe lanzar ServiceError en getUsuarios con error desconocido (string)", async () => {
    mockAxios.get.mockRejectedValueOnce("otro error");

    const { result } = renderHook(() => useUserService());
    await expect(result.current.getUsuarios()).rejects.toMatchObject({
      message: expect.stringContaining("Error desconocido al obtener usuarios"),
    });
  });

  it("debe lanzar ServiceError en getUsuarios con error desconocido (objeto)", async () => {
    mockAxios.get.mockRejectedValueOnce({ message: "fail" });

    const { result } = renderHook(() => useUserService());
    await expect(result.current.getUsuarios()).rejects.toMatchObject({
      message: expect.stringContaining("Error desconocido al obtener usuarios"),
    });
  });

  it("debe lanzar ServiceError en getUsuarios con error desconocido (null)", async () => {
    mockAxios.get.mockRejectedValueOnce(null);

    const { result } = renderHook(() => useUserService());
    await expect(result.current.getUsuarios()).rejects.toMatchObject({
      message: expect.stringContaining("Error desconocido al obtener usuarios"),
    });
  });

  it("debe lanzar ServiceError en getUsuario con AxiosError", async () => {
    const error = new AxiosError("fail");
    mockAxios.get.mockRejectedValueOnce(error);

    const { result } = renderHook(() => useUserService());
    await expect(result.current.getUsuario(1)).rejects.toMatchObject({
      message: expect.stringContaining("Error al obtener usuario 1"),
      status: undefined,
    });
  });

  it("debe lanzar ServiceError en getUsuario con error desconocido (string)", async () => {
    mockAxios.get.mockRejectedValueOnce("otro error");

    const { result } = renderHook(() => useUserService());
    await expect(result.current.getUsuario(1)).rejects.toMatchObject({
      message: expect.stringContaining("Error desconocido al obtener usuario 1"),
    });
  });

  it("debe lanzar ServiceError en getUsuario con error desconocido (objeto)", async () => {
    mockAxios.get.mockRejectedValueOnce({ message: "fail" });

    const { result } = renderHook(() => useUserService());
    await expect(result.current.getUsuario(1)).rejects.toMatchObject({
      message: expect.stringContaining("Error desconocido al obtener usuario 1"),
    });
  });

  it("debe lanzar ServiceError en getUsuario con error desconocido (null)", async () => {
    mockAxios.get.mockRejectedValueOnce(null);

    const { result } = renderHook(() => useUserService());
    await expect(result.current.getUsuario(1)).rejects.toMatchObject({
      message: expect.stringContaining("Error desconocido al obtener usuario 1"),
    });
  });

  it("debe lanzar ServiceError en crearUsuario con AxiosError", async () => {
    const error = new AxiosError("fail");
    mockAxios.post.mockRejectedValueOnce(error);

    const { result } = renderHook(() => useUserService());
    await expect(result.current.crearUsuario(new Usuario())).rejects.toMatchObject({
      message: expect.stringContaining("Error al crear usuario"),
      status: undefined,
    });
  });

  it("debe lanzar ServiceError en crearUsuario con error desconocido (string)", async () => {
    mockAxios.post.mockRejectedValueOnce("otro error");

    const { result } = renderHook(() => useUserService());
    await expect(result.current.crearUsuario(new Usuario())).rejects.toMatchObject({
      message: expect.stringContaining("Error desconocido al crear usuario"),
    });
  });

  it("debe lanzar ServiceError en crearUsuario con error desconocido (objeto)", async () => {
    mockAxios.post.mockRejectedValueOnce({ message: "fail" });

    const { result } = renderHook(() => useUserService());
    await expect(result.current.crearUsuario(new Usuario())).rejects.toMatchObject({
      message: expect.stringContaining("Error desconocido al crear usuario"),
    });
  });

  it("debe lanzar ServiceError en crearUsuario con error desconocido (null)", async () => {
    mockAxios.post.mockRejectedValueOnce(null);

    const { result } = renderHook(() => useUserService());
    await expect(result.current.crearUsuario(new Usuario())).rejects.toMatchObject({
      message: expect.stringContaining("Error desconocido al crear usuario"),
    });
  });

  it("debe lanzar ServiceError en actualizarUsuario con AxiosError", async () => {
    const error = new AxiosError("fail");
    mockAxios.put.mockRejectedValueOnce(error);

    const { result } = renderHook(() => useUserService());
    await expect(result.current.actualizarUsuario(1, new Usuario())).rejects.toMatchObject({
      message: expect.stringContaining("Error al actualizar usuario 1"),
      status: undefined,
    });
  });

  it("debe lanzar ServiceError en actualizarUsuario con error desconocido (string)", async () => {
    mockAxios.put.mockRejectedValueOnce("otro error");

    const { result } = renderHook(() => useUserService());
    await expect(result.current.actualizarUsuario(1, new Usuario())).rejects.toMatchObject({
      message: expect.stringContaining("Error desconocido al actualizar usuario 1"),
    });
  });

  it("debe lanzar ServiceError en actualizarUsuario con error desconocido (objeto)", async () => {
    mockAxios.put.mockRejectedValueOnce({ message: "fail" });

    const { result } = renderHook(() => useUserService());
    await expect(result.current.actualizarUsuario(1, new Usuario())).rejects.toMatchObject({
      message: expect.stringContaining("Error desconocido al actualizar usuario 1"),
    });
  });

  it("debe lanzar ServiceError en actualizarUsuario con error desconocido (null)", async () => {
    mockAxios.put.mockRejectedValueOnce(null);

    const { result } = renderHook(() => useUserService());
    await expect(result.current.actualizarUsuario(1, new Usuario())).rejects.toMatchObject({
      message: expect.stringContaining("Error desconocido al actualizar usuario 1"),
    });
  });

  it("debe lanzar ServiceError en eliminarUsuario con AxiosError", async () => {
    const error = new AxiosError("fail");
    mockAxios.delete.mockRejectedValueOnce(error);

    const { result } = renderHook(() => useUserService());
    await expect(result.current.eliminarUsuario(1)).rejects.toMatchObject({
      message: expect.stringContaining("Error al eliminar usuario 1"),
      status: undefined,
    });
  });

  it("debe lanzar ServiceError en eliminarUsuario con error desconocido (string)", async () => {
    mockAxios.delete.mockRejectedValueOnce("otro error");

    const { result } = renderHook(() => useUserService());
    await expect(result.current.eliminarUsuario(1)).rejects.toMatchObject({
      message: expect.stringContaining("Error desconocido al eliminar usuario 1"),
    });
  });

  it("debe lanzar ServiceError en eliminarUsuario con error desconocido (objeto)", async () => {
    mockAxios.delete.mockRejectedValueOnce({ message: "fail" });

    const { result } = renderHook(() => useUserService());
    await expect(result.current.eliminarUsuario(1)).rejects.toMatchObject({
      message: expect.stringContaining("Error desconocido al eliminar usuario 1"),
    });
  });

  it("debe lanzar ServiceError en eliminarUsuario con error desconocido (null)", async () => {
    mockAxios.delete.mockRejectedValueOnce(null);

    const { result } = renderHook(() => useUserService());
    await expect(result.current.eliminarUsuario(1)).rejects.toMatchObject({
      message: expect.stringContaining("Error desconocido al eliminar usuario 1"),
    });
  });
});

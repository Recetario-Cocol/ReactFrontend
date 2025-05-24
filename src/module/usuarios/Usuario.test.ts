import { Usuario, UserFromApi } from "./Usuario";
import { Rol } from "../contexts/Permisos";

const rol1: Rol = { code: "admin", nombre: "ADMIN" };
const rol2: Rol = { code: "user", nombre: "USER" };

describe("Usuario", () => {
  it("should construct with default values", () => {
    const usuario = new Usuario();
    expect(usuario.id).toBe(0);
    expect(usuario.name).toBe("");
    expect(usuario.email).toBe("");
    expect(usuario.can_be_deleted).toBe(false);
    expect(usuario.permisosIds).toEqual([]);
    expect(usuario.roles).toEqual([]);
    expect(usuario.createdAt).toBeInstanceOf(Date);
    expect(usuario.updatedAt).toBeInstanceOf(Date);
  });

  it("should set and get properties", () => {
    const usuario = new Usuario();
    usuario.id = 5;
    usuario.name = "Juan";
    usuario.email = "juan@mail.com";
    usuario.can_be_deleted = true;
    usuario.permisosIds = [1, 2];
    usuario.roles = [rol1, rol2];
    const now = new Date();
    usuario.createdAt = now;
    usuario.updatedAt = now;

    expect(usuario.id).toBe(5);
    expect(usuario.name).toBe("Juan");
    expect(usuario.email).toBe("juan@mail.com");
    expect(usuario.can_be_deleted).toBe(true);
    expect(usuario.permisosIds).toEqual([1, 2]);
    expect(usuario.roles).toEqual([rol1, rol2]);
    expect(usuario.createdAt).toBe(now);
    expect(usuario.updatedAt).toBe(now);
  });

  it("should serialize to JSON", () => {
    const now = new Date();
    const usuario = new Usuario(1, "Ana", "ana@mail.com", now, now, [7, 8], [rol1, rol2], true);
    const json = usuario.toJSON();
    expect(json).toEqual({
      id: 1,
      name: "Ana",
      email: "ana@mail.com",
      created_at: now.getTime().toString(),
      updated_at: now.getTime().toString(),
      user_permissions: [7, 8],
      roles: ["admin", "user"],
      can_be_deleted: true,
    });
  });

  it("should deserialize from JSON", () => {
    const now = new Date();
    const json: UserFromApi = {
      id: 2,
      name: "Luis",
      email: "luis@mail.com",
      created_at: now.toISOString(),
      updated_at: now.toISOString(),
      user_permissions: [3, 4],
      roles: ["admin", "user"],
      can_be_deleted: false,
    };
    const usuario = Usuario.fromJSON(json);
    expect(usuario.id).toBe(2);
    expect(usuario.name).toBe("Luis");
    expect(usuario.email).toBe("luis@mail.com");
    expect(usuario.createdAt.getTime()).toBe(new Date(json.created_at).getTime());
    expect(usuario.updatedAt.getTime()).toBe(new Date(json.updated_at).getTime());
    expect(usuario.permisosIds).toEqual([3, 4]);
    expect(usuario.roles).toEqual([]); // fromJSON sets roles as []
    expect(usuario.can_be_deleted).toBe(false);
  });

  it("should handle empty roles and permisosIds", () => {
    const usuario = new Usuario(1, "Test", "test@mail.com", new Date(), new Date(), [], [], false);
    expect(usuario.roles).toEqual([]);
    expect(usuario.permisosIds).toEqual([]);
    const json = usuario.toJSON();
    expect(json.roles).toEqual([]);
    expect(json.user_permissions).toEqual([]);
  });
});

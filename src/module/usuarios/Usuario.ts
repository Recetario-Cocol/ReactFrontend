import { Rol } from "../contexts/Permisos";

export interface UserFromApi {
  id: number;
  name: string;
  email: string;
  created_at: string;
  updated_at: string;
  user_permissions: number[];
  roles: string[];
  can_be_deleted: boolean;
}

export class Usuario {
  private _id: number;
  private _name: string;
  private _email: string;
  private _createdAt: Date;
  private _updatedAt: Date;
  private _can_be_deleted: boolean;
  private _permisosIds: number[];
  private _roles: Rol[];

  constructor(
    id: number = 0,
    name: string = "",
    email: string = "",
    createdAt: Date = new Date(),
    updatedAt: Date = new Date(),
    permisosIds: number[] = [],
    roles: Rol[] = [],
    can_be_deleted: boolean = false,
  ) {
    this._id = id;
    this._name = name;
    this._email = email;
    this._can_be_deleted = can_be_deleted;
    this._createdAt = createdAt;
    this._updatedAt = updatedAt;
    this._permisosIds = permisosIds;
    this._roles = roles;
  }

  public get id(): number {
    return this._id;
  }

  public get name(): string {
    return this._name;
  }

  public get email(): string {
    return this._email;
  }

  public get can_be_deleted(): boolean {
    return this._can_be_deleted;
  }

  public set id(value: number) {
    this._id = value;
  }

  public set name(value: string) {
    this._name = value;
  }

  public set email(value: string) {
    this._email = value;
  }

  public set can_be_deleted(value: boolean) {
    this._can_be_deleted = value;
  }

  public get createdAt(): Date {
    return this._createdAt;
  }

  public get updatedAt(): Date {
    return this._updatedAt;
  }

  public set createdAt(value: Date) {
    this._createdAt = value;
  }

  public set updatedAt(value: Date) {
    this._updatedAt = value;
  }

  public get permisosIds(): number[] {
    return this._permisosIds;
  }

  public set permisosIds(value: number[]) {
    this._permisosIds = value;
  }

  public get roles(): Rol[] {
    return this._roles;
  }

  public set roles(value: Rol[]) {
    this._roles = value;
  }

  public toJSON(): UserFromApi {
    return {
      id: this._id,
      name: this._name,
      email: this._email,
      created_at: this._createdAt.getTime().toString(),
      updated_at: this._updatedAt.getTime().toString(),
      user_permissions: this._permisosIds,
      roles: this._roles.map((rol) => rol.code),
      can_be_deleted: this._can_be_deleted,
    };
  }

  public static fromJSON(json: UserFromApi): Usuario {
    return new Usuario(
      json.id,
      json.name,
      json.email,
      new Date(json.created_at),
      new Date(json.updated_at),
      json.user_permissions,
      [],
      json.can_be_deleted,
    );
  }
}

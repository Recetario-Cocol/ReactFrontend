import { Permiso, Rol } from "../contexts/Permisos";

export class Usuario {
  private _id: number;
  private _fullName: string;
  private _email: string;
  private _createdAt: Date;
  private _updatedAt: Date;
  private _canBeDeleted: boolean;
  private _permisos: Permiso[];
  private _roles: Rol[];

  constructor(id: number = 0, fullName: string = "", email: string = "", createdAt: Date = new Date(), updatedAt: Date = new Date(), permisos: Permiso[] = [], roles: Rol[] = [], canBeDeleted: boolean = false) {
    this._id = id;
    this._fullName = fullName;
    this._email = email;
    this._canBeDeleted = canBeDeleted;
    this._createdAt = createdAt;
    this._updatedAt = updatedAt;
    this._permisos = permisos;
    this._roles = roles;
  }

  public get id(): number {
    return this._id;
  }

  public get fullName(): string {
    return this._fullName;
  }

  public get email(): string {
    return this._email;
  }

  public get canBeDeleted(): boolean {
    return this._canBeDeleted;
  }

  public set id(value: number) {
    this._id = value;
  }

  public set fullName(value: string) {
    this._fullName = value;
  }

  public set email(value: string) {
    this._email = value;
  }

  public set canBeDeleted(value: boolean) {
    this._canBeDeleted = value;
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

  public get permisos(): Permiso[] {
    return this._permisos;
  } 

  public set permisos(value: Permiso[]) {
    this._permisos = value;
  }

  public get roles(): Rol[] {
    return this._roles;
  }

  public set roles(value: Rol[]) {
    this._roles = value;
  }

  public toJSON() {
    return {
      id: this._id,
      fullName: this._fullName,
      email: this._email,
      createdAt: this._createdAt.getTime(),
      updatedAt: this._updatedAt.getTime(),
      permissions: this._permisos.map(permiso => permiso.codigo),
      roles: this._roles.map(rol => rol.codigo),
    };
  }
}

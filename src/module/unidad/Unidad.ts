export class Unidad {
  private _id: number;
  private _nombre: string;
  private _abreviacion: string;
  private _can_be_deleted: boolean;

  constructor(
    id: number = 0,
    nombre: string = "",
    abreviacion: string = "",
    can_be_deleted: boolean = false,
  ) {
    this._id = id;
    this._nombre = nombre;
    this._abreviacion = abreviacion;
    this._can_be_deleted = can_be_deleted;
  }

  public get id(): number {
    return this._id;
  }

  public get nombre(): string {
    return this._nombre;
  }

  public get abreviacion(): string {
    return this._abreviacion;
  }

  public get can_be_deleted(): boolean {
    return this._can_be_deleted;
  }

  public set id(value: number) {
    this._id = value;
  }

  public set nombre(value: string) {
    this._nombre = value;
  }

  public set abreviacion(value: string) {
    this._abreviacion = value;
  }

  public set can_be_deleted(value: boolean) {
    this._can_be_deleted = value;
  }

  public toJSON() {
    return {
      id: this._id,
      nombre: this._nombre,
      abreviacion: this._abreviacion,
    };
  }
}

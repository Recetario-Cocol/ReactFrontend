export default class Producto {
  private _id: number;
  private _nombre: string;
  private _unidadId: number;
  private _precio: number;
  private _cantidad: number;
  private _can_be_deleted: boolean;

  constructor(
    id: number = 0,
    nombre: string = "",
    unidadId: number = 0,
    precio: number = 0,
    cantidad: number = 0,
    can_be_deleted: boolean = false,
  ) {
    this._id = id;
    this._nombre = nombre;
    this._unidadId = unidadId;
    this._precio = precio;
    this._cantidad = cantidad;
    this._can_be_deleted = can_be_deleted;
  }

  public get cantidad(): number {
    return this._cantidad;
  }

  public set cantidad(value: number) {
    this._cantidad = value;
  }

  public get precio(): number {
    return this._precio;
  }

  public set precio(value: number) {
    this._precio = value;
  }

  public get unidadId(): number {
    return this._unidadId;
  }

  public set unidadId(value: number) {
    this._unidadId = value;
  }

  public get nombre(): string {
    return this._nombre;
  }

  public set nombre(value: string) {
    this._nombre = value;
  }

  public get id(): number {
    return this._id;
  }

  public set id(value: number) {
    this._id = value;
  }

  public get can_be_deleted(): boolean {
    return this._can_be_deleted;
  }

  public set can_be_deleted(value: boolean) {
    this._can_be_deleted = value;
  }

  public toJSON() {
    return {
      id: this._id,
      nombre: this._nombre,
      unidadId: this._unidadId,
      precio: this._precio,
      cantidad: this._cantidad,
    };
  }
}

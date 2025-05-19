export default class Ingrediente {
  private _id: number;
  private _productoId: number;
  private _unidadId: number;
  private _cantidad: number;

  constructor(id: number = 0, productoId: number = 0, unidadId: number = 0, cantidad: number = 0) {
    this._id = id;
    this._unidadId = unidadId;
    this._productoId = productoId;
    this._cantidad = cantidad;
  }

  public get cantidad(): number {
    return this._cantidad;
  }

  public set cantidad(value: number) {
    this._cantidad = value;
  }

  public get productoId(): number {
    return this._productoId;
  }

  public set productoId(value: number) {
    this._productoId = value;
  }

  public get unidadId(): number {
    return this._unidadId;
  }

  public set unidadId(value: number) {
    this._unidadId = value;
  }

  public get id(): number {
    return this._id;
  }

  public set id(value: number) {
    this._id = value;
  }

  public toJSON() {
    return {
      id: this.id,
      productoId: this.productoId,
      unidadId: this.unidadId,
      cantidad: this.cantidad,
    };
  }

  public clone(): Ingrediente {
    return new Ingrediente(this._id, this._productoId, this._unidadId, this._cantidad);
  }
}

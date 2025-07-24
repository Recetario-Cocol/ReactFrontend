import Ingrediente from "../ingrediente/Ingrediente";

export default class Receta {
  private _id: number;
  private _nombre: string;
  private _rinde: number;
  private _ingredientes: Array<Ingrediente>;
  private _observaciones: string;
  private _precio: number;
  private _precio_unidad: number;

  constructor(
    id: number = 0,
    nombre: string = "",
    rinde: number = 0,
    ingredientes: Array<Ingrediente> = [],
    observaciones: string = "",
    precio: number = 0,
    precio_unidad: number = 0,
  ) {
    this._id = id;
    this._nombre = nombre;
    this._rinde = rinde;
    this._ingredientes = ingredientes;
    this._observaciones = observaciones;
    this._precio = precio;
    this._precio_unidad = precio_unidad;
  }

  public get rinde(): number {
    return this._rinde;
  }

  public set rinde(value: number) {
    this._rinde = value;
  }

  public get ingredientes(): Array<Ingrediente> {
    return this._ingredientes;
  }

  public set ingredientes(value: Array<Ingrediente>) {
    this._ingredientes = value;
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

  public get observaciones(): string {
    return this._observaciones;
  }

  public set observaciones(value: string) {
    this._observaciones = value;
  }

  public set precio(precio: number) {
    this._precio = precio;
  }

  public get precio(): number {
    return this._precio;
  }

  public set precio_unidad(precio_unidad: number) {
    this._precio_unidad = precio_unidad;
  }

  public get precio_unidad() {
    return this._precio_unidad;
  }

  public toJSON() {
    return {
      id: this.id,
      nombre: this.nombre,
      rinde: Number(this.rinde),
      ingredientes: this.ingredientes.map((ingrediente) => ingrediente.toJSON()),
      observaciones: this.observaciones,
      precio: this.precio,
      precio_unidad: this.precio_unidad,
    };
  }
}

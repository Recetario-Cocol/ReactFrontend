import Ingrediente from "../ingrediente/Ingrediente";

export default class Receta {
  private _id: number;
  private _nombre: string;
  private _rinde: number;
  private _ingredientes: Array<Ingrediente>;
  private _observaciones: string;

  constructor(
    id: number = 0,
    nombre: string = "",
    rinde: number = 0,
    ingredientes: Array<Ingrediente> = [],
    observaciones: string = "",
  ) {
    this._id = id;
    this._nombre = nombre;
    this._rinde = rinde;
    this._ingredientes = ingredientes;
    this._observaciones = observaciones;
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

  public toJSON() {
    return {
      id: this._id,
      nombre: this._nombre,
      rinde: this._rinde,
      ingredientes: this._ingredientes.map((ingrediente) => ingrediente.toJSON()),
      observaciones: this._observaciones,
    };
  }
}

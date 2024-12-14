
export class Unidad {
  private _id: number;
  private _nombre: string;
  private _abreviacion: string;

  constructor(id: number = 0, nombre: string = "", abreviacion: string = "") {
    this._id = id;
    this._nombre = nombre;
    this._abreviacion = abreviacion;
  }

  // Getters
  public get id(): number {
    return this._id;
  }

  public get nombre(): string {
    return this._nombre;
  }

  public get abreviacion(): string {
    return this._abreviacion;
  }

  // Setters
  public set id(value: number) {
    this._id = value;
  }

  public set nombre(value: string) {
    this._nombre = value;
  }

  public set abreviacion(value: string) {
    this._abreviacion = value;
  }

  public toJSON() {
    return {
      id: this._id,
      nombre: this._nombre,
      abreviacion: this._abreviacion,
    };
  }
}


export class Unidad {
  private _id: number;
  private _nombre: string;
  private _abreviacion: string;
  private _canBeDeleted: boolean;

  constructor(id: number = 0, nombre: string = "", abreviacion: string = "", canBeDeleted: boolean = false) {
    this._id = id;
    this._nombre = nombre;
    this._abreviacion = abreviacion;
    this._canBeDeleted = canBeDeleted;
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

  public get canBeDeleted(): boolean {
    return this._canBeDeleted;
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

  public set canBeDeleted(value: boolean) {
    this._canBeDeleted = value;
  }

  public toJSON() {
    return {
      id: this._id,
      nombre: this._nombre,
      abreviacion: this._abreviacion,
    };
  }
}

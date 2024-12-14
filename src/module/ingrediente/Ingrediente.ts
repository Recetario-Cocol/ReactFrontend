export default class Ingrediente {
    private _id: number;
    private _paqueteId: number;
    private _unidadId: number;
    private _cantidad: number;

    constructor(id: number = 0, paqueteId: number = 0, unidadId: number = 0, cantidad: number = 0) {
        this._id = id;
        this._unidadId = unidadId;
        this._paqueteId = paqueteId;
        this._cantidad = cantidad;
    }

    public get cantidad(): number {
        return this._cantidad;
    }
    
    public set cantidad(value: number) {
        this._cantidad = value;
    }
    
    public get paqueteId(): number {
        return this._paqueteId;
    }
    
    public set paqueteId(value: number) {
        this._paqueteId = value;
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
            id: this._id < 0 ? null : this._id,
            unidadId: this._unidadId,
            paqueteId: this._paqueteId,
            cantidad: this._cantidad,
        };
    }

    public clone(): Ingrediente {
        return new Ingrediente(this._id, this._paqueteId, this._unidadId, this._cantidad);
    }
}
import Ingrediente from "../ingrediente/Ingrediente";

export default class Receta {
    private _id: number;
    private _nombre: String;
    private _rinde: number;
    private _ingredientes: Array<Ingrediente>;


    constructor(id: number = 0, nombre: String = '', rinde: number = 0, ingredientes: Array<Ingrediente> = []) {
        this._id = id;
        this._nombre = nombre;
        this._rinde = rinde;
        this._ingredientes = ingredientes;
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
    
    public get nombre(): String {
        return this._nombre;
    }
    
    public set nombre(value: String) {
        this._nombre = value;
    }
      
    public get id(): number {
        return this._id;
    }
    
    public set id(value: number) {
        this._id = value;
    }
    
    public toJSON() {
        return {
            id: this._id,
            nombre: this._nombre,
            rinde: this._rinde,
            ingredientes: this._ingredientes.map(ingrediente => ingrediente.toJSON())
        };
    }
}
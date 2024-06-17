export interface solicitudAceptada {
    nombreColab: string;
    especialidad: string;
    descripcion: string;
    uid: string;
    tomada: boolean; 
    nombreCliente: string; 
    numero?: string;
    idColab?: string;
    direccion: string;
    horario: string;
    diaDispo: string;
    estado:string;
    aceptada? : boolean;
    idCliente?: string;

}
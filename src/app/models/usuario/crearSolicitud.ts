export interface solicitud {
    idCliente?: string; //idCliente agregado para recorrer la tabla
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
    aceptada: boolean;
}
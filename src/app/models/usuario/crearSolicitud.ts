export interface solicitud {
    nombreColab: string;
    especialidad: string;
    descripcion: string;
    uid: string;
    tomada: boolean; 
    nombreCliente: string; 
    numero?: string;
    idColab?: string;
    idCliente?: string;
    direccion: string;
    horario: string;
    aceptada: boolean;
    idActivacion: string;
    estado: string;
}
export interface user {
  perfil: string;
  nombre: string;
  correo: string;
  numero: string;
  password: string;
  uid: string;
  especialidad?: string;  // Propiedad opcional, útil solo para colaboradores si es necesario
  idColab?: string;
  direccion?: string,
  idCliente?: string
}
import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable, map } from 'rxjs';
import { user } from '../models/usuario/usuario';
import { solicitud } from '../models/usuario/crearSolicitud';
import { activarServicios } from '../models/usuario/colabActivo';
import { solicitudAceptada } from '../models/usuario/solicitudAceptada';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(
    private angularFireAuth: AngularFireAuth,
    private firestore: AngularFirestore,
    private afAuth: AngularFireAuth
  ) {}

  login(correo: string, password: string): Promise<any> {
    return this.angularFireAuth.signInWithEmailAndPassword(correo, password);
  }

  logout(): Promise<void> {
    return this.angularFireAuth.signOut();
  }

  getCurrentUser(): Observable<any> {
    return this.afAuth.authState;
  }

  async registerUser(datos: user): Promise<any> {
    try {
      const result = await this.angularFireAuth.createUserWithEmailAndPassword(datos.correo, datos.password);
      const collection = datos.perfil === 'colaborador' ? 'Colaboradores' : 'Clientes';
      await this.firestore.collection(collection).doc(result.user.uid).set({
        nombre: datos.nombre,
        correo: datos.correo,
        numero: datos.numero,
        perfil: datos.perfil,
        // Añade aquí otros campos necesarios
      });
      return result;
    } catch (error) {
      throw error;
    }
  }

  async saveUserData(userData: user, collection: string): Promise<void> {
    try {
      await this.firestore.collection(collection).doc(userData.uid).set(userData);
    } catch (error) {
      throw error;
    }
  }

  getUserProfile(uid: string): Observable<any> {
    return this.firestore.collection('Clientes').doc(uid).valueChanges();
  }

  private async isProfile(collection: string, uid: string, profile: string): Promise<boolean> {
    const userDoc = await this.firestore.collection(collection).doc(uid).ref.get();
    if (userDoc.exists) {
      const userData: any = userDoc.data();
      return userData.perfil === profile;
    } else {
      return false;
    }
  }

  isAdmin(uid: string): Promise<boolean> {
    return this.isProfile('admin', uid, 'admin');
  }

  isColaborador(uid: string): Promise<boolean> {
    return this.isProfile('Colaboradores', uid, 'colaborador');
  }

  isCliente(uid: string): Promise<boolean> {
    return this.isProfile('Clientes', uid, 'cliente');
  }

  // Método para enviar un enlace de restablecimiento de contraseña al correo electrónico
  async resetPassword(email: string): Promise<void> {
    return this.angularFireAuth.sendPasswordResetEmail(email)
      .then(() => console.log("Correo de restablecimiento enviado."))
      .catch(error => console.error("Error enviando correo de restablecimiento: ", error));
  }

  async getUserAdditionalInfoColaborador(uid: string) {
    const userDoc = await this.firestore
      .collection('Colaboradores')
      .doc(uid)
      .ref.get();
    if (userDoc.exists) {
      return userDoc.data();
    } else {
      return null;
    }
  }

  async activarColab(datosColaborador: activarServicios) {
    if (
      !datosColaborador.nombre ||
      !datosColaborador.especialidad ||
      !datosColaborador.descripcion     
    ) {
      throw new Error('Todos los campos deben completarse.');
    }

    try {
      const result = await this.firestore.collection('ColaboradorActivo').add(datosColaborador);
      return result;
    } catch (error) {
      throw error;
    }
  }

  getColaboradorActivo(): Observable<solicitud[]> {
    return this.firestore.collection<solicitud>('ColaboradorActivo').valueChanges();
  }

  getUniqueSpecialities() {
    return this.firestore
      .collection<solicitud>('ColaboradorActivo')
      .get()
      .pipe(
        map((querySnapshot) => {
          const especialidades: string[] = [];
          querySnapshot.forEach((doc) => {
            const data = doc.data() as solicitud;
            if (data && data.especialidad) {
              especialidades.push(data.especialidad);
            }
          });
          return Array.from(new Set(especialidades));
        })
      );
  }

  getColabActiveByEspecialidad(especialidad: string) {
    return this.firestore
      .collection<solicitud>('ColaboradorActivo', (ref) =>
        ref.where('especialidad', '==', especialidad)
      )
      .valueChanges();
  }

  getSolicitudesColab(): any {
    return this.firestore.collection('SolicitudesColab', ref => ref.where('aceptada', '==', false)).valueChanges();
  }

  async createSolicitud(solicitudData: solicitud): Promise<void> {
    try {
      // Asegurarse de que los datos de la solicitud sean válidos
      if (
        !solicitudData.nombreColab ||
        !solicitudData.especialidad ||
        !solicitudData.descripcion ||
        !solicitudData.uid ||
        !solicitudData.nombreCliente
      ) {
        throw new Error('Todos los campos de la solicitud deben completarse.');
      }
  
    await this.firestore.collection('Solicitudes').doc(solicitudData.uid).set(solicitudData);
    } catch (error) {
      throw error;
    }
  }

  
  
  async getNombreClienteActual(): Promise<{ nombre: string | null, direccion: string | null, numero: string | null , idCliente: string| null}> {
    try {
      const user = await this.angularFireAuth.currentUser;
      if (user) {
        const userData = await this.firestore.collection('Clientes').doc(user.uid).get().toPromise();
        const nombreCliente = userData.get('nombre');
        const direccionCliente = userData.get('direccion');
        const numeroCliente = userData.get('numero');
        const idCliente = userData.get('idCliente');
        return {
          nombre: nombreCliente,
          direccion: direccionCliente,
          numero: numeroCliente,
          idCliente: idCliente,
        };
      } else {
        return {
          nombre: null,
          direccion: null,
          numero: null,
          idCliente: null,
        };
      }
    } catch (error) {
      console.error('Error al obtener el nombre y la dirección del cliente:', error);
      return {
        nombre: null,
        direccion: null,
        numero: null,
        idCliente: null,
      };
    }
  }
  
  async getNombreColaboradorActual(): Promise<string | null> {
    try {
      const user = await this.angularFireAuth.currentUser;
      if (user) {
        const userData = await this.firestore.collection('Colaboradores').doc(user.uid).get().toPromise();
        const nombreColaborador = userData.get('nombre');
        return nombreColaborador;
      } else {
        return null;
      }
    } catch (error) {
      console.error('Error al obtener el nombre del cliente:', error);
      return null;
    }
  }

  async getIdColabActual(): Promise<string | null> {
    try {
      const currentUser = await this.afAuth.currentUser;

      if (currentUser) {
        const userData = await this.firestore.collection('Colaboradores').doc(currentUser.uid).get().toPromise();
        const idColab = userData.get('idColab');
        return idColab || null; // Devuelve idColab si existe, de lo contrario devuelve null
      } else {
        return null; // Devuelve null si no hay usuario autenticado
      }
    } catch (error) {
      console.error('Error al obtener el idColab del usuario actual:', error);
      return null; // Manejar el error devolviendo null
    }
  }

  async getIdClienteActual(): Promise<string | null> {
    try {
      const currentUser = await this.afAuth.currentUser;

      if (currentUser) {
        const userData = await this.firestore.collection('Clientes').doc(currentUser.uid).get().toPromise();
        const idCliente = userData.get('idCliente');
        return idCliente || null; // Devuelve idCliente si existe, de lo contrario devuelve null
      } else {
        return null; // Devuelve null si no hay usuario autenticado
      }
    } catch (error) {
      console.error('Error al obtener el idCliente del usuario actual:', error);
      return null; // Manejar el error devolviendo null
    }
  }
  private async getUserAdditionalInfo(collection: string, uid: string) {
    const userDoc = await this.firestore.collection(collection).doc(uid).ref.get();
    return userDoc.exists ? userDoc.data() : null;
  }

  getUserAdditionalInfoCliente(uid: string) {
    return this.getUserAdditionalInfo('Clientes', uid);
  }

  getUserAdditionalInfoColab(uid: string) {
    return this.getUserAdditionalInfo('Colaboradores', uid);
  }

  getUserAdditionalInfoAdmin(uid: string) {
    return this.getUserAdditionalInfo('admin', uid);
  }
  getSolicitudesAceptadas(): Observable<solicitudAceptada[]> {
    return this.firestore.collection<solicitudAceptada>('solicitudesAceptadas').valueChanges();
  }

  async getIdActivacion(idColab: string): Promise<string | null> {
    try {
      const colaboradorDoc = await this.firestore.collection('ColaboradorActivo').doc(idColab).ref.get();
      const colaboradorData = colaboradorDoc.data() as { idActivacion?: string };
      return colaboradorData?.idActivacion || null;
    } catch (error) {
      console.error('Error al obtener el idActivacion:', error);
      return null;
    }
  }

}

import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { firstValueFrom } from 'rxjs';
const storagePaciente = 'pacienteData';

@Injectable({
  providedIn: 'root',
})
export class StorageService {
  constructor(private firestore: AngularFirestore) { }

  createDoc(data: any, path: string, id: string) {
  return this.firestore.collection(path).doc(id).set(data);
}

  getDoc<tipo>(path: string, id: string) {
    return this.firestore.collection(path).doc<tipo>(id).valueChanges();
  }

  getCollection<tipo>(path: string) {
    return this.firestore.collection<tipo>(path).valueChanges();
  }

  getId() {
    return this.firestore.createId();
  }

  // Método corregido para verificar si el correo electrónico o teléfono existen
  async emailOrPhoneExists(email: string, phone: string): Promise<boolean> {
    // Obtener las referencias de las consultas
    const emailRef = this.firestore.collection('usuarios', ref => ref.where('correo', '==', email).limit(1));
    const phoneRef = this.firestore.collection('usuarios', ref => ref.where('numero', '==', phone).limit(1));

    // Convertir los Observables a Promesas usando firstValueFrom
    const emailSnap = await firstValueFrom(emailRef.get());
    const phoneSnap = await firstValueFrom(phoneRef.get());

    // Verificar si existen documentos en las instantáneas
    return !emailSnap.empty || !phoneSnap.empty;
  }
}


  
import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Router } from '@angular/router';
import { user } from 'src/app/models/usuario/usuario';
import { AuthService } from 'src/app/services/auth.service';
import { HelperService } from 'src/app/services/helper.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage implements OnInit {

  clienteData: any = null;
  colabData: any = null;
  adminData: any= null;
  editingUser: any = null;
  editedUser: any = {};
  isModalOpen = false;
  clientes: any[] = [];
  colaboradores: any[] = [];
  datos: user = {
    nombre: '',
    correo: '',
    numero: '',
    password: '',
    uid: '',
    perfil: '',
    especialidad: '',
    direccion: '',
    idColab: '',
    idCliente: ''
  };

  constructor(
    private router: Router,
    private auth: AuthService,
    private helper: HelperService,
    private firestore: AngularFirestore
  ) { }

  ngOnInit() {
    this.auth.getCurrentUser().subscribe(async (user) => {
      if (user) {
        this.clienteData = await this.auth.getUserAdditionalInfoCliente(user.uid);
        this.colabData = await this.auth.getUserAdditionalInfoColab(user.uid);
        this.adminData = await this.auth.getUserAdditionalInfoAdmin(user.uid);
  
        // Asegurarse de que los datos adicionales tienen el uid
        if (this.clienteData) {
          this.clienteData.uid = user.uid;
          console.log('Perfil cliente');
        }
        if (this.colabData) {
          this.colabData.uid = user.uid;
          console.log('Perfil colaborador');
        }
        if (this.adminData) {
          this.adminData.uid = user.uid;
          console.log('Admin');
        }
      }
    });
  }
  
  

  async logout() {
    const result = await this.helper.presentAlert(
      'Cerrar Sesión',
      '¿Está seguro de que desea cerrar sesión?',
      ''
    );

    if (result) {
      try {
        await this.auth.logout();
        console.log('Cierre de sesión exitoso');
        this.helper.presentToast('Cierre de sesión exitoso');
        this.router.navigate(['/login']);
      } catch (error) {
        console.error('Error durante el cierre de sesión', error);
        this.helper.presentToast('Error al cerrar sesión');
      }
    }
  }

  editarUsuario(usuario: any) {
    if (!usuario) {
      console.error('usuario is undefined');
      this.helper.presentToast('Error: Usuario no definido');
      return;
    }
  
    this.editingUser = usuario;
    this.editedUser = { ...usuario }; // Hacer una copia del usuario para editar
    this.setOpen(true); // Abre el modal cuando se edita un usuario
  }
  
  

  cancelarEdicion() {
    this.editingUser = null;
    this.editedUser = {};
    this.setOpen(false); // Cierra el modal al cancelar la edición
  }

  setOpen(isOpen: boolean) {
    this.isModalOpen = isOpen; // Controla el estado del modal
  }

  guardarCambios() {
    if (!this.editingUser) {
      console.error('editingUser is undefined');
      this.helper.presentToast('Error: No hay un usuario en edición');
      return;
    }
  
    const uid = this.editingUser.uid;
    if (!uid) {
      console.error('uid is undefined');
      this.helper.presentToast('Error: El UID del usuario en edición no está definido');
      return;
    }
  
    const datosEditados = { ...this.editedUser };
    console.log('Datos editados:', datosEditados);
  
    let collection = '';
  
    if (this.clienteData && this.clienteData.uid === uid) {
      collection = 'Clientes';
    } else if (this.colabData && this.colabData.uid === uid) {
      collection = 'Colaboradores';
    } else if (this.adminData && this.adminData.uid === uid) {
      collection = 'Admins';
    }
  
    console.log('Cambios guardados en:', collection);
  
    if (collection) {
      this.firestore.collection(collection).doc(uid).update(datosEditados)
        .then(() => {
          this.helper.presentToast('Cambios guardados con éxito');
  
          // Actualizar los datos locales
          if (collection === 'Clientes') {
            this.clienteData = { ...this.clienteData, ...datosEditados };
          } else if (collection === 'Colaboradores') {
            this.colabData = { ...this.colabData, ...datosEditados };
          } else if (collection === 'Admins') {
            this.adminData = { ...this.adminData, ...datosEditados };
          }
  
          this.cancelarEdicion();
        })
        .catch((error) => {
          console.error('Error al guardar cambios', error);
          this.helper.presentToast('Error al guardar cambios');
        });
    } else {
      console.error('No se encontró la colección correspondiente para el usuario');
      this.helper.presentToast('Error: No se encontró la colección correspondiente para el usuario');
    }
  }
  
}

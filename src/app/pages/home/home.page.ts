import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AlertController } from '@ionic/angular';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { user } from 'src/app/models/usuario/usuario';
import { HelperService } from 'src/app/services/helper.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {
  
  isAdmin?: boolean;
  clientes: any[] = [];
  colaboradores: any[] = [];
  editingUser: any = null;
  editedUser: any = {};
  isModalOpen = false; // Propiedad para controlar el estado del modal
  datos: user = {
    nombre: '',
    correo: '',
    numero: '',
    password: '',
    uid: '',
    perfil: '',
    especialidad: '',
    direccion: '',
  };

  constructor(
    private authService: AuthService,
    private firestore: AngularFirestore,
    private router: Router,
    private helper: HelperService,
    private alertController: AlertController // Añadido AlertController
  ) {}

  ngOnInit() {
    this.authService.getCurrentUser().subscribe(async (user) => {
      if (user) {
        this.isAdmin = await this.authService.isAdmin(user.uid);

        if (!this.isAdmin) {
          console.log('Acceso no autorizado');
          // Aquí puedes redirigir a otra página o mostrar un mensaje al usuario
        } else {
          // Si es admin, carga la lista de usuarios
          this.loadClientes();
          this.loadColaboradores();
        }
      }
    });
  }

  loadClientes() {
    this.firestore.collection('Clientes').valueChanges().subscribe((data) => {
      this.clientes = data;
    });
  }

  loadColaboradores() {
    this.firestore.collection('Colaboradores').valueChanges().subscribe((data) => {
      this.colaboradores = data;
    });
  }

  editarUsuario(clientes: any) {
    this.editingUser = clientes;
    this.editedUser = { ...clientes }; // Hacer una copia del usuario para editar
    this.setOpen(true); // Abre el modal cuando se edita un usuario
  }

  cancelarEdicion() {
    this.editingUser = null;
    this.editedUser = {};
    this.setOpen(false); // Cierra el modal al cancelar la edición
  }

  guardarCambios() {
    const uid = this.editingUser.uid;
    const perfil = this.editingUser.perfil; // Obtener el perfil del usuario en edición
    const datosEditados = { ...this.editedUser }; // Copiar los datos editados
    
    if (perfil === 'cliente') {
      // Si es un cliente, actualizar en la colección 'Clientes'
      this.firestore.collection('Clientes').doc(uid).update(datosEditados)
        .then(() => {
          this.helper.presentToast('Cambios guardados con éxito');
          this.cancelarEdicion();
        })
        .catch((error) => {
          console.error('Error al guardar cambios', error);
          this.helper.presentToast('Error al guardar cambios');
        });
    } else if (perfil === 'colaborador') {
      // Si es un colaborador, actualizar en la colección 'Colaboradores'
      this.firestore.collection('Colaboradores').doc(uid).update(datosEditados)
        .then(() => {
          this.helper.presentToast('Cambios guardados con éxito');
          this.cancelarEdicion();
        })
        .catch((error) => {
          console.error('Error al guardar cambios', error);
          this.helper.presentToast('Error al guardar cambios');
        });
    } else {
      // Manejar otros perfiles si es necesario
      console.error('Perfil de usuario no válido:', perfil);
      this.helper.presentToast('Perfil de usuario no válido');
    }
  }

  async confirmarEliminarUsuario(uid: string, perfil: string) {
    const alert = await this.alertController.create({
      header: 'Confirmar Eliminación',
      message: '¿Estás seguro de que deseas eliminar este usuario? Esta acción no se puede deshacer.',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          handler: () => {
            console.log('Eliminación cancelada');
          }
        },
        {
          text: 'Eliminar',
          handler: () => {
            this.eliminarUsuario(uid, perfil);
          }
        }
      ]
    });

    await alert.present();
  }

  async eliminarUsuario(uid: string, perfil: string) {
    try {
      const collectionName = perfil === 'cliente' ? 'Clientes' : 'Colaboradores';
      await this.firestore.collection(collectionName).doc(uid).delete();
      this.helper.presentToast('Usuario eliminado con éxito');
    } catch (error) {
      console.error('Error al eliminar usuario', error);
      this.helper.presentToast('Error al eliminar usuario');
    }
  }

  setOpen(isOpen: boolean) {
    this.isModalOpen = isOpen; // Controla el estado del modal
  }
}


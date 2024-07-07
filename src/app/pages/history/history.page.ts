import { ChangeDetectorRef, Component, OnInit, OnDestroy } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { solicitudAceptada } from 'src/app/models/usuario/solicitudAceptada';
import { Subscription } from 'rxjs';
import { User } from 'firebase/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AlertController, LoadingController } from '@ionic/angular';
import { ViewWillEnter } from '@ionic/angular';
import { HelperService } from 'src/app/services/helper.service';


@Component({
  selector: 'app-history',
  templateUrl: './history.page.html',
  styleUrls: ['./history.page.scss'],
})
export class HistoryPage implements OnInit, OnDestroy, ViewWillEnter  {
  solicitudesAceptadas: solicitudAceptada[] = [];
  solicitudesSubscription: Subscription;
  isCliente: boolean = false;
  isColaborador: boolean = false;
  clienteData: any = null;
  colabData: any = null;
  adminData: any= null;

  constructor(
    private authService: AuthService,
    private firestore: AngularFirestore,
    private alertController: AlertController,
    private cdRef: ChangeDetectorRef,
    private auth: AuthService,
    private loadingController: LoadingController,
    private helper: HelperService
  ) { }

  ngOnInit() {
    this.checkUserProfile();
    this.auth.getCurrentUser().subscribe(async (user) => {
      if (user) {
        // Obtener datos adicionales del cliente y colaborador
        this.clienteData = await this.auth.getUserAdditionalInfoCliente(user.uid);
        this.colabData = await this.auth.getUserAdditionalInfoColab(user.uid);
        this.adminData = await this.auth.getUserAdditionalInfoAdmin(user.uid);
      }
    });
  }

  ionViewWillEnter() {
    this.getSolicitudesAceptadas();
  }
  async getSolicitudesAceptadas() {
    try {
      const user: User = await new Promise<User>((resolve, reject) => {
        this.authService.getCurrentUser().subscribe(
          (currentUser) => resolve(currentUser),
          (error) => reject(error)
        );
      });

      if (user && user.uid) {
        const isCliente = await this.authService.isCliente(user.uid);
        const isColaborador = await this.authService.isColaborador(user.uid);

        let idColabActual = null;
        let idClienteActual = null;

        if (isColaborador) {
          idColabActual = await this.authService.getIdColabActual();
        }

        if (isCliente) {
          idClienteActual = await this.authService.getIdClienteActual();
        }

        let collectionRef;
        if (idColabActual) {
          collectionRef = this.firestore.collection<solicitudAceptada>('solicitudesAceptadas', ref =>
            ref.where('idColab', '==', idColabActual)
          );
        } else if (idClienteActual) {
          collectionRef = this.firestore.collection<solicitudAceptada>('solicitudesAceptadas', ref =>
            ref.where('idCliente', '==', idClienteActual)
          );
        } else {
          console.error('Usuario no tiene perfil adecuado.');
          return;
        }

        const snapshot = await collectionRef.get().toPromise();
        this.solicitudesAceptadas = snapshot.docs.map(doc => doc.data() as solicitudAceptada);

        this.cdRef.detectChanges();
      }
    } catch (error) {
      console.error('Error al obtener las solicitudes aceptadas:', error);
    }
  }

  async checkUserProfile() {
    try {
      const user: User = await new Promise<User>((resolve, reject) => {
        this.authService.getCurrentUser().subscribe(
          (currentUser) => resolve(currentUser),
          (error) => reject(error)
        );
      });

      if (user && user.uid) {
        this.isCliente = await this.authService.isCliente(user.uid);
        this.isColaborador = await this.authService.isColaborador(user.uid);
        this.cdRef.detectChanges();

        // Llamar a getSolicitudesAceptadas con los datos de usuario
        this.getSolicitudesAceptadas();
      }
    } catch (error) {
      console.error('Error al verificar el perfil del usuario:', error);
    }
  }

  async presentConfirmAlert(solicitud: solicitudAceptada) {
    const nuevoEstado = solicitud.estado === 'En proceso' ? 'Finalizada' : 'En proceso';
    const alert = await this.alertController.create({
      header: 'Confirmar',
      message: `¿Está seguro de que desea cambiar el estado a "${nuevoEstado}"?`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'secondary',
          handler: () => {
            console.log('Cambio de estado cancelado');
          }
        },
        {
          text: 'Confirmar',
          handler: () => {
            this.changeSolicitudState(solicitud, nuevoEstado);
          }
        }
      ]
    });

    await alert.present();
  }

  async changeSolicitudState(solicitud: solicitudAceptada, nuevoEstado: string) {
    try {
      await this.firestore.collection('solicitudesAceptadas').doc(solicitud.uid).update({ estado: nuevoEstado });
      solicitud.estado = nuevoEstado;
      this.cdRef.detectChanges();
      console.log('Estado de la solicitud actualizado con éxito');
    } catch (error) {
      console.error('Error al actualizar el estado de la solicitud:', error);
    }
  }

  ngOnDestroy() {
    if (this.solicitudesSubscription) {
      this.solicitudesSubscription.unsubscribe();
    }
  }

  async confirmarEliminarUsuario(uid: string) {
    const alert = await this.alertController.create({
      header: 'Confirmar eliminación',
      message: '¿Está seguro de que desea eliminar esta solicitud?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'secondary',
          handler: () => {
            console.log('Eliminación cancelada');
          }
        },
        {
          text: 'Eliminar',
          handler: async () => {
            await this.eliminarSolicitud(uid);
          }
        }
      ]
    });

    await alert.present();
  }

  async eliminarSolicitud(uid: string) {
    try {
      await this.firestore.collection('solicitudesAceptadas').doc(uid).delete();
      this.helper.presentToast('Solicitud eliminada exitosamente');
      this.solicitudesAceptadas = this.solicitudesAceptadas.filter(solicitud => solicitud.uid !== uid);
      this.cdRef.detectChanges();
    } catch (error) {
      console.error('Error al eliminar la solicitud:', error);
      this.helper.presentToast('Error al eliminar la solicitud');
    }
  }
  async presentAlert() {
    const alert = await this.alertController.create({
      header: 'Historial',
      message: `
        ¡En esta seccion puedes revisar el historial de tus solicitudes ACEPTADAS!\n
        -¡Tambien puedes ELIMINAR !\n


      `,
      buttons: ['De acuerdo'],
    });

    await alert.present();
  }

}

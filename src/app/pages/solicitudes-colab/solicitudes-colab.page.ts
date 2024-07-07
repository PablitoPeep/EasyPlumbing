import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { solicitud } from 'src/app/models/usuario/crearSolicitud';
import { solicitudAceptada } from 'src/app/models/usuario/solicitudAceptada';
import { AuthService } from 'src/app/services/auth.service';
import { HelperService } from 'src/app/services/helper.service';
import { ViewWillEnter } from '@ionic/angular';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-solicitudes-colab',
  templateUrl: './solicitudes-colab.page.html',
  styleUrls: ['./solicitudes-colab.page.scss'],
})
export class SolicitudesColabPage implements OnInit, ViewWillEnter {

  usuarioEnLinea: any;
  esColaboradorActivo: boolean = false;
  solicitudesRecibidas: solicitud[] = [];
  nombreColaborador: string | null = null;
  soliAceptadas: solicitudAceptada[] = [];

  constructor(
    private authService: AuthService,
    private firestore: AngularFirestore,
    private helper: HelperService,
    private cdRef: ChangeDetectorRef,
    private alertController: AlertController
  ) { }


  async ngOnInit() {
    await this.getNombreColaboradorActual();
    await this.getSolicitudesServicio();
  }

  ionViewWillEnter() {
    this.getSolicitudesServicio();
  }

  async getNombreColaboradorActual() {
    try {
      this.nombreColaborador = await this.authService.getNombreColaboradorActual();
      if (this.nombreColaborador) {
        console.log('Nombre del colaborador:', this.nombreColaborador);
      } else {
        console.log('No se pudo obtener el nombre del colaborador.');
      }
    } catch (error) {
      console.error('Error al obtener el nombre del colaborador:', error);
    }
  }

  async getSolicitudesServicio() {
    try {
      const idColabActual = await this.authService.getIdColabActual();
      if (!idColabActual) {
        console.log('No se pudo obtener el idColab del usuario en línea.');
        return;
      }

      const snapshot = await this.firestore.collection('solicitarServicio').ref
        .where('idColab', '==', idColabActual)
        .where('aceptada', '==', false) // Filtrar las solicitudes que no han sido aceptadas
        .get();

      this.solicitudesRecibidas = [];
      snapshot.forEach(doc => {
        const solicitudData = doc.data() as solicitud;
        this.solicitudesRecibidas.push(solicitudData);
      });

      // Forzar la actualización de la vista
      this.cdRef.detectChanges();

    } catch (error) {
      console.error('Error al obtener las solicitudes de servicio:', error);
    }
  }

  async eliminarSolicitud(uid: string) {
    try {
      await this.firestore.collection('solicitarServicio').doc(uid).delete();
      this.helper.presentToast('Solicitud eliminada con éxito');
      this.solicitudesRecibidas = this.solicitudesRecibidas.filter(solicitud => solicitud.uid !== uid);
      this.cdRef.detectChanges();
    } catch (error) {
      console.error('Error al eliminar la solicitud', error);
      this.helper.presentToast('Error al eliminar la solicitud');
    }
  }


  async aceptarSolicitud(soliAceptada: solicitudAceptada) {
    try {
      const nombreColaborador = await this.authService.getNombreColaboradorActual();
      if (!nombreColaborador) {
        console.error('No se pudo obtener el nombre del colaborador.');
        return;
      }

      const solicitudExistente = await this.firestore.collection('solicitudesAceptadas').doc(soliAceptada.uid).get().toPromise();
      const data = solicitudExistente.data() as any;

      if (!data || !data.tomada) {
        soliAceptada.tomada = true;
        soliAceptada.estado = 'Finalizado';

        await this.firestore.collection('solicitudesAceptadas').doc(soliAceptada.uid).set(soliAceptada);

        // Marcar la solicitud original como aceptada
        await this.firestore.collection('solicitarServicio').doc(soliAceptada.uid).update({ aceptada: true });

        // Remover la solicitud aceptada de la lista visible
        this.solicitudesRecibidas = this.solicitudesRecibidas.filter(s => s.uid !== soliAceptada.uid);

        // Forzar la actualización de la vista
        this.cdRef.detectChanges();
        console.log('La solicitud tomada se ha guardado con éxito en solicitarServicio:', soliAceptada);
        this.helper.presentToast('Solicitud aceptada con éxito');
      } else {
        console.warn('La solicitud ya ha sido enviada anteriormente.');
      }
    } catch (error) {
      console.error('Error al intentar guardar la solicitud:', error);
      this.helper.presentToast('Error al aceptar la solicitud');
    }

  }
  async presentAlert() {
    const alert = await this.alertController.create({
      header: 'Solicitudes',
      message: `
        ¡En esta seccion puedes revisar las solicitudes que te han llegado de los clientes!\n
        -¡Tambien puedes decidir si deseas aceptar o no trabajo!\n


      `,
      buttons: ['De acuerdo'],
    });

    await alert.present();
  }

}

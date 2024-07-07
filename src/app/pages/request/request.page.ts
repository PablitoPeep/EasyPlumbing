import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { solicitud } from 'src/app/models/usuario/crearSolicitud';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { HelperService } from 'src/app/services/helper.service';
import { ViewWillEnter } from '@ionic/angular';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-request',
  templateUrl: './request.page.html',
  styleUrls: ['./request.page.scss'],
})
export class RequestPage implements OnInit, ViewWillEnter {

  filtroEspecialidad: string = '';
  colabActive: solicitud[] = [];
  noColabActive: boolean = true;
  nombreCliente: string | null = null;
  numero: string | null = null;
  isModalOpen = false;
  direccionCliente: string | null = null;
  idCliente: string | null = null;
  solicitudesTomadas: string[] = []; // Array para almacenar IDs de solicitudes tomadas por el cliente

  constructor(
    private authService: AuthService,
    private firestore: AngularFirestore,
    private helper: HelperService,
    private alertController: AlertController
  ) { }
  ionViewWillEnter() {
    this.cargarSolicitudesTomadas();
  }

  async ngOnInit() {
    await this.getNombreClienteActual();
    this.cargarSolicitudesTomadas();
  }

  async getNombreClienteActual() {
    try {
      const clienteInfo = await this.authService.getNombreClienteActual();
      this.nombreCliente = clienteInfo.nombre;
      this.direccionCliente = clienteInfo.direccion;
      this.idCliente = clienteInfo.idCliente;
      this.numero = clienteInfo.numero;

      if (this.nombreCliente) {
        console.log('Nombre del cliente:', this.nombreCliente);
        // Cargar las solicitudes que ya ha tomado el cliente
        this.cargarSolicitudesTomadas();
      } else {
        console.log('No se pudo obtener el nombre del cliente.');
      }
    } catch (error) {
      console.error('Error al obtener el nombre del cliente:', error);
    }
  }

  cargarSolicitudesTomadas() {
    if (this.idCliente) {
      this.firestore.collection('solicitudesTomadas', ref => ref.where('idCliente', '==', this.idCliente))
        .get()
        .subscribe(querySnapshot => {
          querySnapshot.forEach(doc => {
            // Asegurar que doc.data() tiene el tipo adecuado
            const data = doc.data() as { idSolicitud: string }; // Ajusta el tipo según tu estructura real

            const solicitudTomadaId = data.idSolicitud;
            this.solicitudesTomadas.push(solicitudTomadaId);
          });
        }, error => {
          console.error('Error al cargar las solicitudes tomadas:', error);
        });
    } else {
      console.error('ID del cliente no disponible.');
    }
  }


  aplicarFiltro() {
    if (this.filtroEspecialidad) {
      this.authService.getColabActiveByEspecialidad(this.filtroEspecialidad).subscribe((colabActive) => {
        this.colabActive = colabActive.filter(solicitud => {
          return (
            solicitud.especialidad === this.filtroEspecialidad &&
            !solicitud.tomada &&
            !this.solicitudesTomadas.includes(solicitud.idActivacion) // Filtrar las solicitudes que no han sido tomadas por el cliente actual
          );
        });
        this.noColabActive = this.colabActive.length === 0;
      });
    }
  }

  resetearFiltro() {
    this.colabActive = [];
    this.filtroEspecialidad = '';
    this.noColabActive = true;
  }

  async solicitarServicio(datosColab: solicitud) {
    try {
      if (!this.idCliente) {
        console.error('No se pudo obtener la información del cliente.');
        return;
      }

      // Generar un identificador único para cada solicitud
      const solicitudId = this.firestore.createId();

      // Agregar datos del cliente a la solicitud
      datosColab.nombreCliente = this.nombreCliente;
      datosColab.direccion = this.direccionCliente;
      datosColab.numero = this.numero; // Asignar el número del cliente

      datosColab.idCliente = this.idCliente;

      // Marcar la solicitud como tomada
      datosColab.tomada = true;
      // Agrega el estado
      datosColab.estado = 'En proceso';

      // Guardar la solicitud usando el identificador único
      await this.firestore.collection('solicitarServicio').doc(solicitudId).set({
        ...datosColab,
        uid: solicitudId, // Asegurarse de que el uid de la solicitud sea único
      });

      // Agregar la solicitud tomada al array de solicitudes tomadas por el cliente
      this.solicitudesTomadas.push(datosColab.idActivacion);

      // Eliminar la solicitud de colabActive después de tomarla
      this.colabActive = this.colabActive.filter(solicitud => solicitud.idActivacion !== datosColab.idActivacion);

      // Mostrar mensaje de éxito
      this.helper.presentToast('Solicitud enviada con éxito');

      // Limpiar número después de enviar la solicitud (si es necesario)
      this.numero = null;

      console.log('La solicitud tomada se ha guardado con éxito en solicitarServicio:', datosColab);
    } catch (error) {
      console.error('Error al intentar guardar la solicitud:', error);
      // Mostrar mensaje de error si es necesario
      this.helper.presentToast('Error al enviar la solicitud');
    }
  }


  setOpen(isOpen: boolean) {
    this.isModalOpen = isOpen;
  }
  async presentAlert() {
    const alert = await this.alertController.create({
      header: 'Selecciona tu Especialista',
      message: `
        ¡Selecciona el tipo de trabajo, horario y el trabajador!\n
        Gasfitería: Instalación y reparación de tuberías y artefactos sanitarios (baño).\n
        Plomería: Mantenimiento y arreglo de tuberías y grifos.\n
        Cerrajería: Servicios de seguridad para cerraduras.\n
        Limpieza: Mantenimiento de limpieza general y profunda.
      `,
      buttons: ['De acuerdo'],
    });

    await alert.present();
  }


}

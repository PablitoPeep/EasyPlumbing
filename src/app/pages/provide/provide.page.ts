import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { LoadingController } from '@ionic/angular';
import { activarServicios } from 'src/app/models/usuario/colabActivo';
import { AuthService } from 'src/app/services/auth.service';
import { HelperService } from 'src/app/services/helper.service';
import { StorageService } from 'src/app/services/storage.service';
import { solicitud } from 'src/app/models/usuario/crearSolicitud';

@Component({
  selector: 'app-provide',
  templateUrl: './provide.page.html',
  styleUrls: ['./provide.page.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class ProvidePage implements OnInit {

  isColaborador?: boolean;
  datosColaborador: activarServicios = {
    nombre: '',
    especialidad: '',
    descripcion: '',
    uid: '',
    aceptada: false,
    horario: '',
    diaDispo: '',
    dateTime: ''
  }
  isModalOpen = false;
  idColabActual: string = '';
  solicitudesColaborador: solicitud[] = []; // Array para almacenar las solicitudes del colaborador
  minDate: string; // Variable para almacenar la fecha mínima

  constructor(
    private authService: AuthService,
    private helper: HelperService,
    private loadingController: LoadingController,
    private store: StorageService
  ) { 
    // Establecer la fecha mínima como la fecha actual en formato ISO
    const today = new Date();
    this.minDate = today.toISOString().split('T')[0]; // Obtener solo la parte de la fecha en formato ISO
  }

  ngOnInit() {
    this.authService.getCurrentUser().subscribe(async (user) => {
      if (user) {
        this.isColaborador = await this.authService.isColaborador(user.uid);
  
        if (this.isColaborador) {
          const colaboradorData: any = await this.authService.getUserAdditionalInfoColaborador(user.uid);
          if (colaboradorData) {
            this.datosColaborador.nombre = colaboradorData.nombre;
            this.datosColaborador.especialidad = colaboradorData.especialidad;
            this.idColabActual = colaboradorData.idColab;
            this.listarSolicitudesColaborador(); // Llamar al método para listar solicitudes del colaborador
          }
        }
      }
    });
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Los meses en JavaScript son 0-indexed
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  }

  onDateTimeChange(event: any) {
    const formattedDate = this.formatDate(event.detail.value);
    this.datosColaborador.dateTime = formattedDate;
  }

  // Función para validar los campos
  validateFields(): boolean {
    if (!this.datosColaborador.nombre) {
      this.helper.presentToast('El nombre es requerido');
      return false;
    }
    if (!this.datosColaborador.especialidad) {
      this.helper.presentToast('La especialidad es requerida');
      return false;
    }
    if (!this.datosColaborador.dateTime) {
      this.helper.presentToast('El día disponible es requerido');
      return false;
    }
    if (!this.datosColaborador.horario) {
      this.helper.presentToast('El horario disponible es requerido');
      return false;
    }
    if (!this.datosColaborador.descripcion) {
      this.helper.presentToast('La descripción es requerida');
      return false;
    }
    return true;
  }

  async activarColaborador() {
    if (!this.validateFields()) {
      return;
    }

    let loading: HTMLIonLoadingElement | undefined;
    try {
      // No necesitas formatear la fecha aquí porque ya se ha formateado en onDateTimeChange
      const res = await this.authService.activarColab(this.datosColaborador);
      if (res) {
        loading = await this.loadingController.create({
          message: 'Generando activación...'
        });
        await loading.present();

        console.log('Éxito al activar colaborador');
        const id = res.id;
        this.datosColaborador.uid = id;
        this.datosColaborador.idColab = this.idColabActual;
        await this.store.createDoc(this.datosColaborador, 'ColaboradorActivo', id);
        this.helper.presentToast('Su cuenta está activa');
      } else {
        this.helper.presentToast('Error al activar la cuenta');
      }
    } catch (error) {
      this.helper.presentToast('Error al activar la cuenta');
      console.log('Error al activar la cuenta', error);
    } finally {
      if (loading) {
        try {
          await loading.dismiss();
        } catch (error) {
          console.log('Error al cerrar el loading', error);
        }
      }
    }
  }

  setOpen(isOpen: boolean) {
    this.isModalOpen = isOpen;
  }

  listarSolicitudesColaborador() {
    this.authService.getColabActiveByEspecialidad(this.datosColaborador.especialidad).subscribe((solicitudes: solicitud[]) => {
      this.solicitudesColaborador = solicitudes.filter(solicitud => solicitud.idColab === this.idColabActual);
    });
  }
}



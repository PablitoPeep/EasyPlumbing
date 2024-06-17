import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { solicitud } from 'src/app/models/usuario/crearSolicitud';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { HelperService } from 'src/app/services/helper.service';

@Component({
  selector: 'app-request',
  templateUrl: './request.page.html',
  styleUrls: ['./request.page.scss'],
})
export class RequestPage implements OnInit {

  filtroEspecialidad: string = '';
  colabActive: solicitud[] = [];
  noColabActive: boolean = true;
  nombreCliente: string | null = null;
  numero : string | null = null;
  isModalOpen = false;
  direccionCliente: string | null = null;
  idCliente: string | null = null;

  
  constructor(
    private authService: AuthService,
    private firestore: AngularFirestore,
    private helper: HelperService
  ) { }

  async ngOnInit() {
    // Llama al método para obtener el nombre del cliente actual al inicializar la página
    await this.getNombreClienteActual();
  }

  async getNombreClienteActual() {
    try {
      // Utiliza el método del servicio para obtener el nombre del cliente actual
      const clienteInfo = await this.authService.getNombreClienteActual();
      this.nombreCliente = clienteInfo.nombre;
      this.direccionCliente = clienteInfo.direccion; // Asumiendo que tienes una propiedad para la dirección

      if (this.nombreCliente) {
        console.log('Nombre del cliente:', this.nombreCliente);
      } else {
        console.log('No se pudo obtener el nombre del cliente.');
      }
    } catch (error) {
      console.error('Error al obtener el nombre del cliente:', error);
    }
  }

  aplicarFiltro() {
    if (this.filtroEspecialidad) {
      this.authService.getColabActiveByEspecialidad(this.filtroEspecialidad).subscribe((colabActive) => {
        this.colabActive = colabActive.filter(solicitud => !solicitud.tomada);
        this.noColabActive = this.colabActive.length === 0;
      });
    }
  }

  resetearFiltro() {
    this.colabActive = [];
    this.filtroEspecialidad = '';
    this.noColabActive = true;  
  }

  async solicitarServicio(colabActive: solicitud) {
    try {
      // Obtener el nombre del cliente actual
      const nombreCliente = await this.authService.getNombreClienteActual();
      if (!nombreCliente) {
        console.error('No se pudo obtener el nombre del cliente.');
        return;
      }
      
      // Verificar si la solicitud ya ha sido tomada
      const solicitudExistente = await this.firestore.collection('solicitarServicio').doc(colabActive.uid).get().toPromise();
  
      // Asegurar que la data tenga el tipo correcto (en este caso, any)
      const data = solicitudExistente.data() as any;
  
      if (!data || !data.tomada) {
        // Marcar la solicitud como tomada
        await this.firestore.collection('solicitarServicio').doc(colabActive.uid).set({ tomada: true });
  
        // Agregar el nombre del cliente a la solicitud
        const clienteInfo = await this.authService.getNombreClienteActual();
        colabActive.nombreCliente = clienteInfo.nombre;
        colabActive.direccion = clienteInfo.direccion; // Asumiendo que tienes una propiedad para la dirección en colabActive
        colabActive.numero = clienteInfo.numero;
        colabActive.idCliente = clienteInfo.idCliente; //idCliente agregado para recorrer la tabla


        // Guardar la solicitud en Firestore
        await this.firestore.collection('solicitarServicio').doc(colabActive.uid).set(colabActive);
  
        // Log después de guardar exitosamente
        console.log('La solicitud tomada se ha guardado con éxito en solicitarServicio:', colabActive);
        this.helper.presentToast('solicitud enviada con éxito');
      } else {
        // La solicitud ya ha sido tomada
        console.warn('La solicitud ya ha sido enviada anteriormente.');
      }
    } catch (error) {
      // Manejo de errores
      console.error('Error al intentar guardar la solicitud:', error);
    }
  }
  setOpen(isOpen: boolean) {
    this.isModalOpen = isOpen;
  }
}

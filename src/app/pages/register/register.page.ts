import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { user } from 'src/app/models/usuario/usuario';
import { AuthService } from 'src/app/services/auth.service';
import { HelperService } from 'src/app/services/helper.service';
import { StorageService } from 'src/app/services/storage.service';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
})
export class RegisterPage {
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

  especialidadesDescripcion = {
    gasfiteria: 'Instalación y reparación de sistemas de tuberías y artefactos sanitarios para agua y gas.',
    plomeria: 'Mantenimiento y arreglo de tuberías, grifos, y sistemas de desagüe en construcciones.',
    cerrajeria: 'Servicios de seguridad para cerraduras y sistemas de acceso en propiedades.',
    limpieza: 'Servicios de mantenimiento de limpieza general y profunda para espacios variados.'
  };

  constructor(
    private auth: AuthService,
    private store: StorageService,
    private helper: HelperService,
    private router: Router,
    private alertController: AlertController
  ) {}

  async registrar() {
    if (!this.datos.nombre || !this.datos.correo || !this.datos.numero || !this.datos.password || !this.datos.perfil) {
      this.helper.presentToast('Todos los campos son obligatorios.');
      return;
    }
    
    if (this.datos.perfil === 'colaborador' && !this.datos.especialidad) {
      this.helper.presentToast('Por favor, selecciona una especialidad.');
      return;
    }

    if (this.datos.perfil === 'cliente' && !this.datos.direccion) {
      this.helper.presentToast('Todos los campos son obligatorios.');
      return;
    }


    if (!this.validarNombre()) {
      return;
    }

    if (!this.validarCorreo()) {
      return;
    }

    if (!this.validarNumero()) {
      return;
    }

    if (this.datos.password.length < 8 || this.datos.password.length > 20) {
      this.helper.presentToast('La contraseña debe tener entre 8 y 20 caracteres.');
      return;
    }

    

    const loader = await this.helper.presentLoandig('Comprobando información...');
    const exists = await this.store.emailOrPhoneExists(this.datos.correo, this.datos.numero);
    if (exists) {
      loader.dismiss();
      this.helper.presentToast('El correo electrónico o número de teléfono ya están registrados.');
      return;
    }

    try {
      const res = await this.auth.registerUser(this.datos);
      if (res && res.user) {
        const path = this.datos.perfil === 'colaborador' ? 'Colaboradores' : 'Clientes';
        this.datos.uid = res.user.uid;
        this.datos.password = '';
        if (this.datos.perfil === 'colaborador') {
          this.datos.idColab = this.generateRandomCode(8);  // Generar código aleatorio para colaboradores
        } else if (this.datos.perfil === 'cliente') {
          this.datos.idCliente = this.generateRandomCode(8);  // Generar código aleatorio para clientes
        }
        await this.store.createDoc(this.datos, path, this.datos.uid);
        this.helper.presentToast('Registrado con éxito');
        this.router.navigate(['/login']);
      } else {
        this.helper.presentToast('Error en el registro');
      }
    } catch (error) {
      console.error('Error en el registro:', error);
      this.helper.presentToast('Error en el registro');
    } finally {
      loader.dismiss();
    }
  }

  async presentAlert() {
    const alert = await this.alertController.create({
      header: 'Tipos de Usuario',
      message: 'Cliente - Solicitar Servicio\nColaborador - Brindar Servicio',
      buttons: ['De acuerdo'],
    });

    await alert.present();
  }

  generateRandomCode(length: number): string {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  }

  validarNombre(): boolean {
    if (!this.datos.nombre || !/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(this.datos.nombre.trim())) {
      this.helper.presentToast('Por favor, ingrese un nombre válido (solo letras y espacios).');
      return false;
    }
    if (this.datos.nombre.trim().length < 6 || this.datos.nombre.trim().length > 50) {
      this.helper.presentToast('El nombre debe tener entre 6 y 50 caracteres.');
      return false;
    }
    return true;
  }

  validarCorreo(): boolean {
    if (!this.datos.correo) {
      this.helper.presentToast('Por favor, ingrese un correo electrónico.');
      return false;
    }

    // Expresión regular para validar el formato del correo electrónico
    const regex = /^[a-zA-Z0-9._%+-]+@(gmail|outlook|yahoo)\.(com|cl)$/;

    if (!regex.test(this.datos.correo.trim())) {
      this.helper.presentToast('Ingrese un correo válido de Gmail, Outlook o Yahoo, terminado en .com o .cl.');
      return false;
    }

    return true;
  }

  validarNumero(): boolean {
    if (!this.datos.numero || !/^\d{9}$/.test(this.datos.numero)) {
      this.helper.presentToast('Ingrese un número de 9 dígitos válido (solo números).');
      return false;
    }
    return true;
  }
}

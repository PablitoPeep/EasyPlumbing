import { Component } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { AuthService } from 'src/app/services/auth.service';
import { HelperService } from 'src/app/services/helper.service';
import { Router, NavigationExtras } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage {

  credenciales = {
    correo: '',
    password: ''
  };

  constructor(
    private router: Router,
    private auth: AuthService,
    private helper: HelperService,
    private alertController: AlertController
  ) {}

  async login() {
    let navigationExtras: NavigationExtras = {
      state: {
        usuario: this.credenciales.correo
      }
    };

    if (this.credenciales.correo.trim() === '' || this.credenciales.password.trim() === '') {
      this.helper.presentToast('Por favor, complete todos los campos');
      return;
    }

    const loader = await this.helper.presentLoandig('Ingresando...');

    try {
      const userCredential = await this.auth.login(this.credenciales.correo, this.credenciales.password);
      const user = userCredential.user;
      loader.dismiss();

      if (user) {
        if (await this.auth.isAdmin(user.uid)) {
          this.router.navigate(['/tabs/Menu']);
          this.helper.presentToast('Ingresado con éxito');
        } else if (await this.auth.isColaborador(user.uid)) {
          this.router.navigate(['/tabs/SoliColab']);
          this.helper.presentToast('Ingresado con éxito');
        } else {
          this.router.navigate(['/tabs/SolicitarServicio']);
          this.helper.presentToast('Ingresado con éxito');
        }
      }
    } catch (error: any) {
      loader.dismiss();

      if (error.code === 'auth/invalid-credential') {
        console.log('Correo o contraseña inválidos. Verifique sus datos.');
        this.helper.presentToast('Correo o contraseña inválidos. Verifique sus datos.');
      } else if (error.code === 'auth/user-disabled') {
        this.helper.presentToast('Usuario deshabilitado.');
      } else if (error.code === 'auth/too-many-requests') {
        console.log('');
        this.helper.presentToast('Acceso temporalmente deshabilitado debido a muchos intentos fallidos. Restablezca su contraseña o intente nuevamente más tarde.');
      } else {
        this.helper.presentToast('Ocurrió un error durante el inicio de sesión');
      }
    }
  }

  register() {
    this.router.navigate(['/register']);
  }

  async promptResetPassword() {
    const alert = await this.alertController.create({
      header: 'Restablecer contraseña',
      message: 'Por favor, ingrese su correo electrónico para enviar el enlace de restablecimiento.',
      inputs: [{ name: 'email', type: 'email', placeholder: 'Correo electrónico' }],
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Enviar',
          handler: (data) => {
            if (data.email) {
              this.resetPassword(data.email);
            } else {
              this.helper.presentToast('Por favor, ingrese un correo electrónico válido.');
            }
          }
        }
      ]
    });
    await alert.present();
  }

  async resetPassword(email: string) {
    const loader = await this.helper.presentLoandig('Enviando enlace de restablecimiento...');
    this.auth.resetPassword(email).then(() => {
      loader.dismiss();
      this.helper.presentToast('Correo de restablecimiento enviado. Por favor, revise su correo electrónico.');
    }).catch(error => {
      console.error('Error enviando correo de restablecimiento:', error);
      loader.dismiss();
      this.helper.presentToast('Error al enviar correo de restablecimiento.');
    });
  }
}

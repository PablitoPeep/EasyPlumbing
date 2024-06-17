import { Component } from '@angular/core';
import { AlertController } from '@ionic/angular';  // Importa AlertController para usarlo en los prompts
import { AuthService } from 'src/app/services/auth.service';
import { HelperService } from 'src/app/services/helper.service';
import { LoadingController } from '@ionic/angular';
import { Router, NavigationExtras } from '@angular/router';

// Agrega esta importación
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],

  // Agrega FormsModule a los providers
  providers: [FormsModule]
})
export class LoginPage {

  credenciales = {
    correo: '' as string,
    password: '' as string
  };

  constructor(
    private router: Router,
    private auth: AuthService,
    private helper: HelperService,
    private alertController: AlertController // Añade el AlertController aquí
  ) {}

  async login() {
    if (!this.credenciales.correo.trim() || !this.credenciales.password.trim()) {
      this.helper.presentToast('Por favor, complete todos los campos');
      return;
    }

    const loader = await this.helper.presentLoandig('Ingresando...');

    try {
      const userCredential = await this.auth.login(this.credenciales.correo, this.credenciales.password);
      const user = userCredential.user;

      if (user) {
        const isAdmin = await this.auth.isAdmin(user.uid);
        const isColaborador = await this.auth.isColaborador(user.uid);

        loader.dismiss();

        if (isAdmin) {
          this.router.navigate(['/tabs/Menu']); // Redirige a la vista de administrador
        } else if (isColaborador) {
          this.router.navigate(['/tabs/SoliColab']); // Redirige a la vista de colaborador
        } else {
          this.router.navigate(['/tabs/SolicitarServicio']); // Redirige a la vista de cliente
          this.helper.presentToast('Ingresado con éxito');
        }
      }
    } catch (error) {
      console.error('Error de login:', error);
      loader.dismiss();
      this.helper.presentToast('Error durante el inicio de sesión: ' + (error.message || 'Error desconocido'));
    }
  }

  register() {
    this.router.navigate(['/register']); // Navega a la página de registro
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




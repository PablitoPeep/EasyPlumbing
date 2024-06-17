import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
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

  constructor(
    private router: Router,
    private auth: AuthService,
    private helper: HelperService
  ) { }

  ngOnInit() {
    this.auth.getCurrentUser().subscribe(async (user) => {
      if (user) {
        // Obtener datos adicionales del cliente y colaborador
        this.clienteData = await this.auth.getUserAdditionalInfoCliente(user.uid);
        this.colabData = await this.auth.getUserAdditionalInfoColab(user.uid);
        this.adminData = await this.auth.getUserAdditionalInfoAdmin(user.uid);
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
}

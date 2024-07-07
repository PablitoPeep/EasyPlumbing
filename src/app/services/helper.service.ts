import { Injectable } from '@angular/core';
import { AlertController, LoadingController, ToastController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class HelperService {
  dismissLoading() {
    throw new Error('Method not implemented.');
  }

  

  constructor(public toastController: ToastController,
              public loadingController: LoadingController, 
              public alertController: AlertController) { }

  async presentToast(mensaje: string) {
    const toast = await this.toastController.create({
      message: mensaje,
      duration: 2000
    });
    toast.present();
  }

  async presentLoandig(mensaje: string) {
    var loader = await this.loadingController.create({
      cssClass: 'my.custom-class',
      message: mensaje     
    })
      await loader.present();
      return loader;
  }

  async presentAlert(header: string, subHeader: string, message: string): Promise<boolean> {
    return new Promise<boolean>(async (resolve) => {
      const alert = await this.alertController.create({
        header: header,
        subHeader: subHeader,
        message: message,
        buttons: [
          {
            text: 'Cancelar',
            role: 'cancel',
            cssClass: 'secondary',
            handler: () => resolve(false),
          },
          {
            text: 'OK',
            role: 'ok',
            handler: () => resolve(true),
          },
        ],
      });

      await alert.present();
    });
  }
}
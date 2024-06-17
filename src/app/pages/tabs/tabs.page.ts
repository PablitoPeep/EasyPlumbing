import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-tabs',
  templateUrl: './tabs.page.html',
  styleUrls: ['./tabs.page.scss'],
})
export class TabsPage  {

  isAdmin?: boolean;
  isColaborador?: boolean;
  isCliente?: boolean;

  constructor(private authService: AuthService) {
    this.authService.getCurrentUser().subscribe(async (user) => {
      this.isAdmin = user ? await this.authService.isAdmin(user.uid) : false;
    });

    this.authService.getCurrentUser().subscribe(async (user) => {
      this.isColaborador = user ? await this.authService.isColaborador(user.uid) : false;
    });

    this.authService.getCurrentUser().subscribe(async (user) => {
      this.isCliente = user ? await this.authService.isCliente(user.uid) : false;
    });
   }
  

  

}

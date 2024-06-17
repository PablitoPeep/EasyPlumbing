import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SolicitudesColabPageRoutingModule } from './solicitudes-colab-routing.module';

import { SolicitudesColabPage } from './solicitudes-colab.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SolicitudesColabPageRoutingModule
  ],
  declarations: [SolicitudesColabPage]
})
export class SolicitudesColabPageModule {}

import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SolicitudesColabPage } from './solicitudes-colab.page';

const routes: Routes = [
  {
    path: '',
    component: SolicitudesColabPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SolicitudesColabPageRoutingModule {}

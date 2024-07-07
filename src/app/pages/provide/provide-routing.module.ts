import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ProvidePage } from './provide.page';

const routes: Routes = [
  {
    path: '',
    component: ProvidePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ProvidePageRoutingModule {}

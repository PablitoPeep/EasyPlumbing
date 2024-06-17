import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { adminGuard } from 'src/app/guards/admin.guard';
import { TabsPage } from './tabs.page';
import { colabGuard } from 'src/app/guards/colab.guard';
import { clienteGuard } from 'src/app/guards/cliente.guard'; 
const routes: Routes = [
  {
    path: '',
    component: TabsPage,
    children: [
      {
        path: 'Menu',
        loadChildren: () => import('../../pages/home/home.module').then(m => m.HomePageModule),
        canActivate: [adminGuard],
      },
      {
        path: 'SolicitarServicio',
        loadChildren: () => import('../../pages/request/request.module').then(m => m.RequestPageModule),
        canActivate: [clienteGuard],
      },
      {
        path: 'ActivarColab',
        loadChildren: () => import('../../pages/provide/provide.module').then(m => m.ProvidePageModule),
        canActivate: [colabGuard],
      },
      {
        path: 'SoliColab',
        loadChildren: () => import('../../pages/solicitudes-colab/solicitudes-colab.module').then(m => m.SolicitudesColabPageModule),
        canActivate: [colabGuard],
      },
      {
        path: 'Historial',
        loadChildren: () => import('../../pages/history/history.module').then(m => m.HistoryPageModule),
      },
      {
        path: 'Perfil',
        loadChildren: () => import('../../pages/profile/profile.module').then(m => m.ProfilePageModule)
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TabsPageRoutingModule {}

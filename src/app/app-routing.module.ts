import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ContainerAppComponent } from './components/pages/container-app/container-app.component';
import { AuthGuard } from './shared/guards/auth.guard';
import { HomeComponent } from './components/pages/home/home.component';
import { AdminComponent } from './components/admin/admin.component';
import { LoginComponent } from './components/auth/login/login.component';
import { ListUsuarioComponent } from './components/usuariosAdmin/list-usuario/list-usuario.component';
import { ListEtapaComponent } from './components/etapasAdmin/list-etapa/list-etapa.component';
import { ListVideoComponent } from './components/videosAdmin/list-video/list-video.component';
import { ListImagenComponent } from './components/imagenesAdmin/list-imagen/list-imagen.component';
import { EducacionComponent } from './components/pages/educacion/educacion.component';
import { TradingComponent } from './components/pages/trading/trading.component';
import { DesarrolloComponent } from './components/pages/desarrollo/desarrollo.component';
import { TiendaComponent } from './components/pages/tienda/tienda.component';
import { MembresiaComponent } from './components/pages/membresia/membresia.component';
import { ListActividadComponent } from './components/actividadesAdmin/list-actividad/list-actividad.component';
import { ActividadComponent } from './components/pages/actividad/actividad.component';
import { WebinarComponent } from './components/pages/webinar/webinar.component';
import { AnalisisComponent } from './components/pages/analisis/analisis.component';
import { PlanTradingComponent } from './components/pages/plan-trading/plan-trading.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
  {
    path: 'home',
    component: HomeComponent
    //   loadChildren: () =>
    //     import('./components/pages/home/home.module').then(m => m.HomeModule)
  },
  {
    path: '',
    component: ContainerAppComponent,
    children: [
      //  { path: 'post/:id', component: DetailsPostComponent },
      {
        path: 'login',
        component: LoginComponent
        // loadChildren: () =>
        //   import('./components/auth/login/login.module').then(m => m.LoginModule)
      },
      {
        path: 'tienda',
        component: TiendaComponent
      },
      {
        path: 'membresia',
        component: MembresiaComponent
      },
      {
        path: 'actividad',
        component: ActividadComponent,
        canActivate: [AuthGuard]
      },
      {
        path: 'analisis',
        component: AnalisisComponent,
        canActivate: [AuthGuard]
      },
      {
        path: 'planTrading',
        component: PlanTradingComponent,
        canActivate: [AuthGuard]
      }
    ]
  },
  {
    path: 'trading',
    component: TradingComponent,
    canActivate: [AuthGuard]
    // loadChildren: () =>
    //   import('./components/auth/login/login.module').then(m => m.LoginModule)
  },
  {
    path: 'educacion',
    component: EducacionComponent,
    canActivate: [AuthGuard]
    // loadChildren: () =>
    //   import('./components/auth/login/login.module').then(m => m.LoginModule)
  },
  {
    path: 'desarrollo',
    component: DesarrolloComponent,
    canActivate: [AuthGuard]
    // loadChildren: () =>
    //   import('./components/auth/login/login.module').then(m => m.LoginModule)
  },
  {
    path: 'webinar',
    component: WebinarComponent,
    canActivate: [AuthGuard]
    // loadChildren: () =>
    //   import('./components/auth/login/login.module').then(m => m.LoginModule)
  },
  {
    path: 'adminmaintenancemodulePF',
    component: AdminComponent,
    canActivate: [AuthGuard],
    // loadChildren: () =>
    //   import('./components/admin/admin.module').then(m => m.AdminModule)
    children: [
      {
        path: 'usuarios',
        component: ListUsuarioComponent
      },
      {
        path: 'etapas',
        component: ListEtapaComponent
      },
      {
        path: 'videos',
        component: ListVideoComponent
      },
      {
        path: 'imagenes',
        component: ListImagenComponent
      },
      {
        path: 'actividades',
        component: ListActividadComponent
      }
    ]
  },
  {
    path: '**',
    redirectTo: 'home',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { relativeLinkResolution: 'legacy' })],
  exports: [RouterModule]
})
export class AppRoutingModule { }

import { BrowserModule } from '@angular/platform-browser';
import { LOCALE_ID, NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MaterialModule } from './material.module';

/* Firebase */
import { AngularFirestoreModule } from '@angular/fire/firestore';
import { AngularFireStorageModule, StorageBucket } from '@angular/fire/storage';
import { AngularFireModule } from '@angular/fire';
import { AngularFireDatabaseModule } from '@angular/fire/database';
import { AngularFireAuthModule } from '@angular/fire/auth';

import { environment } from '../environments/environment';
import { ReactiveFormsModule } from '@angular/forms';
import { ContainerAppComponent } from './components/pages/container-app/container-app.component';

import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { MatSnackBarModule } from '@angular/material/snack-bar';
import { BnNgIdleService } from 'bn-ng-idle';
import { NewUsuarioComponent } from './components/usuariosAdmin/new-usuario/new-usuario.component';
import { EditUsuarioComponent } from './components/usuariosAdmin/edit-usuario/edit-usuario.component';
import { NewEtapaComponent } from './components/etapasAdmin/new-etapa/new-etapa.component';
import { EditEtapaComponent } from './components/etapasAdmin/edit-etapa/edit-etapa.component';
import { NewVideoComponent } from './components/videosAdmin/new-video/new-video.component';
import { EditVideoComponent } from './components/videosAdmin/edit-video/edit-video.component';

import { HomeComponent } from './components/pages/home/home.component';
import { AdminComponent } from './components/admin/admin.component';
import { LoginComponent } from './components/auth/login/login.component';
import { ListUsuarioComponent } from './components/usuariosAdmin/list-usuario/list-usuario.component';
import { ListEtapaComponent } from './components/etapasAdmin/list-etapa/list-etapa.component';
import { ListVideoComponent } from './components/videosAdmin/list-video/list-video.component';
import { HeaderComponent } from './shared/components/header/header.component';
import { SidebarComponent } from './shared/components/sidebar/sidebar.component';
import { NgbDropdownModule, NgbCarouselModule } from '@ng-bootstrap/ng-bootstrap';
import { EditImagenComponent } from './components/imagenesAdmin/edit-imagen/edit-imagen.component';
import { ListImagenComponent } from './components/imagenesAdmin/list-imagen/list-imagen.component';
import { NewImagenComponent } from './components/imagenesAdmin/new-imagen/new-imagen.component';
import { FooterComponent } from './shared/components/footer/footer.component';
import { ProfileComponent } from './components/pages/profile/profile.component';
import { ContactComponent } from './components/pages/contact/contact.component';
import { TradingComponent } from './components/pages/trading/trading.component';
import { EducacionComponent } from './components/pages/educacion/educacion.component';
import { DesarrolloComponent } from './components/pages/desarrollo/desarrollo.component';
import { TiendaComponent } from './components/pages/tienda/tienda.component';
import { FilterPipe } from './shared/pipes/filter.pipe';
import { ProcessUsuarioComponent } from './components/usuariosAdmin/process-usuario/process-usuario.component';
import { DatePipe } from '@angular/common';
import { MembresiaComponent } from './components/pages/membresia/membresia.component';
import { PaymentComponent } from './components/pages/payment/payment.component';
import { ListActividadComponent } from './components/actividadesAdmin/list-actividad/list-actividad.component';
import { NewActividadComponent } from './components/actividadesAdmin/new-actividad/new-actividad.component';
import { ActividadComponent } from './components/pages/actividad/actividad.component';
import { CalendarModule, DateAdapter } from 'angular-calendar';
import { adapterFactory } from 'angular-calendar/date-adapters/date-fns';
import { SplitPipe } from './shared/pipes/split.pipe';
import { WebinarComponent } from './components/pages/webinar/webinar.component';
import { PaypalComponent } from './components/pages/paypal/paypal.component';
import { ToastrModule } from 'ngx-toastr';
import { EditActividadComponent } from './components/actividadesAdmin/edit-actividad/edit-actividad.component';
import { NotificacionesAdminComponent } from './components/notificaciones-admin/notificaciones-admin.component';
import { AnalisisComponent } from './components/pages/analisis/analisis.component';
import { DomseguroPipe } from './shared/pipes/domseguro.pipe';
import { PlanTradingComponent } from './components/pages/plan-trading/plan-trading.component';
import { PlanUsuarioComponent } from './components/usuariosAdmin/plan-usuario/plan-usuario.component';


@NgModule({
  declarations: [
    AppComponent,
    ContainerAppComponent,
    NewUsuarioComponent,
    EditUsuarioComponent,
    NewEtapaComponent,
    EditEtapaComponent,
    NewVideoComponent,
    EditVideoComponent,
    HomeComponent,
    AdminComponent,
    LoginComponent,
    ListUsuarioComponent,
    ListEtapaComponent,
    ListVideoComponent,
    HeaderComponent,
    SidebarComponent,
    EditImagenComponent,
    ListImagenComponent,
    NewImagenComponent,
    FooterComponent,
    ProfileComponent,
    ContactComponent,
    TradingComponent,
    EducacionComponent,
    DesarrolloComponent,
    TiendaComponent,
    FilterPipe,
    ProcessUsuarioComponent,
    MembresiaComponent,
    PaymentComponent,
    ListActividadComponent,
    NewActividadComponent,
    ActividadComponent,
    SplitPipe,
    WebinarComponent,
    PaypalComponent,
    EditActividadComponent,
    NotificacionesAdminComponent,
    AnalisisComponent,
    DomseguroPipe,
    PlanTradingComponent,
    PlanUsuarioComponent
  ],
  entryComponents: [NewUsuarioComponent, EditUsuarioComponent, NewEtapaComponent,
    EditEtapaComponent, NewVideoComponent,
    EditVideoComponent,
    EditImagenComponent,
    NewImagenComponent, ProfileComponent, ContactComponent, ProcessUsuarioComponent, PaymentComponent, NewActividadComponent
    , EditActividadComponent, PaypalComponent, NotificacionesAdminComponent, PlanUsuarioComponent],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AngularFireModule.initializeApp(environment.firebaseConfig),
    AngularFirestoreModule,
    AngularFireDatabaseModule,
    AngularFireStorageModule,
    AngularFireAuthModule,
    AppRoutingModule,
    MaterialModule,
    ReactiveFormsModule,
    FormsModule,
    HttpClientModule,
    MatSnackBarModule,
    NgbDropdownModule,
    NgbCarouselModule,
    CalendarModule.forRoot({ provide: DateAdapter, useFactory: adapterFactory }),
    ToastrModule.forRoot({ timeOut: 10000, progressBar: true, closeButton: true, positionClass: 'toast-bottom-right', enableHtml: true })
  ],
  providers: [
    { provide: StorageBucket, useValue: 'gs://phoenifxs.appspot.com' }, { provide: LOCALE_ID, useValue: 'es' }, BnNgIdleService, DatePipe
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }

import { Component, OnInit, ChangeDetectionStrategy, EventEmitter, ViewEncapsulation } from '@angular/core';
import { CalendarEvent, CalendarView } from 'angular-calendar';
import { DatePipe } from '@angular/common';
import { ActividadModel } from '../../../shared/models/actividad';
import { Service } from '../../../shared/services/service';
import Swal from 'sweetalert2';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subject } from 'rxjs';
import { setHours, setMinutes } from 'date-fns';
import { Router } from '@angular/router';
import { CodigoPaisModel } from '../../../shared/models/codigoPais';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-actividad',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './actividad.component.html',
  styleUrls: ['./actividad.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ActividadComponent implements OnInit {
  actividad: ActividadModel[] = [];
  fechaA = new Date(this.datePipe.transform(new Date(), 'yyyy/MM/dd'));
  codigoPais: CodigoPaisModel;
  isDataAvailable: boolean = false;
  constructor(
    private datePipe: DatePipe,
    private actSvc: Service,
    private snackBar: MatSnackBar, public router: Router,
    private toastrService: ToastrService) { }

  view: CalendarView = CalendarView.Month;

  viewDate = new Date();

  fechaActual = new Date();

  locale = 'es';

  viewChange = new EventEmitter<CalendarView>();

  viewDateChange = new EventEmitter<Date>();

  CalendarView = CalendarView;

  colors: any = {
    red: {
      primary: '#ad2121',
      secondary: '#FAE3E3'
    },
    blue: {
      primary: '#1e90ff',
      secondary: '#D1E8FF'
    },
    yellow: {
      primary: '#e3bc08',
      secondary: '#FDF1BA'
    }
  };

  events: CalendarEvent[] = [];

  refresh: Subject<any> = new Subject();


  ngOnInit(): void {
    if (!localStorage.getItem('loginInfo') || !localStorage.getItem('codigoPais')) {
      this.snackBar.open(
        'Hubo un problema por favor Inicia Sesión nuevamente. Gracias',
        'Cerrar',
        {
          duration: 5000,
          horizontalPosition: 'center',
          verticalPosition: 'bottom'
        }
      );
      this.router.navigate(['/login']); return;
    }
    const datosUsuario = JSON.parse(
      atob(localStorage.getItem('loginInfo'))
    );
    this.codigoPais = JSON.parse(
      atob(localStorage.getItem('codigoPais'))
    );
    this.actSvc
      .getDataxFiltro('usuario', (ref) =>
        ref.where('uid', '==', datosUsuario.uid)
      )
      .subscribe((response) => {
        if (response[0].rol === '02clie2' && response[0].estado === '02pend2') {
          this.snackBar.open(
            'Renueva tu membresía para seguir disfrutando de nuestros servicios!',
            'Cerrar',
            {
              duration: 5000,
              horizontalPosition: 'center',
              verticalPosition: 'bottom'
            }
          );
          this.router.navigate(['/membresia']);
          return;
        }
        this.actSvc
          .getDataxFiltro('actividad', (ref) =>
            ref.where('estado', '==', true)
              .orderBy('fechaActividad').orderBy('fechaCreacion'))
          .subscribe((actividad) => {
            if (actividad.length > 0 && this.codigoPais && this.router.url === '/actividad') {
              this.actividad = actividad;
              const fechaBusqueda = new Date(this.datePipe.transform(this.fechaActual, 'yyyy/MM/dd'));
              this.actividad.filter(a => (new Date(this.datePipe.transform(a.fechaActividad, 'yyyy/MM/dd'))).toString() === fechaBusqueda.toString()).map(actA => {
                if (actA.controlUrls.length > 0) {
                  let cont = 0;
                  let controlUrlsOrdenados = actA.controlUrls.sort((a, b) =>
                    (new Date(new Date().setHours(Number(a.hora.split(':')[0]), Number(a.hora.split(':')[1]), 0)).getTime()) -
                    (new Date(new Date().setHours(Number(b.hora.split(':')[0]), Number(b.hora.split(':')[1]), 0)).getTime()));
                  controlUrlsOrdenados.map(c => {
                    const fechaHora = new Date(actA.fechaActividad.getFullYear(), actA.fechaActividad.getMonth(), actA.fechaActividad.getDate(), Number(c.hora.split(':')[0]) + Number(this.codigoPais[0].hora), Number(c.hora.split(':')[1]), 0);
                    const fechaHoraM = new Date(this.datePipe.transform(this.fechaActual, 'yyyy/MM/dd HH:mm'));
                    const segundos = new Date(this.fechaActual).getSeconds();
                    if (fechaHora.getTime() >= fechaHoraM.getTime()) {
                      let resta = Math.trunc(((fechaHora.getTime() - fechaHoraM.getTime()) / 1000) / 60);
                      if (resta === 0) {
                        let descripcion = c.descripcion.trim();
                        if (descripcion) {
                          descripcion = `${c.descripcion},`;
                        }
                        if (cont === 0) {
                          Swal.fire({
                            title: actA.nombre,
                            text: actA.descripcion,
                            confirmButtonColor: '#d33',
                            confirmButtonText: 'Cerrar',
                            imageUrl: 'assets/images/calendario.jpeg',
                            imageWidth: 250,
                            imageHeight: 200,
                            imageAlt: 'Evento',
                            timer: (60000 - (segundos * 1000)),
                            heightAuto: true,
                            padding: 10,
                            timerProgressBar: true,
                            footer: `${descripcion}&nbsp;<a href='${c.url}' target='_blank' title="${c.descripcion}">Abrir link</a>`,
                            showCloseButton: true,
                            showClass: {
                              popup: 'animate__animated animate__fadeInDown'
                            },
                            hideClass: {
                              popup: 'animate__animated animate__fadeOutUp'
                            }
                          });
                        } else {
                          this.toastrService.info(`${actA.descripcion}</br> ${descripcion}&nbsp;<a href='${c.url}' target='_blank' title="${c.descripcion}">Abrir link</a>`, actA.nombre, { timeOut: (60000 - (segundos * 1000)) });
                        }
                        cont++;
                      } else {
                        if (resta <= 10) {
                          if (cont === 0) {
                            let timerInterval;

                            Swal.fire({
                              title: 'Atención',
                              html: `${actA.nombre} esta próxima a empezar. Tiempo restante <b></b>`,
                              confirmButtonColor: '#d33',
                              confirmButtonText: 'Cerrar',
                              imageUrl: 'assets/images/time.jpeg',
                              imageWidth: 150,
                              imageHeight: 150,
                              imageAlt: 'Tiempo',
                              timer: (resta * 60000 - (segundos * 1000)),
                              timerProgressBar: true,
                              onBeforeOpen: () => {
                                timerInterval = setInterval(() => {
                                  if ((Swal.getTimerLeft() / 1000).toString().split('.')[0] === '1') {
                                    Swal.getContent().querySelector('b').textContent = `${(Swal.getTimerLeft() / 1000).toString().split('.')[0]} segundo.`;
                                  } else {
                                    Swal.getContent().querySelector('b').textContent = `${(Swal.getTimerLeft() / 1000).toString().split('.')[0]} segundos.`;
                                  }
                                }, 100)
                              },
                              onClose: () => {
                                clearInterval(timerInterval)
                              },
                              heightAuto: true,
                              padding: 10,
                              footer: `Puedes acceder mediante el link de la fecha del calendario.`,
                              showCloseButton: true,
                              showClass: {
                                popup: 'animate__animated animate__fadeInDown'
                              },
                              hideClass: {
                                popup: 'animate__animated animate__fadeOutUp'
                              }
                            });
                          }
                          else {
                            let minuto = `${resta} minutos`;
                            if (resta === 1) {
                              minuto = `${resta} minuto`;
                            }
                            this.toastrService.info(`${actA.nombre} esta próxima a empezar. Puedes acceder mediante el link de la fecha del calendario. Tiempo restante aproximado ${minuto}.`, 'Atención', { timeOut: (60000 * resta) - (segundos * 1000) });
                          }
                          cont++;
                        }
                      }
                    }
                  });
                }
              });
              //this.actividad.filter(a => (new Date(this.datePipe.transform(a.fechaActividad, 'yyyy/MM/dd'))) <= fechaBusqueda).map(act => {
              this.actividad.map(act => {
                if (act.controlUrls.length > 0) {
                  act.controlUrls.map(d => {
                    let horaD = d.horaD;
                    if ((Number(d.hora.split(':')[1]) + Number(d.minutoD)) >= 60) {
                      horaD = Number(horaD) + 1;
                    }
                    const evento = [{
                      start: setHours(setMinutes(new Date(act.fechaActividad),
                        Number(d.hora.split(':')[1])), Number(d.hora.split(':')[0]) + Number(this.codigoPais[0].hora)),
                      end: setHours(setMinutes(new Date(act.fechaActividad),
                        Number(d.hora.split(':')[1]) + Number(d.minutoD)), Number(d.hora.split(':')[0]) + Number(this.codigoPais[0].hora) + Number(horaD)),
                      title: d.descripcion,
                      id: `${act.id}|${d.id}`
                    }];
                    evento.map(a => {
                      this.events.push(a);
                    });
                  });
                } else {
                  const evento
                    = [{
                      start: new Date(act.fechaActividad),
                      end: new Date(act.fechaActividad),
                      title: act.nombre,
                      id: act.id
                    }
                    ];
                  evento.map(a => {
                    this.events.push(a);
                  });
                }
              });
            }
            this.isDataAvailable = true;
            this.refresh.next();
          });
      });
  }

  buscarActividadM(dato) {
    if (dato.date.getTime() < (new Date(this.datePipe.transform(this.fechaActual, 'yyyy/MM/dd')).getTime())) {
      return;
    }
    let fechaS: string = '';
    let fechaE: string = '';
    let actividades = '';
    let nombre = '';
    let descripcion = '';
    let cont = 0;
    if (dato.events.length > 0) {
      dato.events.map(e => {
        fechaS = this.datePipe.transform(e.start, 'EEEE d, MMMM,  y').toString();
        this.actividad.map(a => {
          if (a.id === e.id.split('|')[0]) {
            if (a.controlUrls.length > 0) {
              a.controlUrls.map(act => {
                fechaE = fechaS;
                if (((Number(act.hora.split(':')[0]) + Number(act.horaD) + Number(this.codigoPais[0].hora)) >= 24) || (Number(act.horaD) + Number(this.codigoPais[0].hora) === 23 && Number(act.minutoD) === 60)
                  || (Number(act.hora.split(':')[0]) + Number(this.codigoPais[0].hora) === 23 && Number(act.minutoD) === 60)) {
                  fechaE = this.datePipe.transform(new Date(e.start.toString()).setDate(e.start.getDate() + 1), 'EEEE d, MMMM,  y').toString();
                }
                if (dato.events[cont]) {
                  if (act.id.toString() === dato.events[cont].id.split('|')[1]) {
                    let descripcion = act.descripcion.trim();
                    if (descripcion) {
                      descripcion = `, ${act.descripcion}`;
                    }
                    actividades += `Hora: <font title="${fechaS}">${this.addZero(dato.events[cont].start.getHours())}:${this.addZero(dato.events[cont].start.getMinutes())}</font> a <font title="${fechaE}">${this.addZero(dato.events[cont].end.getHours())}:${this.addZero(dato.events[cont].end.getMinutes())}</font>${descripcion}, Url: <a href='${act.url}' target='_blank' title="${act.descripcion}">Abrir link</a><br/>`;
                    cont++;
                  }
                }
              });
            }
            if (dato.date.getTime() === (new Date(this.datePipe.transform(a.fechaActividad, 'yyyy/MM/dd')).getTime())) {
              nombre = a.nombre;
              descripcion = a.descripcion;
            }
          }
        });
      });
      Swal.fire({
        title: nombre,
        text: descripcion,
        showClass: {
          popup: 'animate__animated animate__fadeInDown',
        },
        hideClass: {
          popup: 'animate__animated animate__fadeOutUp',
        },
        confirmButtonColor: '#d33',
        confirmButtonText: 'Cerrar',
        imageUrl: 'assets/images/calendario.jpeg',
        imageWidth: 250,
        imageHeight: 200,
        imageAlt: 'Evento',
        timer: 60000,
        heightAuto: true,
        padding: 10,
        footer: actividades,
        timerProgressBar: true,
        showCloseButton: true
      });
    } else {
      this.snackBar.open(
        `No existen actividades para la fecha consultada.`,
        'Cerrar',
        {
          duration: 5000,
        }
      );
    }
  }

  buscarActividadWD(dato) {
    let fechaE: string = '';
    const fechaS = this.datePipe.transform(dato.start, 'EEEE d, MMMM,  y').toString();
    this.actividad.filter((act) => act.id === dato.id.split('|')[0]).map(a => {
      let actividades = '';
      if (a.controlUrls.length > 0) {
        a.controlUrls.map((act) => {
          fechaE = fechaS;
          if (((Number(act.hora.split(':')[0]) + Number(act.horaD) + Number(this.codigoPais[0].hora)) >= 24) || (Number(act.horaD) + Number(this.codigoPais[0].hora) === 23 && Number(act.minutoD) === 60)
            || (Number(act.hora.split(':')[0]) + Number(this.codigoPais[0].hora) === 23 && Number(act.minutoD) === 60)) {
            fechaE = this.datePipe.transform(new Date(dato.start.toString()).setDate(dato.start.getDate() + 1), 'EEEE d, MMMM,  y').toString();
          }
          if (act.id.toString() === dato.id.split('|')[1]) {
            let descripcion = act.descripcion.trim();
            if (descripcion) {
              descripcion = `, ${act.descripcion}`;
            }
            actividades += `Hora: <font title="${fechaS}">${this.addZero(dato.start.getHours())}:${this.addZero(dato.start.getMinutes())}</font> a <font title="${fechaE}">${this.addZero(dato.end.getHours())}:${this.addZero(dato.end.getMinutes())}</font>${descripcion}, Url: <a href='${act.url}' target='_blank' title="${act.descripcion}">Abrir link</a><br/>`;
          }
        });
      }
      Swal.fire({
        title: a.nombre,
        text: a.descripcion,
        showClass: {
          popup: 'animate__animated animate__fadeInDown',
        },
        hideClass: {
          popup: 'animate__animated animate__fadeOutUp',
        },
        confirmButtonColor: '#d33',
        confirmButtonText: 'Cerrar',
        imageUrl: 'assets/images/calendario.jpeg',
        imageWidth: 250,
        imageHeight: 200,
        imageAlt: 'Evento',
        timer: 60000,
        heightAuto: true,
        padding: 10,
        footer: actividades,
        timerProgressBar: true,
        showCloseButton: true
      });
    })
  }
  vista(tipo?) {
    this.view = tipo;
  }
  addZero(i) {
    if (i < 10) {
      i = "0" + i;
    }
    return i;
  }
}

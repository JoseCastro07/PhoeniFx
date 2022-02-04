import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Service } from '../../../shared/services/service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { Dias, PlanTradingModel, TipoOperacion } from '../../../shared/models/planTrading';
import { FormGroup, FormControl, FormArray } from '@angular/forms';
import { UsuarioModel } from '../../../shared/models/usuario';
import { VideoModel } from '../../../shared/models/video';
import { EtapaModel } from '../../../shared/models/etapa';
import { ControlUsuarioVideoModel } from '../../../shared/models/controlUsuarioVideo';
import Swal from 'sweetalert2';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-plan-trading',
  templateUrl: './plan-trading.component.html',
  styleUrls: ['./plan-trading.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class PlanTradingComponent implements OnInit {
  datos: PlanTradingModel = null;
  dias = new Dias().dias;
  tipoOperaciones = new TipoOperacion().tipos;
  usuario: UsuarioModel;
  progressT: number = 0;
  progressE: number = 0;
  progressD: number = 0;
  resultadoT: string = '0 videos de 0 completados.';
  resultadoE: string = '0 videos de 0 completados.';
  resultadoD: string = '0 videos de 0 completados.';
  videosT: number = 0;
  videosE: number = 0;
  videosD: number = 0;
  videos: VideoModel[] = [];
  idEtapasT: any[] = [];
  idEtapasE: any[] = [];
  idEtapasD: any[] = [];
  etapas: EtapaModel[] = [];
  datosUsuario: any;
  estado: boolean = true;
  isDataAvailable: boolean = false;
  constructor(private pltSvc: Service,
    private snackBar: MatSnackBar, public router: Router) { }

  ngOnInit(): void {
    document.onkeydown = (event) => {
      if (event.code === 'F12') {
        return false;
      } else {
        if (event.ctrlKey && event.keyCode === 85) {
          return false;
        } else {
          if (event.ctrlKey && event.shiftKey) {
            return false;
          }
          else {
            return true;
          }
        }
      }
    };
    if (!localStorage.getItem('loginInfo')) {
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
    this.datosUsuario = JSON.parse(
      atob(localStorage.getItem('loginInfo'))
    );
    this.pltSvc
      .getDataxFiltro('usuario', (ref) =>
        ref.where('uid', '==', this.datosUsuario.uid)
      )
      .subscribe((responseU) => {
        this.usuario = responseU[0];
        if (this.usuario.rol === '02clie2' && this.usuario.estado === '02pend2') {
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
        } else {
          this.isDataAvailable = true;
          this.pltSvc
            .getDataxFiltro('video', (ref) =>
              ref
                .where('estado', '==', true)
                .orderBy('idEtapa')
            )
            .subscribe((responseV) => {
              if (responseV.length > 0 && this.videos.length === 0) {
                this.videos = responseV;

                this.videos.filter(v => v.codigoSeccion === 1).map((vid) => {
                  this.idEtapasT.push(vid.idEtapa);
                  this.idEtapasT = this.idEtapasT.filter((valor, indiceActual, arreglo) => arreglo.indexOf(valor) === indiceActual);
                });
                this.videos.filter(v => v.codigoSeccion === 2).map((vid) => {
                  this.idEtapasE.push(vid.idEtapa);
                  this.idEtapasE = this.idEtapasE.filter((valor, indiceActual, arreglo) => arreglo.indexOf(valor) === indiceActual);
                });
                this.videos.filter(v => v.codigoSeccion === 3).map((vid) => {
                  this.idEtapasD.push(vid.idEtapa);
                  this.idEtapasD = this.idEtapasD.filter((valor, indiceActual, arreglo) => arreglo.indexOf(valor) === indiceActual);
                });

                this.pltSvc
                  .getDataxFiltro('etapa', (ref) =>
                    ref
                      .where('estado', '==', true)
                      .orderBy('codigoSeccion').orderBy('idEtapa')
                  )
                  .subscribe((etapa) => {
                    if (etapa.length > 0 && this.etapas.length === 0) {

                      this.idEtapasT.map(v => {
                        etapa.filter(x => x.codigoSeccion === 1 && x.idEtapa === v).map(e => {
                          this.etapas.push(e);
                        });
                      });
                      this.idEtapasE.map(v => {
                        etapa.filter(x => x.codigoSeccion === 2 && x.idEtapa === v).map(e => {
                          this.etapas.push(e);
                        });
                      });
                      this.idEtapasD.map(v => {
                        etapa.filter(x => x.codigoSeccion === 3 && x.idEtapa === v).map(e => {
                          this.etapas.push(e);
                        });
                      });
                      this.etapas.map((e) => {
                        this.videosT += this.videos.filter(v => v.codigoSeccion === 1 && v.idEtapa === e.idEtapa && v.codigoSeccion === e.codigoSeccion).length;
                        this.videosE += this.videos.filter(v => v.codigoSeccion === 2 && v.idEtapa === e.idEtapa && v.codigoSeccion === e.codigoSeccion).length;
                        this.videosD += this.videos.filter(v => v.codigoSeccion === 3 && v.idEtapa === e.idEtapa && v.codigoSeccion === e.codigoSeccion).length;
                      });
                      this.resultadoT = `0 videos de ${this.videosT} completados.`;
                      this.resultadoE = `0 videos de ${this.videosE} completados.`;
                      this.resultadoD = `0 videos de ${this.videosD} completados.`;
                    }
                    this.resultado();
                  });
              }
            });
        }
      });
    this.pltSvc
      .getDataxFiltro('planTrading', (ref) =>
        ref.where('uid', '==', this.datosUsuario.uid)
          .orderBy('fechaCreacion', 'desc')
      )
      .subscribe((responseP) => {
        if (responseP.length > 0 && this.router.url === '/planTrading') {
          this.datos = responseP[0];
          this.initValuesActForm();
        } else {
          this.addControlTrade();
          this.addControlNote();
        }
      });
  }

  resultado() {
    let controlUV: ControlUsuarioVideoModel[] = [];
    let arrayTotalEV: VideoModel[] = [];
    this.pltSvc
      .getDataxFiltro('controlUsuarioVideo', (ref) =>
        ref
          .where('idUsuario', '==', this.usuario.id)
      )
      .subscribe((response) => {
        if (response.length > 0 && controlUV.length === 0) {
          controlUV = response;
          let totalVistos = 0;
          let aux1 = 'video';
          let aux2 = 'completado';
          if (((controlUV.filter(x => x.codigoSeccion === 1).length) > 0) && ((controlUV.filter(x => x.codigoSeccion === 1)[0].videosVistos) !== undefined)) {

            controlUV.filter(x => x.codigoSeccion === 1)[0].videosVistos.split(',').map(c => {
              this.videos.filter(v => v.id === c).map((a) => {
                arrayTotalEV.push(a);
              });
            });

            this.etapas.map((e) => {
              totalVistos += arrayTotalEV.filter((a) => a.idEtapa === e.idEtapa && a.codigoSeccion === e.codigoSeccion).length;
            });

            this.progressT = Math.round(totalVistos * 100 / this.videosT);
            if (this.progressT.toString() === 'NaN') {
              this.progressT = 0;
            }
            if (totalVistos !== 1) {
              aux1 = 'videos';
              aux2 = 'completados';
            }
            this.resultadoT = `${totalVistos} ${aux1} de ${this.videosT} ${aux2}.`;
          }
          if (((controlUV.filter(x => x.codigoSeccion === 2).length) > 0) && ((controlUV.filter(x => x.codigoSeccion === 2)[0].videosVistos) !== undefined)) {
            totalVistos = 0;
            arrayTotalEV = [];
            aux1 = 'video';
            aux2 = 'completado';
            controlUV.filter(x => x.codigoSeccion === 2)[0].videosVistos.split(',').map(c => {
              this.videos.filter(v => v.id === c).map((a) => {
                arrayTotalEV.push(a);
              });
            });

            this.etapas.map((e) => {
              totalVistos += arrayTotalEV.filter((a) => a.idEtapa === e.idEtapa && a.codigoSeccion === e.codigoSeccion).length;
            });

            this.progressE = Math.round(totalVistos * 100 / this.videosE);
            if (this.progressE.toString() === 'NaN') {
              this.progressE = 0;
            }
            if (totalVistos !== 1) {
              aux1 = 'videos';
              aux2 = 'completados';
            }
            this.resultadoE = `${totalVistos} ${aux1} de ${this.videosE} ${aux2}.`;
          }
          if (((controlUV.filter(x => x.codigoSeccion === 3).length) > 0) && ((controlUV.filter(x => x.codigoSeccion === 3)[0].videosVistos) !== undefined)) {
            totalVistos = 0;
            arrayTotalEV = [];
            aux1 = 'video';
            aux2 = 'completado';
            controlUV.filter(x => x.codigoSeccion === 3)[0].videosVistos.split(',').map(c => {
              this.videos.filter(v => v.id === c).map((a) => {
                arrayTotalEV.push(a);
              });
            });

            this.etapas.map((e) => {
              totalVistos += arrayTotalEV.filter((a) => a.idEtapa === e.idEtapa && a.codigoSeccion === e.codigoSeccion).length;
            });

            this.progressD = Math.round(totalVistos * 100 / this.videosD);
            if (this.progressD.toString() === 'NaN') {
              this.progressD = 0;
            }
            if (totalVistos !== 1) {
              aux1 = 'videos';
              aux2 = 'completados';
            }
            this.resultadoD = `${totalVistos} ${aux1} de ${this.videosD} ${aux2}.`;
          }
        }
      });
  }

  public addPlanTradingForm = new FormGroup({
    tipoTrader: new FormControl(''),
    paresPreferidos: new FormControl(''),
    sistema: new FormControl(''),
    reglas: new FormControl(''),
    riesgo: new FormControl(''),
    diasOperacion: new FormArray([]),
    meta: new FormControl(0),
    horasB: new FormControl(0),
    horasE: new FormControl(0),
    fortalezas: new FormControl(''),
    creencia: new FormControl(''),
    controlTrade: new FormArray([]),
    controlNote: new FormArray([]),
    id: new FormControl()
  });

  private initValuesActForm(): void {
    this.addPlanTradingForm.patchValue({
      tipoTrader: this.datos.tipoTrader,
      paresPreferidos: this.datos.paresPreferidos,
      sistema: this.datos.sistema,
      reglas: this.datos.reglas,
      riesgo: this.datos.riesgo,
      diasOperacion: this.datos.diasOperacion,
      meta: this.datos.meta,
      horasB: this.datos.horasB,
      horasE: this.datos.horasE,
      fortalezas: this.datos.fortalezas,
      creencia: this.datos.creencia,
      controlTrade: this.datos.controlTrade,
      controlNote: this.datos.controlNote,
      id: this.datos.id
    });

    const diasB: any = this.datos.diasOperacion;
    diasB.map(dB => {
      this.dias.map((d, index) => {
        if (d.id === dB.id) {
          d.estado = true;
          this.dias[index] = d;
        }
      });
    });

    if (this.datos.controlTrade.length === 0) {
      this.addControlTrade();
    }
    if (this.datos.controlTrade.length > 0 && this.estado) {
      this.datos.controlTrade.map(a => {
        (this.addPlanTradingForm.get('controlTrade') as FormArray).push(new FormGroup({
          id: new FormControl(a.id),
          divisa: new FormControl(a.divisa),
          tipoOperacion: new FormControl(a.tipoOperacion),
          puntoEntrada: new FormControl(a.puntoEntrada),
          takeProfit: new FormControl(a.takeProfit),
          stopLoss: new FormControl(a.stopLoss)
        }));
      });
    }
    if (this.datos.controlNote.length === 0) {
      this.addControlNote();
    }

    if (this.datos.controlNote.length > 0 && this.estado) {
      this.datos.controlNote.map(a => {
        (this.addPlanTradingForm.get('controlNote') as FormArray).push(new FormGroup({
          id: new FormControl(a.id),
          title: new FormControl(a.title),
          note: new FormControl(a.note),
          fechaNota: new FormControl(a.fechaNota)
        }));
      });
    }
  }

  addControlTrade() {
    (this.addPlanTradingForm.get('controlTrade') as FormArray).push(new FormGroup({
      id: new FormControl(Math.floor(Math.random() * 9999 + 1)),
      divisa: new FormControl(''),
      tipoOperacion: new FormControl(),
      puntoEntrada: new FormControl(''),
      takeProfit: new FormControl(''),
      stopLoss: new FormControl('')
    }));
  }
  addControlNote() {
    (this.addPlanTradingForm.get('controlNote') as FormArray).push(new FormGroup({
      id: new FormControl(Math.floor(Math.random() * 9999 + 1)),
      title: new FormControl(''),
      note: new FormControl(''),
      fechaNota: new FormControl(this.toISOLocal(new Date()))
    }));
  }

  toISOLocal(d) {
    const z = n => ('0' + n).slice(-2);
    let off = d.getTimezoneOffset();
    off = Math.abs(off);

    return d.getFullYear() + '-'
      + z(d.getMonth() + 1) + '-' +
      z(d.getDate()) + 'T' +
      z(d.getHours()) + ':' +
      z(d.getMinutes());
  }

  getControlsT() {
    return (this.addPlanTradingForm.get('controlTrade') as FormArray).controls;
  }

  deleteControlTrades(indice: number) {
    (this.addPlanTradingForm.get('controlTrade') as FormArray).removeAt(indice);
  }

  getControlsN() {
    return (this.addPlanTradingForm.get('controlNote') as FormArray).controls;
  }

  deleteControlNotes(indice: number) {
    (this.addPlanTradingForm.get('controlNote') as FormArray).removeAt(indice);
  }



  onCheckChange(event, dia: any) {
    if (event.checked) {
      (this.addPlanTradingForm.get('diasOperacion') as FormArray).push(new FormGroup({
        id: new FormControl(event.source.value),
        estado: new FormControl(event.checked),
        descripcion: new FormControl(dia.descripcion)
      }));
    }
    else {
      (this.addPlanTradingForm.get('diasOperacion') as FormArray).controls.map((ctrl: FormControl, index) => {
        if (ctrl.value.id === event.source.value) {
          (this.addPlanTradingForm.get('diasOperacion') as FormArray).removeAt(index);
          return;
        }
      });

    }
  }


  addPlanTrading() {
    try {
      if (this.datos === null) {
        this.datos = this.addPlanTradingForm.value;
        this.datos.fechaCreacion = new Date();
        this.datos.usuarioCreacion = this.usuario.nombre;
        this.datos.uid = this.datosUsuario.uid;
        this.pltSvc.preAddUpdatePlanTrading(this.datos);
        this.estado = false;
      } else {
        this.datos = this.addPlanTradingForm.value;
        this.datos.fechaModificacion = new Date();
        this.datos.usuarioModificacion = this.usuario.nombre;
        this.pltSvc.preAddUpdatePlanTradingById(this.datos);
        this.estado = false;
      } this.snackBar.open(
        'Cambios guardados con éxito!!',
        'Cerrar',
        {
          duration: 5000,
          horizontalPosition: 'center',
          verticalPosition: 'bottom'
        }
      );

    } catch (error) {
      console.log('Error', error);
      Swal.fire({
        text: 'Hubo un problema!',
        icon: 'error',
        title: 'Oops...',
        footer: 'Comunicate con soporte!!',
        showCloseButton: true
      });
    }
  }
  exportExcel() {
    let trades: any = [];
    (this.addPlanTradingForm.get('controlTrade') as FormArray).value.map(t => {
      let tipoDescripcion = ''
      if (this.tipoOperaciones.filter(to => to.id === t.tipoOperacion).length > 0) {
        tipoDescripcion = this.tipoOperaciones.filter(to => to.id === t.tipoOperacion)[0].descripcion;
      }
      const tradesObj = {
        "Divisa": t.divisa,
        "Tipo Operación": tipoDescripcion,
        "Punto Entrada": t.puntoEntrada,
        "Take Profit": t.takeProfit,
        "Stop Loss": t.stopLoss
      }
      trades.push(tradesObj);
    });
    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(trades);
    const workbook: XLSX.WorkBook = { Sheets: { 'trades': worksheet }, SheetNames: ['trades'] };
    XLSX.writeFile(workbook, 'trades.xlsx', { bookType: 'xlsx', type: 'buffer' });
  }
}

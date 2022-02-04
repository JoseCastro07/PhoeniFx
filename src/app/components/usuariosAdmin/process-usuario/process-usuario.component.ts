import { Component, OnInit, Inject } from '@angular/core';
import { Service } from '../../../shared/services/service';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { UsuarioModel } from '../../../shared/models/usuario';
import { ControlUsuarioVideoModel } from '../../../shared/models/controlUsuarioVideo';
import { VideoModel } from '../../../shared/models/video';
import { DatePipe } from '@angular/common';
import { EtapaModel } from '../../../shared/models/etapa';
import { PlanUsuarioComponent } from '../plan-usuario/plan-usuario.component';

@Component({
  selector: 'app-process-usuario',
  templateUrl: './process-usuario.component.html',
  styleUrls: ['./process-usuario.component.scss']
})
export class ProcessUsuarioComponent implements OnInit {
  usuario: UsuarioModel;
  progressT: number = 0;
  progressE: number = 0;
  progressD: number = 0;
  fechaT: string = '';
  fechaE: string = '';
  fechaD: string = '';
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

  constructor(private srvPro: Service, private datePipe: DatePipe, public dialogRef: MatDialogRef<ProcessUsuarioComponent>, @Inject(MAT_DIALOG_DATA) public data: any, public dialog: MatDialog) { this.usuario = data.user; }
  ngOnInit(): void {
    this.srvPro
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

          this.srvPro
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

  resultado() {
    let controlUV: ControlUsuarioVideoModel[] = [];
    let arrayTotalEV: VideoModel[] = [];
    this.srvPro
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
            this.fechaT = `Última visita: ${this.datePipe.transform(controlUV.filter(x => x.codigoSeccion === 1)[0].fechaUltimaVisita, 'yyyy-MM-dd')}`;
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
            this.fechaE = `Última visita: ${this.datePipe.transform(controlUV.filter(x => x.codigoSeccion === 2)[0].fechaUltimaVisita, 'yyyy-MM-dd')}`;
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
            this.fechaD = `Última visita: ${this.datePipe.transform(controlUV.filter(x => x.codigoSeccion === 3)[0].fechaUltimaVisita, 'yyyy-MM-dd')}`;
            if (totalVistos !== 1) {
              aux1 = 'videos';
              aux2 = 'completados';
            }
            this.resultadoD = `${totalVistos} ${aux1} de ${this.videosD} ${aux2}.`;
          }
        }
      });
  }

  openDialog(): void {
    const dialogRef = this.dialog.open(PlanUsuarioComponent, {
      data: { user: this.usuario },
      maxHeight: '600px'
    });
    dialogRef.afterClosed().subscribe(result => {
      console.log(`Dialog result ${result}`);
    });
  }
}

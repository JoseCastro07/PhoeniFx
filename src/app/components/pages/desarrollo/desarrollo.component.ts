import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { VideoModel } from '../../../shared/models/video';
import { EtapaModel } from '../../../shared/models/etapa';
import { Service } from '../../../shared/services/service';
import { UsuarioModel } from 'src/app/shared/models/usuario';
import { ControlUsuarioVideoModel } from '../../../shared/models/controlUsuarioVideo';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-desarrollo',
  templateUrl: './desarrollo.component.html',
  styleUrls: ['./desarrollo.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class DesarrolloComponent implements OnInit {
  isActive: boolean;
  collapsedD: boolean;
  showMenuD: number;
  pushRightClass: string;
  public sideMenuT: Array<any> = [];
  videos: VideoModel[] = [];
  etapas: EtapaModel[] = [];
  usuario: UsuarioModel;
  controlUV: ControlUsuarioVideoModel = null;
  etapasL: number;
  videosL: number;
  idEtapasV: any[] = [];
  filterVideo: string = '';
  nombreA: string = 'Anterior';
  nombreS: string = 'Siguiente';
  primerV: string = '';
  ultimoV: string = '';
  porcentajeVideosV: number;
  resultado: string = '';
  arrayTotalEV: VideoModel[] = [];
  color: string = 'accent';
  segundoA: any;
  isDataAvailable: boolean = false;
  botonD: boolean = true;
  botonC: boolean = false;
  constructor(public router: Router, private desSvc: Service, private snackBar: MatSnackBar) {
  }

  ngOnInit() {
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
    const datosUsuario = JSON.parse(
      atob(localStorage.getItem('loginInfo'))
    );
    this.desSvc
      .getDataxFiltro('usuario', (ref) =>
        ref.where('uid', '==', datosUsuario.uid)
      )
      .subscribe((response) => {
        this.usuario = response[0];
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
        }
      });

    this.isActive = false;
    this.collapsedD = false;
    this.pushRightClass = 'push-right';
    this.desSvc
      .getDataxFiltro('video', (ref) =>
        ref
          .where('estado', '==', true)
          .where('codigoSeccion', '==', 3)
          .orderBy('idEtapa').orderBy('posicionVideo')
      )
      .subscribe((responseV) => {
        if (responseV.length > 0 && this.videos.length === 0) {
          this.videos = responseV;
          this.primerV = this.videos[0].id;
          // console.log(this.videos);

          this.videos.map((vid, index) => {
            this.videos[index].estadoVideo = false;
            this.videos[index].posicionVPantalla = index + 1;
            this.videos[index].nombreAdjunto = this.videos[index].nombreAdjunto.split('~')[1];
            // this.videos[index].fileVideo  = btoa(this.videos[index].fileVideo);
            this.idEtapasV.push(vid.idEtapa);
            this.idEtapasV = this.idEtapasV.filter((valor, indiceActual, arreglo) => arreglo.indexOf(valor) === indiceActual);
          });
          this.controlUsuario();
        } else {
          this.etapasL = 0;
          this.videosL = 0;
        }
      });

    this.router.events.subscribe(val => {
      if (val instanceof NavigationEnd && window.innerWidth <= 992 && this.isToggled()) {
        this.toggleSidebar();
      }
    });
  }

  onResize(event) {
    if (event.target.innerWidth > 992) {
      this.botonD = true;
      this.botonC = false;
    }
  }

  controlUsuario() {
    this.desSvc
      .getDataxFiltro('controlUsuarioVideo', (ref) =>
        ref
          .where('idUsuario', '==', this.usuario.id)
          .where('codigoSeccion', '==', 3)
      )
      .subscribe((responseC) => {
        if (responseC.length > 0 && !this.controlUV) {
          this.controlUV = responseC[0];

          const videoA = this.videos.filter(x => x.id === this.controlUV.idVideoActual && x.estado === true);
          if (videoA.length > 0) {
            if ((videoA[0].posicionVPantalla - 1) !== 0) {
              // this.nombreA = `${videoA[0].posicionVPantalla - 1}. ${this.videos[videoA[0].posicionVPantalla - 2].nombre}`;
              this.nombreA = `${this.videos[videoA[0].posicionVPantalla - 2].nombre}`;
            }
            if ((videoA[0].posicionVPantalla + 1) <= this.videos.length) {
              // this.nombreS = `${videoA[0].posicionVPantalla + 1}. ${this.videos[videoA[0].posicionVPantalla].nombre}`;
              this.nombreS = `${this.videos[videoA[0].posicionVPantalla].nombre}`;
            }
            this.filterVideo = videoA[0].id;
            this.showMenuD = videoA[0].idEtapa;
          } else {
            if (this.videos[this.videos[0].posicionVPantalla]) {
              // this.nombreS = `${this.videos[0].posicionVPantalla + 1}. ${this.videos[this.videos[0].posicionVPantalla].nombre}`;
              this.nombreS = `${this.videos[this.videos[0].posicionVPantalla].nombre}`;
            }
            this.filterVideo = this.videos[0].id;
            this.showMenuD = this.videos[0].idEtapa;
          }
          this.controlUV.fechaUltimaVisita = new Date();
          this.controlUV.idVideoActual = this.filterVideo;
          this.desSvc.preAddUpdateControlUVById(this.controlUV);

          if (this.controlUV.videosVistos) {
            this.controlUV.videosVistos.split(',').map(c => {
              this.videos.filter(v => v.id === c).map((a) => {
                this.arrayTotalEV.push(a);
              });
            });
            this.videos.map((v, index) => {
              this.arrayTotalEV.filter(a => a.id === v.id).map(m => {
                this.videos[index].estadoVideo = true;
              });
            });
          }
          this.segundoA = this.controlUV.segundo;
          this.obtenerEtapas();
        } else {
          if (responseC.length === 0 && !this.controlUV) {
            this.controlUV = {
              idUsuario: this.usuario.id,
              codigoSeccion: 3,
              idEtapa: 1,
              idVideoActual: this.videos[0].id,
              fechaUltimaVisita: new Date(),
              segundo: 0
            };
            this.controlUV = this.desSvc.AddControlUV(this.controlUV);
            if (this.videos[1]) {
              // this.nombreS = `${this.videos[0].posicionVPantalla + 1}. ${this.videos[this.videos[0].posicionVPantalla].nombre}`;
              this.nombreS = `${this.videos[this.videos[0].posicionVPantalla].nombre}`;
            }
            this.filterVideo = this.videos[0].id;
            this.showMenuD = this.videos[0].idEtapa;
            this.obtenerEtapas();
          }
        }
      });
  }
  obtenerEtapas() {
    this.desSvc
      .getDataxFiltro('etapa', (ref) =>
        ref
          .where('estado', '==', true)
          .where('codigoSeccion', '==', 3)
          .orderBy('idEtapa')
      )
      .subscribe((responseE) => {
        this.etapasL = responseE.length;
        this.videosL = 0;
        if (this.etapasL > 0 && this.etapas.length === 0) {
          this.idEtapasV.map(v => {
            responseE.filter(x => x.idEtapa === v).map(b => {
              this.etapas.push(b);
            });
          });
          this.etapas.map((e, index) => {
            this.etapas[index].totalVistosE = this.arrayTotalEV.filter((a) => a.idEtapa === e.idEtapa).length;
            this.etapas[index].totalVideosE = this.videos.filter(v => v.idEtapa === e.idEtapa).length;
            this.videosL += this.etapas[index].totalVideosE;
            this.videos.map(v => {
              if (e.idEtapa === v.idEtapa) {
                v.posicionVEtapa = index;
              }
            });
            this.ultimoV = this.videos[this.videosL - 1].id;
          });
          this.porcentajeResultado();
        }
      });
  }

  addExpandClass(element: any) {
    if (element === this.showMenuD) {
      this.showMenuD = 0;
    } else {
      this.showMenuD = element;
    }
  }
  eventCalled() {
    this.isActive = !this.isActive;
  }
  isToggled(): boolean {
    const dom: Element = document.querySelector('body');
    return dom.classList.contains(this.pushRightClass);
  }

  toggleSidebar() {
    const dom: any = document.querySelector('body');
    dom.classList.toggle(this.pushRightClass);
  }

  toggleCollapsed() {
    this.collapsedD = !this.collapsedD;
  }
  getVideos(idEtapa) {
    return this.videos.filter(x => x.idEtapa === idEtapa && x.estado === true);
  }
  verVideo(video: any) {
    if (this.controlUV.idVideoActual !== video.id) {
      if ((video.posicionVPantalla - 1) !== 0) {
        // this.nombreA = `${video.posicionVPantalla - 1}. ${this.videos[video.posicionVPantalla - 2].nombre}`;
        this.nombreA = `${this.videos[video.posicionVPantalla - 2].nombre}`;
      }
      if ((video.posicionVPantalla + 1) <= this.videosL) {
        // this.nombreS = `${video.posicionVPantalla + 1}. ${this.videos[video.posicionVPantalla].nombre}`;
        this.nombreS = `${this.videos[video.posicionVPantalla].nombre}`;
      }
      this.filterVideo = video.id;
      this.controlUV.idVideoActual = video.id;
      this.controlUV.idEtapa = video.idEtapa;
      this.controlUV.segundo = 0;
      this.desSvc.preAddUpdateControlUVById(this.controlUV);
      this.segundoA = 0;
    }
  }


  getPrev(video: any) {
    if ((video.posicionVPantalla - 2) > 0) {
      // this.nombreA = `${video.posicionVPantalla - 2}. ${this.videos[video.posicionVPantalla - 3].nombre}`;
      this.nombreA = `${this.videos[video.posicionVPantalla - 3].nombre}`;
    }
    // this.nombreS = `${video.posicionVPantalla}. ${video.nombre}`;
    this.nombreS = `${video.nombre}`;
    this.filterVideo = this.videos[video.posicionVPantalla - 2].id;
    this.controlUV.idVideoActual = this.videos[video.posicionVPantalla - 2].id;
    this.controlUV.idEtapa = this.videos[video.posicionVPantalla - 2].idEtapa;
    this.showMenuD = this.videos[video.posicionVPantalla - 2].idEtapa;
    this.controlUV.segundo = 0;
    this.desSvc.preAddUpdateControlUVById(this.controlUV);
    this.segundoA = 0;
  }

  moveNext(video: any) {
    // this.nombreA = `${video.posicionVPantalla}. ${video.nombre}`;
    this.nombreA = `${video.nombre}`;
    if ((video.posicionVPantalla + 1) < this.videosL) {
      // this.nombreS = `${video.posicionVPantalla + 2}. ${this.videos[video.posicionVPantalla + 1].nombre}`;
      this.nombreS = `${this.videos[video.posicionVPantalla + 1].nombre}`;
    }
    this.filterVideo = this.videos[video.posicionVPantalla].id;
    this.controlUV.idVideoActual = this.videos[video.posicionVPantalla].id;
    this.controlUV.idEtapa = this.videos[video.posicionVPantalla].idEtapa;
    this.showMenuD = this.videos[video.posicionVPantalla].idEtapa;
    this.controlUV.segundo = 0;
    this.desSvc.preAddUpdateControlUVById(this.controlUV);
    this.segundoA = 0;
  }
  videoTerminado(video: any) {
    if (this.controlUV.videosVistos) {
      const videosVistos = this.controlUV.videosVistos.split(',');
      let existe = 0;
      videosVistos.map(vV => {
        if (vV === video.id) {
          existe = 1;
        }
      });
      if (existe === 0) {
        this.videos[video.posicionVPantalla - 1].estadoVideo = true;
        this.etapas[video.posicionVEtapa].totalVistosE += 1;
        this.controlUV.videosVistos += `,${video.id}`;
        this.desSvc.preAddUpdateControlUVById(this.controlUV);
      }
    } else {
      this.videos[video.posicionVPantalla - 1].estadoVideo = true;
      this.etapas[video.posicionVEtapa].totalVistosE += 1;
      this.controlUV.videosVistos = video.id;
      this.desSvc.preAddUpdateControlUVById(this.controlUV);
    }
    // if (this.videos[video.posicionVPantalla]) {
    if (video.posicionVPantalla <= this.videosL - 1) {
      const intervalV = setInterval(() => {
        // this.nombreA = `${video.posicionVPantalla}. ${video.nombre}`;
        this.nombreA = `${video.nombre}`;
        if ((video.posicionVPantalla + 1) < this.videosL) {
          // this.nombreS = `${video.posicionVPantalla + 2}. ${this.videos[video.posicionVPantalla + 1].nombre}`;
          this.nombreS = `${this.videos[video.posicionVPantalla + 1].nombre}`;
        }
        this.filterVideo = this.videos[video.posicionVPantalla].id;
        if (video.posicionVPantalla === this.videosL - 1) {
          this.controlUV.idVideoActual = this.videos[video.posicionVPantalla].id;
          this.controlUV.idEtapa = this.videos[video.posicionVPantalla].idEtapa;
          this.showMenuD = this.videos[video.posicionVPantalla].idEtapa;
        } else {
          this.controlUV.idVideoActual = this.videos[video.posicionVPantalla].id;
          this.controlUV.idEtapa = this.videos[video.posicionVPantalla].idEtapa;
          this.showMenuD = this.videos[video.posicionVPantalla].idEtapa;
        }
        this.controlUV.segundo = 0;
        this.desSvc.preAddUpdateControlUVById(this.controlUV);
        this.segundoA = 0;
        clearInterval(intervalV);
      }, 5000);
    } else {
      let vistosE = 0;
      this.etapas.map(m => {
        vistosE += m.totalVistosE;
      });
      if (this.videosL === vistosE) {
        this.snackBar.open(
          'Felicidades has completado todo el módulo de desarrollo!',
          'Cerrar',
          {
            duration: 5000,
            horizontalPosition: 'center',
            verticalPosition: 'bottom'
          }
        );
      }
    }
    // }

    this.porcentajeResultado();
  }
  videoC(video: any) {
    if (video.estadoVideo) {
      if (this.controlUV.videosVistos) {
        const videosVistos = this.controlUV.videosVistos.split(',');
        let existe = 0;
        videosVistos.map(vV => {
          if (vV === video.id) {
            existe = 1;
          }
        });
        if (existe === 0) {
          this.etapas[video.posicionVEtapa].totalVistosE += 1;
          this.controlUV.videosVistos += `,${video.id}`;
          this.desSvc.preAddUpdateControlUVById(this.controlUV);
        }
      } else {
        this.etapas[video.posicionVEtapa].totalVistosE += 1;
        this.controlUV.videosVistos = video.id;
        this.desSvc.preAddUpdateControlUVById(this.controlUV);
      }
    } else {
      const videosVistos = this.controlUV.videosVistos.split(',');
      this.controlUV.videosVistos = '';
      videosVistos.map(vV => {
        if (vV !== video.id) {
          if (this.controlUV.videosVistos === '') {
            this.controlUV.videosVistos = `${vV}`;
          } else {
            this.controlUV.videosVistos += `,${vV}`;
          }
        }
      });
      this.etapas[video.posicionVEtapa].totalVistosE -= 1;
      this.desSvc.preAddUpdateControlUVById(this.controlUV);
    }
    this.porcentajeResultado();
  }
  porcentajeResultado() {
    let vistosE = 0;
    this.etapas.map(m => {
      vistosE += m.totalVistosE;
    });

    this.porcentajeVideosV = Math.round(vistosE * 100 / this.videosL);
    if (this.porcentajeVideosV.toString() === 'NaN') {
      this.porcentajeVideosV = 0;
    }
    let aux1 = 'video';
    let aux2 = 'completado';
    if (vistosE !== 1) {
      aux1 = 'videos';
      aux2 = 'completados';
    }
    this.resultado = `${vistosE} ${aux1} de ${this.videosL} ${aux2}.`;
  }
  guardarS(videoP) {
    this.controlUV.segundo = Math.floor(videoP.currentTime);
    this.desSvc.preAddUpdateControlUVById(this.controlUV);
  }
  aparecer(tipo: number) {
    if (tipo === 1) {
      this.botonD = true;
      this.botonC = false;
    } else {
      this.botonD = false;
      this.botonC = true;
    }
  }

}

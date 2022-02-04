import { Component, OnInit, EventEmitter, Output, Input } from "@angular/core";
import { AuthService } from "../../services/auth.service";
import { Router } from "@angular/router";
import { MatDialog } from "@angular/material/dialog";
import { Service } from "../../services/service";
import { MatSnackBar } from "@angular/material/snack-bar";
import { NotificacionModel } from "../../models/notificacion";
import { ToastrService } from "ngx-toastr";
import { ProfileComponent } from "../../../components/pages/profile/profile.component";
import { ControlUsuarioNotificacionModel } from "../../models/controlUsuarioNotificacion";
import { UsuarioModel } from "../../models/usuario";
import { SplitPipe } from '../../pipes/split.pipe';

@Component({
  selector: "app-header",
  templateUrl: "./header.component.html",
  styleUrls: ["./header.component.scss"],
})
export class HeaderComponent implements OnInit {
  rol = "";
  estado = "";
  username = "";
  userPhoto = "";
  valor: string;
  public pushRightClass: string;
  public appName = "PhoeniFx";
  isCollapse: boolean;
  toggle: boolean = false;
  contadorN: number;
  @Output() public sidenavToggle = new EventEmitter();
  @Output() evento = new EventEmitter();
  @Output() link = new EventEmitter<boolean>();

  @Input() porcentajeVV;
  @Input() resultadoVV = "";
  @Input() color = "";
  selectionArray = [
    {
      url: "/trading",
      descripcion: "Trading",
    },
    {
      url: "/educacion",
      descripcion: "Educación Financiera",
    },
    {
      url: "/desarrollo",
      descripcion: "Desarrollo Personal",
    },
  ];
  notificacion: NotificacionModel[] = [];
  selection = "Educación";
  modulo1: string;
  modulo2: string;
  modulo3: string;
  modulo4: string;
  modulo5: string;
  modulo6: string;
  disabled: boolean;
  controlUN: ControlUsuarioNotificacionModel = null;
  usuario: UsuarioModel = null;
  user: string = '';
  constructor(
    public dialog?: MatDialog,
    public authSvc?: AuthService,
    public router?: Router,
    private srvHea?: Service,
    private snackBar?: MatSnackBar,
    private toastrService?: ToastrService
  ) { }

  ngOnInit(): void {
    this.authSvc.saveUserState(1);
    this.pushRightClass = "push-right";
    this.authSvc.getUser().then((data) => {
      if (localStorage.getItem("loginInfo")) {
        const datosUsuario = JSON.parse(
          atob(localStorage.getItem("loginInfo"))
        );
        if (data !== null && datosUsuario) {
          this.srvHea
            .getDataxFiltro("usuario", (ref) =>
              ref.where("uid", "==", datosUsuario.uid)
            )
            .subscribe((responseU) => {
              if (responseU.length > 0) {
                this.usuario = responseU[0];
                this.username = this.usuario.nombre;
                this.user = new SplitPipe().transform(this.username, ' ', 1, 2);
                if (this.usuario.photoURL !== "") {
                  this.userPhoto = this.usuario.photoURL;
                } else {
                  this.userPhoto = "assets/images/userV.png";
                }
                this.rol = this.usuario.rol;
                this.estado = this.usuario.estado;
                if (this.rol === '02clie2' && this.estado === "02pend2") {
                  this.disabled = true;
                  this.valor = "Renovar membresía";
                  this.modulo6 = this.valor;
                } else {
                  this.valor = "Membresías";
                  this.modulo6 = this.valor;
                  this.disabled = false;
                }
                if (window.innerWidth <= 991 || window.innerWidth >= 1405) {
                  this.modulo1 = "Webinar";
                  this.modulo2 = "Actividades";
                  this.modulo3 = "Análisis";
                  this.modulo4 = "Plan Trading";
                  this.modulo5 = "Tienda";
                } else {
                  this.modulo5 = "";
                  this.modulo6 = "";
                }
              }
            });
          if (this.router.url === "/trading") {
            this.selection = "Trading";
          }
          if (this.router.url === "/educacion") {
            this.selection = "Educación Financiera";
          }
          if (this.router.url === "/desarrollo") {
            this.selection = "Desarrollo Personal";
          }
          if ((this.router.url === "/home" ||
            this.router.url === "/actividad" ||
            this.router.url === "/analisis" ||
            this.router.url === "/planTrading"||
            this.router.url === "/tienda" ||
            this.router.url === "/membresia")) {
            this.srvHea.getDataxFiltro("notificacion").subscribe((responseN) => {
              if (responseN.length > 0) {
                this.notificacion = responseN;
                this.srvHea
                  .getDataxFiltro("controlUsuarioNotificacion", (ref) =>
                    ref.where("idUsuario", "==", this.usuario.id)
                  )
                  .subscribe((responseC) => {
                    if (
                      responseC.length > 0 && !this.controlUN
                    ) {
                      this.controlUN = responseC[0];
                      const notificacionesVistas =
                        this.controlUN.notificacionesVistas.split(",");
                      this.notificacion[0].controlNotification
                        .filter((cn) => cn.estado === true)
                        .map((n) => {
                          let existe: boolean = false;
                          notificacionesVistas.map((nV) => {
                            if (nV === n.id.toString()) {
                              existe = true;
                            }
                          });
                          if (!existe) {
                            localStorage.setItem(
                              "notificationInfo",
                              btoa(JSON.stringify(true).toString())
                            );
                            if (this.contadorN === undefined) {
                              this.contadorN = 0;
                            }
                            this.contadorN += 1;
                          }
                        });
                    } else {
                      if (this.contadorN !== null) {
                        this.notificacion.map((n) => {
                          this.contadorN = n.controlNotification.filter(
                            (cn) => cn.estado === true
                          ).length;
                          if (this.contadorN === 0) {
                            this.contadorN = null;
                          }
                        });
                      }
                    }
                  });
              }
            });
          }
        }
      } else {
        if (data !== null) {
          this.snackBar.open(
            "Hubo un problema por favor Inicia Sesión nuevamente. Gracias",
            "Cerrar",
            {
              duration: 5000,
              horizontalPosition: "center",
              verticalPosition: "bottom",
            }
          );
          this.router.navigate(["/login"]);
          return;
        }
        this.valor = "";
        this.modulo5 = "Tienda";
        this.modulo6 = "Membresías";
      }
    });   
    this.valor = "";
    this.modulo5 = "Tienda";
    this.modulo6 = "Membresías"; 
    this.isCollapse = false;
  }
  toggleSidebar() {
    this.isCollapse = !this.isCollapse;
  }
  cerrartoggleSidebar() {
    this.isCollapse = false;
  }
  onResize(event) {
    if (this.valor === "" || this.router.url === "/login") {
      this.modulo2 = "Tienda";
      this.modulo6 = "Membresías";
      return;
    }
    if (event.target.innerWidth >= 991 && event.target.innerWidth <= 1405) {
      this.modulo1 = "";
      this.modulo2 = "";
      this.modulo3 = "";
      this.modulo4 = "";
      this.modulo5 = "";
      this.modulo6 = "";
    } else {
      this.modulo1 = "Webinar";
      this.modulo2 = "Actividades";
      this.modulo3 = "Análisis";
      this.modulo4 = "Plan Trading";
      this.modulo5 = "Tienda";
      this.modulo6 = this.valor;
    }
  }

  onLogout(): void {
    this.isCollapse = false;
    this.authSvc.logout();
    this.valor = "";
    this.modulo5 = "Tienda";
    this.modulo6 = "Membresías";
    this.dialog.closeAll();
    if (
      this.router.url !== "/tienda" &&
      this.router.url !== "/membresia" &&
      this.router.url !== "/home"
    ) {
      this.router.navigate(["/home"]);
    } else {
      (document.getElementById("txtNombre") as HTMLInputElement).value = "";
      (document.getElementById("txtEmail") as HTMLInputElement).value = "";
    }
    if (this.router.url === "/membresia") {
      document.getElementById("ftPlanS").innerText = "";
      document.getElementById("ftPlanP").innerText = "";
      document.getElementById("iconFS").innerText = "";
      document.getElementById("iconFP").innerText = "";
      document.getElementById("btnPlanS").innerText = "Comprar";
      document.getElementById("btnPlanP").innerText = "Comprar";
    }
    this.link.emit(false);
    this.snackBar.open("Sesión cerrada con éxito!", "Cerrar", {
      duration: 5000,
      horizontalPosition: "end",
      verticalPosition: "bottom",
    });
  }

  isToggled(): boolean {
    const dom: Element = document.querySelector("body");
    return dom.classList.contains(this.pushRightClass);
  }

  rltAndLtr() {
    const dom: any = document.querySelector("body");
    dom.classList.toggle("rtl");
  }

  public onToggleSidenav = () => {
    this.sidenavToggle.emit();
  };
  eventoAdmin() {
    this.isCollapse = false;
    this.evento.emit();
  }
  openDialog(): void {
    this.isCollapse = false;
    const dialogRef = this.dialog.open(ProfileComponent, {
      width: "600px",
      maxHeight: '600px',
      disableClose: true,
    });
    dialogRef.afterClosed().subscribe((result) => {
      console.log(`Dialog result ${result}`);
    });
  }
  verNotificacion() {
    if (!localStorage.getItem("loginInfo")) {
      this.snackBar.open(
        "Hubo un problema por favor Inicia Sesión nuevamente. Gracias",
        "Cerrar",
        {
          duration: 5000,
          horizontalPosition: "center",
          verticalPosition: "bottom",
        }
      );
      this.router.navigate(["/login"]);
      return;
    }
    this.isCollapse = false;
    if (this.rol === "02clie2" && this.estado === "02pend2") {
      this.snackBar.open(
        "Renueva tu membresía para seguir disfrutando de nuestros servicios!",
        "Cerrar",
        {
          duration: 5000,
          horizontalPosition: "center",
          verticalPosition: "bottom",
        }
      );
      this.router.navigate(["/membresia"]);
      return;
    }
    if (this.notificacion.length > 0) {
      this.notificacion.map((n) => {
        if (n.controlNotification.filter(
          (cn) => cn.estado === true
        ).length === 0) {
          this.toastrService.info('No existen notificaciones a mostrar!!', `Hola  ${this.user} 😊`);
          return;
        }
      });
      this.notificacion.map((n) => {
        if (n.controlNotification.length > 0) {
          let notificaciones = "";
          n.controlNotification
            .filter((cn) => cn.estado === true)
            .map((c) => {
              if (notificaciones === "") {
                notificaciones = c.id;
              } else {
                notificaciones += `,${c.id}`;
              }
              switch (c.style) {
                case 1:
                  this.toastrService.info(c.message, c.title);
                  break;
                case 2:
                  this.toastrService.success(c.message, c.title);
                  break;
                case 3:
                  this.toastrService.warning(c.message, c.title);
                  break;
                default:
                  this.toastrService.error(c.message, c.title);
                  break;
              }
            });
          if (localStorage.getItem("notificationInfo")) {
            const notiInfo = JSON.parse(
              atob(localStorage.getItem("notificationInfo"))
            );
            if (this.controlUN && notiInfo) {
              this.controlUN.notificacionesVistas =
                notificaciones.toString();
              this.srvHea.preAddUpdateControlUNById(this.controlUN);
            }
          }
          if (!this.controlUN) {
            this.controlUN = {
              idUsuario: this.usuario.id,
              notificacionesVistas: notificaciones.toString(),
            };
            this.srvHea.AddControlUN(this.controlUN);
          }
        }
      });
      this.contadorN = null;
    } else {
      this.toastrService.info('No existen notificaciones a mostrar!!', `Hola ${this.user} 😊`);
    }
  }
}

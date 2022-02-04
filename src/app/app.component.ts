import { Component, HostListener } from '@angular/core';
import { BnNgIdleService } from 'bn-ng-idle';
import { AuthService } from '../../src/app/shared/services/auth.service';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import Swal from 'sweetalert2';
import { Subject } from 'rxjs';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = 'PhoeniFx';
  userActivity;
  userInactive: Subject<any> = new Subject();

  constructor(
    private bnIdle: BnNgIdleService,
    private bn: BnNgIdleService,
    public appSvc: AuthService,
    private router: Router,
    public dialog: MatDialog
  ) {
    console.log('\x1b[31m%s\x1b[0m', '¡Detente!');
    console.log('\x1b[31m%s\x1b[0m', 'Esta función del navegador es para los desarrolladores de PhoeniFx. Si alguien te indicó que copiaras y pegaras algo aquí para habilitar una función de PhoeniFx o para "hackear" el sitio, se trata de un fraude. Si lo haces, estaras cometiendo perjurio contra PhoeniFx de acuerdo con los términos y condiciones estipulados por dicho sitio.');
    document.oncontextmenu = () => false;
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
    this.bnIdle.startWatching(300).subscribe((res) => {
      this.appSvc
        .getUser()
        .then(data => {
          if (res && this.router.url !== '/login' && this.router.url !== '/adminmaintenancemodulePF/videos' && this.router.url !== '/adminmaintenancemodulePF/imagenes' && this.router.url !== '/trading' && this.router.url !== '/educacion' &&
            this.router.url !== '/desarrollo' && this.router.url !== '/webinar' && data !== null) {
            this.metodoExpiraSesion();
          }
        });
    });
    this.setTimeout();
    this.userInactive.subscribe(() => {
      this.appSvc
        .getUser()
        .then(data => {
          if (this.router.url !== '/login' && this.router.url !== '/adminmaintenancemodulePF/videos' && this.router.url !== '/adminmaintenancemodulePF/imagenes' && (this.router.url === '/trading' || this.router.url === '/educacion' ||
            this.router.url === '/desarrollo' || this.router.url === '/webinar') && data !== null) {
            this.metodoExpiraSesion();
          }
        });
    });

    this.router.events.subscribe((val) => {
      this.dialog.closeAll();
    });
  }

  metodoExpiraSesion() {
    let timerInterval
    Swal.fire({
      title: 'Atención',
      html: 'Tu sesión expirará en: <b></b>',
      timer: 60000,
      onBeforeOpen: () => {
        timerInterval = setInterval(() => {
          if ((Swal.getTimerLeft() / 1000).toString().split('.')[0] === '1') {
            Swal.getContent().querySelector('b').textContent = `${(Swal.getTimerLeft() / 1000).toString().split('.')[0]} segundo.`;
          } else {
            Swal.getContent().querySelector('b').textContent = `${(Swal.getTimerLeft() / 1000).toString().split('.')[0]} segundos.`;
          }
        }, 100);
      },
      onClose: () => {
        clearInterval(timerInterval)
      },
      imageUrl: 'assets/images/time.jpeg',
      imageWidth: 150,
      imageHeight: 150,
      imageAlt: 'Tiempo',
      showCloseButton: true,
      showClass: {
        popup: 'animate__animated animate__fadeInDown'
      },
      hideClass: {
        popup: 'animate__animated animate__fadeOutUp'
      },
      footer: '<p style="text-align: center;">Haz click en continuar para seguir disfrutando de los servicios que te ofrece <b>PhoeniFx.</b></p>',
      confirmButtonColor: '#0069D9',
      timerProgressBar: true,
      showConfirmButton: true,
      heightAuto: true,
      confirmButtonText: 'Continuar'
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.close();
      }
      if (result.dismiss === Swal.DismissReason.timer) {
        this.appSvc.logout();
        console.log('session expired');
        Swal.fire({
          html: 'Tu sesión ha expirado, te invitamos a volver a iniciar sesión <a href="https://phoenifx.com/login" title="Ir">PhoeniFx.com</a>',
          imageUrl: 'assets/images/logo.png',
          imageWidth: 150,
          imageHeight: 150,
          imageAlt: 'Logo',
          showClass: {
            popup: 'animate__animated animate__fadeInDown'
          },
          hideClass: {
            popup: 'animate__animated animate__fadeOutUp'
          },
          footer: 'Volver a&nbsp;<a href="https://phoenifx.com/login" title="Ir">PhoeniFx.com</a>',
          showCloseButton: true,
          showConfirmButton: false,
          allowEnterKey: false,
          heightAuto: true,
          allowOutsideClick: false
        }).then((result) => {
          if (result.isDismissed) {
            if (this.router.url !== '/home') {
              this.router.navigate(['/home']);
            }
          }
        });
      }
    });
  }

  setTimeout() {
    this.userActivity = setTimeout(() => this.userInactive.next(undefined), 7200000);
  }

  @HostListener('window:pagehide')
  closeWindow() {
    this.appSvc.logout();
  }
  @HostListener('window:mousemove') refreshUserState() {
    clearTimeout(this.userActivity);
    this.setTimeout();
  }
  @HostListener('window:click') refreshUserState2() {
    clearTimeout(this.userActivity);
    this.setTimeout();
  }
  @HostListener('window:keypress') refreshUserState3() {
    clearTimeout(this.userActivity);
    this.setTimeout();
  }
}

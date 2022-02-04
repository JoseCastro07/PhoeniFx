import { Component, OnInit, ViewEncapsulation } from '@angular/core';

import { Router } from '@angular/router';
import { AuthService } from '../../shared/services/auth.service';
import { Service } from '../../shared/services/service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class AdminComponent implements OnInit {
  public opened: boolean = false;
  sliders = [1055, 194, 368, 400].map(
    (n) => `https://picsum.photos/id/${n}/900/500`
  );
  collapedSideBar: boolean;
  eventImage: false;
  url: string;
  isDataAvailable: boolean = false;

  constructor(
    private router: Router,
    public authSvc: AuthService,
    private admSvc: Service,
    private snackBar: MatSnackBar
  ) {
    this.url = router.url;
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
    this.admSvc
      .getDataxFiltro('usuario', (ref) =>
        ref.where('uid', '==', datosUsuario.uid)
      )
      .subscribe((response) => {
        if (response[0].rol !== '1.gxp12jt$l#' && response[0].codigoS !== '823MW.$E#') {
          this.router.navigate(['/home']);
          return;
        } else {
          this.isDataAvailable = true;
        }
      });
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
  }
  receiveCollapsed($event) {
    this.collapedSideBar = $event;
  }
  eventoImagen($event) {
    this.eventImage = $event;
  }
  eventoAdmin() {
    this.url = '/adminmaintenancemodulePF';
    this.eventImage = false;
  }
}

import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { PaymentComponent } from '../payment/payment.component';
import { Service } from '../../../shared/services/service';
import { Router } from '@angular/router';
import { AuthService } from '../../../shared/services/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import localeEs from '@angular/common/locales/es';
import { registerLocaleData } from '@angular/common';
registerLocaleData(localeEs, 'es');

@Component({
  selector: 'app-membresia',
  templateUrl: './membresia.component.html',
  styleUrls: ['./membresia.component.scss'],
  encapsulation: ViewEncapsulation.None
})

export class MembresiaComponent implements OnInit {
  btnS: string = '';
  btnP: string = '';
  actualS: string = '';
  actualP: string = '';
  fechaS: string = '';
  fechaP: string = '';
  serviciosT = [
    {
      servicio: 'Acceso a plataforma educativa.'
    },
    {
      servicio: 'Educación en trading de principiante hasta avanzado.'
    },
    {
      servicio: 'Clases en vivo.'
    },
    {
      servicio: 'Módulos de desarrollo personal.'
    },
    {
      servicio: 'Módulos de educación financiera.'
    },
    {
      servicio: 'Ideas y proyecciones de trading.'
    },
    {
      servicio: 'Incluye kit de materiales.'
    },
    {
      servicio: 'Dos sesiones de coaching al mes.'
    }
  ];


  constructor(
    public dialog: MatDialog,
    private memSvc: Service,
    private router: Router,
    public authSvc: AuthService,
    private snackBar: MatSnackBar,
  ) {
    this.dialog.closeAll();
  }

  ngOnInit() {
    if (localStorage.getItem('loginInfo')) {
      const datosUsuario = JSON.parse(
        atob(localStorage.getItem('loginInfo'))
      );
      this.memSvc
        .getDataxFiltro('usuario', (ref) =>
          ref.where('uid', '==', datosUsuario.uid)
        )
        .subscribe((response) => {
          if (response.length > 0 && this.router.url === '/membresia') {
            if (response[0].tipoPlan === '01sta1') {
              this.btnS = 'Renovar Plan';
              this.btnP = 'Comprar';
              this.actualS = '(Actual Plan)';
              this.fechaS = response[0].fechaVencimientoPago;
            } else {
              this.btnS = 'Comprar';
              this.btnP = 'Renovar Plan';
              this.actualP = '(Actual Plan)';
              this.fechaP = response[0].fechaVencimientoPago;
            }
          }
        });
    } else {
      this.authSvc
        .getUser()
        .then(data => {
          if (data !== null) {
            this.snackBar.open(
              'Hubo un problema por favor Inicia Sesión nuevamente. Gracias',
              'Cerrar',
              {
                duration: 5000,
                horizontalPosition: 'center',
                verticalPosition: 'bottom'
              }
            );
            this.router.navigate(['/login']);
            return;
          }
        });
      this.btnS = 'Comprar';
      this.btnP = 'Comprar';
    }
  }

  openDialog(plan: number): void {
    let tipoP = '';
    if (plan === 1) {
      tipoP = '01sta1';
    } else {
      tipoP = '02pre2';
    }
    const dialogRef = this.dialog.open(PaymentComponent, {
      data: { tipo: tipoP },
      width: '510px',
      maxHeight: '600px'
    });
    dialogRef.afterClosed().subscribe((result) => {
      console.log(`Dialog result ${result}`);
    });
  }
}

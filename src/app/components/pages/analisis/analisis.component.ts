import { Component, OnInit } from '@angular/core';
import { Service } from '../../../shared/services/service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { ImagenModel } from '../../../shared/models/imagen';

@Component({
  selector: 'app-analisis',
  templateUrl: './analisis.component.html',
  styleUrls: ['./analisis.component.scss']
})
export class AnalisisComponent implements OnInit {
  imagen: ImagenModel[] = [];
  datos: number;
  isDataAvailable: boolean = false;
  constructor(private AnSvc: Service,
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
    const datosUsuario = JSON.parse(
      atob(localStorage.getItem('loginInfo'))
    );
    this.AnSvc
      .getDataxFiltro('usuario', (ref) =>
        ref.where('uid', '==', datosUsuario.uid)
      )
      .subscribe((responseU) => {
        if (responseU[0].rol === '02clie2' && responseU[0].estado === '02pend2') {
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

    this.AnSvc
      .getDataxFiltro('imagen', (ref) =>
        ref
          .where('estado', '==', true)
          .where('tipoImagen', '==', 3)
          .orderBy('fechaCreacion')
      )
      .subscribe((responseI) => {
        if (responseI.length > 0 && this.router.url === '/analisis') {
          this.datos = responseI.length;
          responseI.map(i => {
            i.tipoE = ((/[.]/.exec(i.urlImagen)) ? /[^.]+$/.exec(i.urlImagen)[0] : i.urlImagen).split('?')[0];
            this.imagen.push(i);
          })
        };
      });
  }

}

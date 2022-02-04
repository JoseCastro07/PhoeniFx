import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../shared/services/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-tienda',
  templateUrl: './tienda.component.html',
  styleUrls: ['./tienda.component.scss']
})
export class TiendaComponent implements OnInit {

  constructor(private router: Router,
    public authSvc: AuthService,
    private snackBar: MatSnackBar) { }

  ngOnInit(): void {
    this.authSvc
      .getUser()
      .then(data => {
        if (data !== null && !localStorage.getItem('loginInfo')) {
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
  }
}

import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { ContactComponent } from '../../../components/pages/contact/contact.component';
import { ErrorStateMatcher } from '@angular/material/core';
import { FormControl, FormGroupDirective, NgForm, Validators, FormGroup } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Service } from '../../services/service';
import { AuthService } from '../../services/auth.service';
import { CorreoModel } from '../../models/correo';
import Swal from 'sweetalert2';

export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(
    control: FormControl | null,
    form: FormGroupDirective | NgForm | null
  ): boolean {
    const isSubmitted = form && form.submitted;
    return !!(
      control &&
      control.invalid &&
      (control.dirty || control.touched || isSubmitted)
    );
  }
}


@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class FooterComponent implements OnInit {
  deshabilitarC: boolean = false;
  data: CorreoModel = null;
  estado: boolean = false;
  constructor(public router: Router, public dialog: MatDialog, private snackBar: MatSnackBar,
    public authSvc: AuthService, private srvUsu: Service) { }


  public footerForm = new FormGroup({
    name: new FormControl('', Validators.required),
    emailF: new FormControl('', Validators.required)
  });

  matcher = new MyErrorStateMatcher();

  ngOnInit(): void {
    if (localStorage.getItem('loginInfo')) {
      const datosUsuario = JSON.parse(
        atob(localStorage.getItem('loginInfo'))
      );
      if ( datosUsuario) {
        this.srvUsu
          .getDataxFiltro('usuario', (ref) =>
            ref.where('uid', '==', datosUsuario.uid)
          )
          .subscribe((response) => {
            if (response.length > 0) {
              this.footerForm.get('name').setValue(response[0].nombre);
              this.footerForm.get('emailF').setValue(response[0].email);
              // this.footerForm.get('name').disable();
              // this.footerForm.get('emailF').disable();
              this.deshabilitarC = true;
            }
          });
      }
    }
  }
  validaControl(name: string) {
    return (
      this.footerForm.get(name).invalid && this.footerForm.get(name).touched
    );
  }
  get validoCorreo1() {
    return (
      this.footerForm.get('emailF').invalid &&
      !(this.footerForm.get('emailF').value === '')
    );
  }
  get validoCorreo2() {
    return (
      this.footerForm.get('emailF').invalid &&
      this.footerForm.get('emailF').value === ''
    );
  }
  sendEmail(tipo?) {
    if (tipo) {
      if (this.footerForm.valid) {
        try {
          this.data = this.footerForm.value;
          if (this.deshabilitarC) {
            this.data.name = this.footerForm.get('name').value;
            this.data.emailF = this.footerForm.get('emailF').value;
          }
          this.data.emailT = '';
          this.data.subject = 'Solicitud de suscripción';
          this.data.message = `<p><strong>${this.data.name}</strong> con el correo: <strong>${this.data.emailF}</strong> a solicitado suscribirse al noticiero semanal.</p>`;
          this.data.fechaCreacion = new Date();
          this.data.estado = 'pendiente';
          this.srvUsu.AddCorreo(this.data);
          // this.footerForm.reset();
          this.snackBar.open(`Te has suscrito con éxito.`, 'Cerrar', {
            duration: 3000,
          });
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
      } else {
        if (this.footerForm.get('name').value === '') {
          (document.getElementById(
            'txtNombre'
          ) as HTMLInputElement).focus();
        } else {
          if (this.footerForm.get('emailF').value === '' || this.footerForm.get('emailF').invalid) {
            (document.getElementById(
              'txtEmail'
            ) as HTMLInputElement).focus();
          }
        }
      }
    } else {
      const dialogRef = this.dialog.open(ContactComponent, {
        data: { tipo: 2 },
        width: '450px',
        disableClose: true,
        maxHeight: '600px'
      });
      dialogRef.afterClosed().subscribe((result) => {
        console.log(`Dialog result ${result}`);
      });
    }
  }
  irArriba() {
    const currentScroll = document.documentElement.scrollTop;
    if (currentScroll > 0) {
      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
    }
  }
}

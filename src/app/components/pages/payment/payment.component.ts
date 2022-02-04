import { Component, OnInit, Inject, ViewEncapsulation } from '@angular/core';
import { MatDialogRef, MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Service } from '../../../shared/services/service';
import { AuthService } from '../../../shared/services/auth.service';
import { FormGroup, FormControl, Validators, FormGroupDirective, NgForm } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';
import { Router } from '@angular/router';
import { UsuarioModel } from '../../../shared/models/usuario';
import { CorreoModel } from '../../../shared/models/correo';
import { PaypalComponent } from '../paypal/paypal.component';
import Swal from 'sweetalert2';
import { MatSnackBar } from '@angular/material/snack-bar';

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
  selector: 'app-payment',
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class PaymentComponent implements OnInit {
  tipoPlan: string;
  deshabilitarP: boolean = false;
  hide = true;
  usu: UsuarioModel;
  correo = new CorreoModel();
  btnNombre: string = 'Pagar';
  estadoT: boolean = false;
  constructor(
    private usuSvc: Service,
    public authSvc: AuthService,
    public dialogRef: MatDialogRef<PaymentComponent>,
    public dialog: MatDialog,
    public router: Router,
    private snackBar: MatSnackBar,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.tipoPlan = data.tipo;
  }

  public paymentForm = new FormGroup({
    nombre: new FormControl('', Validators.required),
    email: new FormControl('', [
      Validators.required,
      Validators.email
    ]),
    password: new FormControl('', [
      Validators.required,
      Validators.minLength(8)
    ]),
    codigoR: new FormControl(''),
    terminoC: new FormControl(false)
  });

  matcher = new MyErrorStateMatcher();

  ngOnInit(): void {
    if (localStorage.getItem('loginInfo')) {
      const datosUsuario = JSON.parse(
        atob(localStorage.getItem('loginInfo'))
      );
      if (datosUsuario) {
        this.usuSvc
          .getDataxFiltro('usuario', (ref) =>
            ref.where('uid', '==', datosUsuario.uid)
          )
          .subscribe((response) => {
            if (response.length > 0) {
              this.usu = response[0];
              this.paymentForm.get('nombre').setValue(response[0].nombre);
              this.paymentForm.get('email').setValue(response[0].email);
              this.paymentForm.get('password').setValue('A0000000');
              this.paymentForm.get('codigoR').setValue('');
              // this.paymentForm.get('password').disable();
              this.paymentForm.get('nombre').disable();
              this.paymentForm.get('email').disable();
              this.deshabilitarP = true;
              this.btnNombre = 'Renovar';
            }
          });
      }
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
    }
  }

  validaControl(nombre: string) {
    return (
      this.paymentForm.get(nombre).invalid && this.paymentForm.get(nombre).touched
    );
  }
  get validoCorreo1() {
    return (
      this.paymentForm.get('email').invalid &&
      !(this.paymentForm.get('email').value === '')
    );
  }
  get validoCorreo2() {
    return (
      this.paymentForm.get('email').invalid &&
      this.paymentForm.get('email').value === ''
    );
  }

  aplicarPayment() {
    if (this.paymentForm.valid && this.paymentForm.get('terminoC').value) {
      if (this.deshabilitarP) {
        this.usu.fechaPago = new Date();
        if (this.usu.estado === '01canc1') {
          const fechaA = new Date(this.usu.fechaVencimientoPago);
          this.usu.fechaVencimientoPago = new Date(
            fechaA.setFullYear(fechaA.getFullYear() + 1));
        } else {
          const fechaA = new Date();
          this.usu.fechaVencimientoPago = new Date(
            fechaA.setFullYear(fechaA.getFullYear() + 1));
        }
        this.usu.fechaModificacion = new Date();
        this.usu.usuarioModificacion = this.usu.nombre;
        this.usu.estado = '01canc1';
        this.usu.tipoPlan = this.tipoPlan;
        this.usu.terminoC = this.paymentForm.get('terminoC').value;
        this.usu.tipoPago = 'En Línea';
        const dialogRef = this.dialog.open(PaypalComponent, {
          data: { usu: this.usu, tipo: 1 },
          width: '510px', maxHeight: '600px'
        });
        dialogRef.afterClosed().subscribe((result) => {
          console.log(`Dialog result ${result}`);
        });
      } else {
        this.usu = this.paymentForm.value;
        this.usuSvc
          .getDataxFiltro('usuario', (ref) =>
            ref.where('email', '==', this.usu.email)
          )
          .subscribe((responseU) => {
            if (responseU.length > 0 && this.router.url === '/membresia') {
              Swal.fire({
                text: 'Hubo un problema!',
                icon: 'warning',
                title: 'Oops...',
                footer: 'Este correo ya está en uso. Prueba con otro.',
                showCloseButton: true
              });
            } else {
              if (this.router.url === '/membresia') {
                this.usu.fechaCreacion = new Date();
                this.usu.usuarioCreacion = this.usu.nombre;
                this.usu.fechaPago = new Date();
                const fechaA = new Date();
                this.usu.fechaVencimientoPago = new Date(
                  fechaA.setFullYear(fechaA.getFullYear() + 1));
                this.usu.photoURL = '';
                this.usu.nombreImagen = '';
                this.usu.estado = '01canc1';
                this.usu.tipoPlan = this.tipoPlan;
                this.usu.rol = '02clie2';
                this.usu.codigoS = '0123'
                this.usu.tipoPago = 'En Línea';

                const dialogRef = this.dialog.open(PaypalComponent, {
                  data: { usu: this.usu, tipo: 2 },
                  width: '510px', maxHeight: '600px'
                });
                dialogRef.afterClosed().subscribe((result) => {
                  console.log(`Dialog result ${result}`);
                });
              }
            }
          });
      }
    } else {
      this.validacion();
    }
  }
  checkT() {
    this.estadoT = this.paymentForm.get('terminoC').value;
  }
  validacion() {
    if (this.paymentForm.get('nombre').value === '') {
      (document.getElementById(
        'txtNombreU'
      ) as HTMLInputElement).focus();
    } else {
      if (this.paymentForm.get('email').value === '' || this.paymentForm.get('email').invalid) {
        (document.getElementById(
          'txtCorreo'
        ) as HTMLInputElement).focus();
      } else {
        if (this.paymentForm.get('password').value === '' || this.paymentForm.get('password').invalid) {
          (document.getElementById(
            'txtPassword'
          ) as HTMLInputElement).focus();
        } else {
          if (!this.paymentForm.get('terminoC').value) {
            this.estadoT = true;
            (document.getElementById(
              'chxTermino'
            ) as HTMLInputElement).focus();
          }
        }
      }
    }
  }
}



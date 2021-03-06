import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../shared/services/auth.service';
import {
  FormGroup,
  FormControl,
  Validators,
  FormGroupDirective,
  NgForm,
} from '@angular/forms';
import { Router } from '@angular/router';

import Swal from 'sweetalert2';
import { UsuarioModel } from '../../../shared/models/usuario';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ErrorStateMatcher } from '@angular/material/core';
import { Service } from '../../../shared/services/service';
import { MatDialog } from '@angular/material/dialog';
import { AngularFireAuth } from '@angular/fire/auth';
import { Observable } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { DatePipe } from '@angular/common';
import { CorreoModel } from '../../../shared/models/correo';

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
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']

})
export class LoginComponent implements OnInit {
  usuario: any;
  hide = true;
  valido: boolean = false;
  cargando: boolean = false;
  mensaje: string;
  usu: UsuarioModel;
  user: Observable<any>;
  correo = new CorreoModel();
  usuarioP: UsuarioModel;
  usuarioA: UsuarioModel[];
  constructor(
    private authSvc: AuthService,
    private router: Router,
    private logSvc: Service,
    private snackBar: MatSnackBar,
    public dialog: MatDialog,
    public afAuth: AngularFireAuth,
    private toastrService: ToastrService,
    private datePipe: DatePipe,
  ) { }

  loginForm = new FormGroup({
    email: new FormControl('', Validators.required),
    password: new FormControl('', [
      Validators.required,
      Validators.minLength(8)
    ])
  });
  matcher = new MyErrorStateMatcher();

  ngOnInit() {
    this.authSvc.logout();
    /* const uid =  this.authSvc.confirmSignIn(this.router.url);
     if(await uid !== ''){
       this.onLogin(uid);
     }*/
  }

  validaControl1(name: string) {
    if (this.loginForm.get(name).value === '' && this.loginForm.get(name).touched) {
      return true;
    }
    return false;
  }
  validaControl2(name: string) {
    const lenght = this.loginForm.get(name).value.length;
    if ((lenght < 8 || this.loginForm.get(name).invalid) && (lenght > 0 && this.loginForm.get(name).touched)) {
      return true;
    }
    return false;
  }
  get validoCorreo1() {
    return (
      this.loginForm.get('email').invalid &&
      !(this.loginForm.get('email').value === '')
    );
  }
  get validoCorreo2() {
    return (
      this.loginForm.get('email').invalid &&
      this.loginForm.get('email').value === ''
    );
  }
  onLogin(uid?) {
    /*  if(uid){
        this.logSvc
        .getDataxFiltro('usuario', (ref) =>
          ref.where('uid', '==', uid)
        )
        .subscribe((response) => {
          if (response.length > 0 && !localStorage.getItem('loginInfo')) {
  
            if (response[0].rol === '02clie2' && response[0].fechaVencimientoPago
              < new Date() && response[0].estado === '01canc1') {
              response[0].estado = '02pend2';
              this.logSvc.editUsuarioById(response[0]);
            }
  
            const usuario = {
              nombre: response[0].nombre,
              uid: response[0].uid
            };
            localStorage.setItem(
              'loginInfo',
              btoa(JSON.stringify(usuario).toString())
            );
            if (response[0].rol === '02clie2' && response[0].estado === '02pend2') {
              this.snackBar.open('Recuerda actualizar tu pago!', 'Cerrar', {
                duration: 5000,
              });
            } else {
              this.snackBar.open(
                `Te damos la bienvenida ${usuario.nombre} de parte del equipo de PhoeniFx!`,
                'Cerrar',
                {
                  duration: 5000,
                }
              );
            }
            this.router.navigate(['/home']);
          }
        });
      }else{*/
    if (this.loginForm.valid) {
      this.cargando = true;
      this.usu = this.loginForm.value;
      this.authSvc
        .loginByEmailUsu(this.usu)
        .then((res) => {
          this.logSvc
            .getDataxFiltro('usuario', (ref) =>
              ref.where('uid', '==', res.user.uid)
            )
            .subscribe((response) => {
              if (response.length > 0 && !localStorage.getItem('loginInfo')) {
                // && this.router.url === '/login') {
                this.authSvc.saveUserState(1);

               /* if (response[0].rol === '02clie2' && response[0].fechaVencimientoPago
                  < new Date() && response[0].estado === '01canc1') {
                  response[0].estado = '02pend2';
                  this.logSvc.editUsuarioById(response[0]);
                }*/
                this.usuario = {
                  nombre: response[0].nombre,
                  uid: response[0].uid
                };

                localStorage.setItem(
                  'loginInfo',
                  btoa(JSON.stringify(this.usuario).toString())
                );

                this.logSvc.codigoPais().subscribe(c => {
                  this.logSvc
                    .getDataxFiltro('codigoPais').subscribe(cP => {
                      localStorage.setItem(
                        'codigoPais',
                        btoa(JSON.stringify(cP.filter(x => x.codigoPais === c['country_code']))));
                      if (localStorage.getItem('codigoPais') === 'W10=') {
                        localStorage.setItem(
                          'codigoPais',
                          btoa(JSON.stringify(cP.filter(x => x.codigoPais === 'DF'))));
                      }
                    });
                });

                if (response[0].rol === '02clie2' && response[0].estado === '02pend2') {
                  this.snackBar.open('Recuerda actualizar tu pago!', 'Cerrar', {
                    duration: 5000
                  });
                } else {
                  if (response[0].rol === '02clie2') {
                    const diasdif = new Date(this.datePipe.transform(response[0].fechaVencimientoPago, 'yyyy/MM/dd')).getTime() - new Date(this.datePipe.transform(new Date, 'yyyy/MM/dd')).getTime();
                    const dias = Math.round(diasdif / (1000 * 60 * 60 * 24));
                    if (dias <= 10 && dias > 1) {
                      this.toastrService.warning(`De parte del Equipo de PhoeniFx te queremos recordar que tu pago esta pr??ximo a vencer, d??as restantes ${dias}.`, 'Atenci??n');
                    }
                    if (dias === 1) {
                      this.toastrService.warning(`De parte del Equipo de PhoeniFx te queremos recordar que tu pago esta pr??ximo a vencer, d??a restante ${dias}.`, 'Atenci??n');
                    }
                    if (dias === 0) {
                      this.toastrService.warning(`De parte del Equipo de PhoeniFx te queremos recordar que hoy finaliza tu membres??a.`, 'Atenci??n');
                    }
                  }
                  this.snackBar.open(
                    `Te damos la bienvenida ${response[0].nombre} de parte del equipo de PhoeniFx!`,
                    'Cerrar',
                    {
                      duration: 5000
                    }
                  );
                }
                this.router.navigate(['/home']);
                this.cargando = false;
              }
            });
        })
        .catch((err) => {
          this.valido = true;
          this.cargando = false;
          // console.log('Error', err);
          if (err.code === 'auth/user-not-found') {
            this.mensaje = 'Usuario incorrecto.';
            return;
          }
          if (err.code === 'auth/wrong-password') {
            this.mensaje = 'Contrase??a incorrecta.';
            return;
          }
          if (err.code === 'auth/network-request-failed') {
            this.mensaje =
              'Revisa tu conexi??n a Internet y vuelve a intentarlo m??s tarde.';
            return;
          }
          if (err.code === 'auth/too-many-requests') {
            this.mensaje =
              'L??mite de intentos de Inicio de Sesi??n excedido, intenta m??s tarde.';
            return;
          }
        });
    } else {
      if (this.loginForm.get('email').value === '' || this.loginForm.get('email').invalid) {
        (document.getElementById(
          'txtCorreo'
        ) as HTMLInputElement).focus();
      } else {
        if (this.loginForm.get('password').value === '' || this.loginForm.get('password').invalid) {
          (document.getElementById(
            'txtPassword'
          ) as HTMLInputElement).focus();
        }
      }
    }
    // }
  }

  sendPass() {
    Swal.fire({
      title: 'Cambiar contrase??a',
      text: 'Correo electr??nico',
      input: 'email',
      validationMessage: 'Correo electr??nico inv??lido',
      showClass: {
        popup: 'animate__animated animate__fadeInDown',
      },
      hideClass: {
        popup: 'animate__animated animate__fadeOutUp',
      },
      confirmButtonText: 'Enviar',
      inputValue: this.loginForm.get('email').value,
      inputPlaceholder: 'Ejm. pil@example.com',
      showLoaderOnConfirm: true,
      showCancelButton: true,
      cancelButtonText: 'Cancelar',
      icon: 'question',
      timer: 30000,
      width: 380,
      padding: 10,
      timerProgressBar: true,
      heightAuto: true,
      showCloseButton: true,
      preConfirm: (result) => {
        this.authSvc
          .sendEmail(result)
          .then((response) => {
            Swal.fire('ENVIADO!', 'Correo enviado.', 'success');
          })
          .catch((error) => {
            console.log(error);
            Swal.fire({
              text: 'Hubo un problema!',
              icon: 'error',
              title: 'Oops...',
              footer: 'Comunicate con soporte!!',
              showCloseButton: true
            });
            this.cargando = false;
          });
      }
    });
  }
  cerrar() {
    this.valido = !this.valido;

  }
}


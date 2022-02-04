import { Component, OnInit, Inject, ViewEncapsulation } from '@angular/core';
import {
  FormGroup,
  FormControl,
  Validators,
  NgForm,
  FormGroupDirective,
} from '@angular/forms';
import { Service } from '../../../shared/services/service';
import { ErrorStateMatcher } from '@angular/material/core';

import Swal from 'sweetalert2';
import { AuthService } from '../../../shared/services/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
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
  selector: 'app-new-usuario',
  templateUrl: './new-usuario.component.html',
  styleUrls: ['./new-usuario.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class NewUsuarioComponent implements OnInit {
  hide = true;
  fecha = new FormControl({ value: new Date(), disabled: true });
  fechaSistema = new Date();
  correo = new CorreoModel();
  calendario: boolean;
  activaControles: boolean = false;
  constructor(
    private usuarioSvc: Service,
    private authSvc: AuthService,
    private snackBar: MatSnackBar,
    public dialogRef: MatDialogRef<NewUsuarioComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  public newUsuarioForm = new FormGroup({
    email: new FormControl('', [
      Validators.required,
      Validators.email // ,
      // Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$'),
    ]),
    nombre: new FormControl('', Validators.required),
    password: new FormControl('', [
      Validators.required,
      Validators.minLength(8)
    ]),
    estado: new FormControl(true),
    rol: new FormControl('02clie2', Validators.required), // ,
    // fechaPago: new FormControl('', Validators.required),
    tipoPlan: new FormControl('01sta1', Validators.required),
    codigoR: new FormControl('')
  });

  matcher = new MyErrorStateMatcher();

  validaControl(name: string) {
    return (
      this.newUsuarioForm.get(name).invalid
    );
  }

  get validoCorreo1() {
    return (
      this.newUsuarioForm.get('email').invalid &&
      !(this.newUsuarioForm.get('email').value === '')
    );
  }
  get validoCorreo2() {
    return (
      this.newUsuarioForm.get('email').invalid &&
      this.newUsuarioForm.get('email').value === ''
    );
  }

  ngOnInit() {
    if (window.innerWidth <= 400) {
      this.calendario = true;
    } else {
      this.calendario = false;
    }
  }
  onResize(event) {
    if (event.target.innerWidth <= 400) {
      this.calendario = true;
    } else {
      this.calendario = false;
    }
  }
  addNewUsuario() {
    if (this.newUsuarioForm.valid) {
      const datosUsuario = JSON.parse(
        atob(localStorage.getItem('loginInfo'))
      );
      (document.getElementById(
        'btnGuardar'
      ) as HTMLInputElement).disabled = true;
      this.data = this.newUsuarioForm.value;
      this.data.fechaCreacion = new Date();
      this.data.usuarioCreacion = datosUsuario.nombre;
      this.data.fechaPago = this.fecha.value;
      this.data.terminoC = true;
      const fechaA = new Date(this.fecha.value);
      this.data.fechaVencimientoPago = new Date(
        fechaA.setFullYear(fechaA.getFullYear() + 1)
      );
      this.data.photoURL = '';
      this.data.nombreImagen = '';
      if (this.data.estado) {
        this.data.estado = '01canc1';
      } else {
        this.data.estado = '02pend2';
      }
      if (this.data.rol === '1.gxp12jt$l#') {
        this.data.codigoS = '823MW.$E#';
      } else {
        this.data.codigoS = '0123';
      }
      this.data.tipoPago = 'Administrativo';
      this.authSvc
        .addEmailUsu(this.data)
        .then((res) => {
          this.data.uid = res.user.uid;
          this.usuarioSvc.preAndUpdateUsuario(this.data);
          this.correo.name = 'PhoeniFx';
          this.correo.emailF = '';
          this.correo.emailT = this.data.email;
          this.correo.subject = 'Bienvenido a  PhoeniFx';
          this.correo.message = `<p>De parte de <strong>PhoeniFx</strong> es un placer darte la bienvenida <strong>${this.data.nombre}</strong> a nuestra comunidad educativa, sabemos que vas a crecer junto a nosotros. </p>
          <p>Queremos informarte que tu cuenta se ha creado con éxito y a continuación te detallamos la información de esta. </p>
          <h4>
            <strong>Usuario: ${this.data.email}</strong>
          </h4>
          <h4>
            <strong>Contraseña: ${this.data.password}</strong>
          </h4>
          <p>
            <strong>PRIMEROS PASOS A SEGUIR:</strong>
          </p>
          <p>
            <strong>PASO 1:</strong>
            <a href=' https://www.youtube.com/watch?v=kopz9Tm9nCI' target='_blank'> Ver el video de inducción a la academia (servicios, uso, sistema de trabajo)</a> </p>
          <p>
            <strong>PASO 2:</strong> Ingresar con tu usuario y contraseña en la página web <a href='https://phoenifx.com/' target='_blank'>www.phoenifx.com</a>
          </p>
          <p>
            <strong>PASO 3:</strong> Escribir al número de WhatsApp <strong>+506 86832651 </strong> (para recibir el acceso a canales de telegram).
          </p>
          <p>
            <strong>PASO 4:</strong>
            <a href='https://drive.google.com/file/d/1YVhifJCl3DHpLwnCRpmfyYQuzZHbaEy0/view?usp=sharing' target='_blank'>Descargar la guía de estudio</a>
          </p>
          <p>
            <strong>PASO 5:</strong> Para consultas de soporte técnico enviar un correo a la dirección <a href='mailto:info@phoenifx.com'>info@phoenifx.com</a>
          </p>
          <p>Vive la experiencia de crecer con nosotros, <strong>PhoeniFx</strong> ha creado un sistema de trabajo único para potenciar tu proceso de formación y resultados. </p>`;
          this.correo.fechaCreacion = new Date();
          this.correo.estado = 'pendiente';
          this.usuarioSvc.AddCorreo(this.correo);

          (document.getElementById(
            'btnGuardar'
          ) as HTMLInputElement).disabled = false;
          this.newUsuarioForm.reset();
          this.fecha.setValue(new Date());
          this.newUsuarioForm.get('rol').setValue('02clie2');
          this.newUsuarioForm.get('estado').setValue(true);
          this.snackBar.open(
            `Usuario ${this.data.nombre} creado con éxito.`,
            'Cerrar',
            {
              duration: 3000,
            }
          );
          this.dialogRef.close();
        })
        .catch((err) => {
          console.log('Error', err);
          let error = 'Comunicate con soporte!!';
          if (err.code === 'auth/email-already-in-use') {
            error = 'Este correo ya está en uso. Prueba con otro.';
          }
          Swal.fire({
            text: 'Hubo un problema!',
            icon: 'error',
            title: 'Oops...',
            footer: error,
            showCloseButton: true
          });
          (document.getElementById(
            'btnGuardar'
          ) as HTMLInputElement).disabled = false;
        });
    } else {
      this.validacion();
    }
  }
  rolSeleccionado() {
    if (this.newUsuarioForm.get('rol').value === '1.gxp12jt$l#') {
      this.activaControles = true;
    } else {
      this.activaControles = false;
    }
  }
  validacion() {
    if (this.newUsuarioForm.get('nombre').value === '') {
      (document.getElementById(
        'txtNombre'
      ) as HTMLInputElement).focus();
    } else {
      if (this.newUsuarioForm.get('email').value === '' || this.newUsuarioForm.get('email').invalid) {
        (document.getElementById(
          'txtCorreo'
        ) as HTMLInputElement).focus();
      } else {
        if (this.newUsuarioForm.get('password').value === '' || this.newUsuarioForm.get('password').invalid) {
          (document.getElementById(
            'txtPassword'
          ) as HTMLInputElement).focus();
        }
      }
    }
  }
}

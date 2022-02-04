import { Component, OnInit, Inject, ViewEncapsulation } from '@angular/core';
import {
  FormGroup,
  FormControl,
  Validators,
  FormGroupDirective,
  NgForm,
} from '@angular/forms';
import Swal from 'sweetalert2';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CorreoModel } from '../../../shared/models/correo';
import { ErrorStateMatcher } from '@angular/material/core';
import { AuthService } from '../../../shared/services/auth.service';
import { Service } from '../../../shared/services/service';

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
  selector: 'app-contact',
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ContactComponent implements OnInit {
  deshabilitarC: boolean = false;
  correo: CorreoModel;
  tipo: number;
  constructor(
    private snackBar: MatSnackBar,
    public authSvc: AuthService,
    private srvUsu: Service,
    public dialogRef: MatDialogRef<ContactComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.tipo = data.tipo;
  }

  public contactForm = new FormGroup({
    name: new FormControl('', Validators.required),
    emailF: new FormControl('', Validators.required),
    message: new FormControl('', Validators.required),
  });

  matcher = new MyErrorStateMatcher();

  ngOnInit(): void {
    if (localStorage.getItem('loginInfo')) {
      const datosUsuario = JSON.parse(
        atob(localStorage.getItem('loginInfo'))
      );
      if (datosUsuario) {
        this.srvUsu
          .getDataxFiltro('usuario', (ref) =>
            ref.where('uid', '==', datosUsuario.uid)
          )
          .subscribe((response) => {
            if (response.length > 0) {
              this.contactForm.get('name').setValue(response[0].nombre);
              this.contactForm.get('emailF').setValue(response[0].email);
              // this.contactForm.get('name').disable();
              // this.contactForm.get('emailF').disable();
              this.deshabilitarC = true;
            }
          });
      }
    }
    if (this.tipo === 1) {
      this.contactForm.get('message').setValue('N/A');
    }
  }

  validaControl(name: string) {
    return (
      this.contactForm.get(name).invalid && this.contactForm.get(name).touched
    );
  }
  get validoCorreo1() {
    return (
      this.contactForm.get('emailF').invalid &&
      !(this.contactForm.get('emailF').value === '')
    );
  }
  get validoCorreo2() {
    return (
      this.contactForm.get('emailF').invalid &&
      this.contactForm.get('emailF').value === ''
    );
  }
  sendEmail() {
    if (this.contactForm.valid) {
      try {
        // this.contactForm.get('name').disable();
        // this.contactForm.get('emailF').disable();
        // this.contactForm.get('message').disable();
        // (document.getElementById(
        //   'btnEnviar'
        // ) as HTMLInputElement).disabled = false;
        this.correo = this.contactForm.value;
        if (this.tipo === 1) {
          this.correo.emailT = this.contactForm.get('emailF').value;
          this.correo.emailF = '';
          this.correo.subject = 'Ebook Solicitado';
          this.correo.message = `<p>Hola <strong>${this.correo.name}</strong> te hemos compartido el Ebook solicitado. Ingresa al siguiente link: <a href="https://firebasestorage.googleapis.com/v0/b/phoenifxs.appspot.com/o/archivosVarios%2F5%20pasos%20para%20iniciar%20en%20el%20trading.pdf?alt=media&token=54da0483-f883-4c14-a7fb-9255717c516b" target="_blank" title="Abrir link">Cinco pasos para iniciar en el trading</a>
          </p>
          <p>Además te compartimos nuestras páginas en las distintas redes sociales:</p>
          <ul>
            <li>
              <a class="navbar-brand" href="https://www.facebook.com/phoenifx" target="_blank" title="Ir a Facebook">Facebook</a>
            </li>
            <li>
              <a class="navbar-brand" href="https://www.instagram.com/phoenifx/" target="_blank" title="Ir a Instagram">Instagram</a>
            </li>
            <li>
              <a class="navbar-brand" href="https://t.me/joinchat/TDHlEMhb-Dro8dww" target="_blank" title="Ir a Telegram">Telegram</a>
            </li>
            <li>
              <a class="navbar-brand" href="https://www.youtube.com/channel/UCYsz8Hc2WJW-IZfhXYxwKzA" target="_blank" title="Ir a YouTube">YouTube</a>
            </li>
          </ul>`;
        } else {
          this.correo.emailT = '';
          this.correo.subject = 'Solicitud de Consulta';
          this.correo.message = `<p><strong>${this.correo.name}</strong> te ha enviado el siguiente mensaje:</p>
        <p>${this.correo.message}</p>
        <p>Si quieres responder  a este mensaje solo da click al siguiente correo <a href='mailto:${this.correo.emailF}'title='Responder'>${this.correo.emailF}</a> ,sino omita el mensaje.
        </p>
`;
        }
        this.correo.fechaCreacion = new Date();
        this.correo.estado = 'pendiente';
        this.srvUsu.AddCorreo(this.correo);
        // this.contactForm.reset();
        // (document.getElementById(
        //   'btnEnviar'
        // ) as HTMLInputElement).disabled = true;
        if (this.tipo === 1) {
          Swal.fire({
            title: 'Te hemos enviado un correo electrónico con el ebook solicitado.',
            text: 'Te invitamos a unirte a nuestro canal gratuito de telegram, dando click al icono de abajo!!',
            timer: 60000,
            timerProgressBar: true,
            showClass: {
              popup: 'animate__animated animate__fadeInDown'
            },
            hideClass: {
              popup: 'animate__animated animate__fadeOutUp'
            },
            footer: '<a href="https://t.me/joinchat/TDHlEMhb-Dro8dww" target="_blank" title="Telegram"><img alt="Image" src="assets/images/telegram.jpg" class="rounded-circle" width="40" height="40" /></a>',
            confirmButtonColor: '#d33',
            confirmButtonText: 'Cerrar',
            width: '450px',
            heightAuto: true,
            showCloseButton: true
          });
        }
        this.snackBar.open(`Correo enviado con éxito.`, 'Cerrar', {
          duration: 3000,
        });
        this.dialogRef.close();
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
      if (this.contactForm.get('name').value === '') {
        (document.getElementById(
          'txtNombreC'
        ) as HTMLInputElement).focus();
      } else {
        if (this.contactForm.get('emailF').value === '' || this.contactForm.get('emailF').invalid) {
          (document.getElementById(
            'txtEmailC'
          ) as HTMLInputElement).focus();
        } else {
          if (this.contactForm.get('message').value === '') {
            (document.getElementById(
              'txtMensajeC'
            ) as HTMLInputElement).focus();
          }
        }
      }
    }
  }
}

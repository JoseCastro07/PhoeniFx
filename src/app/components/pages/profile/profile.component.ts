import { Component, OnInit, Inject, ViewEncapsulation } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';

import { Service } from '../../../shared/services/service';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialog } from '@angular/material/dialog';
import { UsuarioModel } from '../../../shared/models/usuario';
import Swal from 'sweetalert2';
import { MatSnackBar } from '@angular/material/snack-bar';

import { DomSanitizer } from '@angular/platform-browser';
import { Router } from '@angular/router';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ProfileComponent implements OnInit {
  image: File | null = null;
  currentImage: any;
  user: UsuarioModel;
  cargando: boolean = false;

  constructor(
    private usuSvc: Service,
    private snackBar: MatSnackBar,
    public dialogRef: MatDialogRef<ProfileComponent>,
    private sanitizer: DomSanitizer,
    public dialog: MatDialog,
    public router: Router,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
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
      this.router.navigate(['/login']);
      return;
    }
  }

  public profileForm = new FormGroup({
    id: new FormControl(''),
    nombre: new FormControl('', Validators.required),
    nombreImagen: new FormControl(''),
  });
  ngOnInit() {
    if (localStorage.getItem('loginInfo')) {
      const datosUsuario = JSON.parse(
        atob(localStorage.getItem('loginInfo'))
      );
      this.usuSvc
        .getDataxFiltro('usuario', (ref) =>
          ref.where('uid', '==', datosUsuario.uid)
        )
        .subscribe((response) => {
          if (response[0].rol === '02clie2' && response[0].estado === '02pend2') {
            this.snackBar.open(
              'Renueva tu membresía para seguir disfrutando de nuestros servicios!',
              'Cerrar',
              {
                duration: 5000,
                horizontalPosition: 'center',
                verticalPosition: 'bottom'
              }
            );
            this.dialogRef.close();
            this.router.navigate(['/membresia']);
            return;
          }
          this.user = response[0];
          this.initValuesForm();
        });
    }
  }

  ValidaNombre() {
    return (
      this.profileForm.get('nombre').invalid &&
      this.profileForm.get('nombre').touched
    );
  }

  onSaveUser(user: UsuarioModel): void {
    if (this.profileForm.valid) {
      try {
        this.cargando = true;
        (document.getElementById(
          'btnSalvar'
        ) as HTMLInputElement).disabled = true;
        (document.getElementById('imagen') as HTMLInputElement).disabled = true;
        this.profileForm.get('nombre').disable();
        user.email = this.user.email;
        user.photoURL = this.user.photoURL;
        user.estado = this.user.estado;
        user.rol = this.user.rol;
        user.uid = this.user.uid;
        user.fechaModificacion = new Date();
        user.usuarioModificacion = user.nombre;
        if (this.image) {
          const result = this.usuSvc.editProfileUser(
            user,
            this.image,
            this.profileForm.get('nombreImagen').value
          );
          if (result === '200') {
            (document.getElementById(
              'btnSalvar'
            ) as HTMLInputElement).disabled = false;
            (document.getElementById(
              'imagen'
            ) as HTMLInputElement).disabled = false;
            this.profileForm.get('nombre').enable();
            this.cargando = false;
            this.dialogRef.close();
          }
        } else {
          this.usuSvc.editUsuarioById(user, 1).then(() => {
            this.profileForm.get('nombre').enable();
            this.cargando = false;
            this.snackBar.open(
              `Usuario ${user.nombre} editado con éxito.`,
              'Cerrar',
              {
                duration: 3000,
              }
            );
          });
          this.dialogRef.close();
        }
      } catch (error) {
        console.log('Error', error);
        Swal.fire({
          text: 'Hubo un problema!',
          icon: 'error',
          title: 'Oops...',
          footer: 'Comunicate con soporte!!',
          showCloseButton: true
        });
        this.cargando = false;
        (document.getElementById(
          'btnSalvar'
        ) as HTMLInputElement).disabled = false;
        (document.getElementById(
          'imagen'
        ) as HTMLInputElement).disabled = false;
        this.profileForm.get('nombre').enable();
      }
    } else {
      (document.getElementById(
        'txtNombre'
      ) as HTMLInputElement).focus();
    }
  }

  private initValuesForm(): void {
    if (this.user.photoURL !== '') {
      this.currentImage = this.user.photoURL;
    } else {
      this.currentImage = 'assets/images/user.png';
    }
    this.profileForm.patchValue({
      nombre: this.user.nombre,
      id: this.user.id,
      nombreImagen: this.user.nombreImagen,
    });
  }

  handleImage(image): void {
    this.image = image;
    if (image) {
      this.currentImage = this.sanitizer.bypassSecurityTrustUrl(
        window.URL.createObjectURL(image)
      );
    }
  }
}

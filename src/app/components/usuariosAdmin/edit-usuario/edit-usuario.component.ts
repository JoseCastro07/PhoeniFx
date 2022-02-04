import { Component, OnInit, Inject, ViewEncapsulation } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Service } from '../../../shared/services/service';
import { UsuarioModel } from '../../../shared/models/usuario';

import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-edit-usuario',
  templateUrl: './edit-usuario.component.html',
  styleUrls: ['./edit-usuario.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class EditUsuarioComponent implements OnInit {
  hide = true;
  datos: any;
  usuario: UsuarioModel;
  estado: boolean;
  rol: string;
  fecha = new Date();
  activaControles: boolean;
  constructor(
    private usuSvc: Service,
    private snackBar: MatSnackBar,
    public dialogRef: MatDialogRef<EditUsuarioComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.usuario = data.user;
  }

  public editUsuarioForm = new FormGroup({
    id: new FormControl('', Validators.required),
    email: new FormControl('', [
      Validators.required,
      Validators.email,
      Validators.pattern('[a-z0-9._%+-]+@[a-z0-9.-]+.[a-z]{2,3}$'),
    ]),
    nombre: new FormControl('', Validators.required),
    // password: new FormControl('', [Validators.required, Validators.minLength(5)]),
    estado: new FormControl('', Validators.required),
    rol: new FormControl('', Validators.required),
    tipoPlan: new FormControl('', Validators.required),
    codigoR: new FormControl('')
  });

  validaControl(name: string) {
    return (
      this.editUsuarioForm.get(name).invalid
    );
  }

  ngOnInit() {
    this.editUsuarioForm.get('email').disable();
    this.initValuesUsuForm();
  }
  editUsuario() {
    if (this.editUsuarioForm.valid) {
      try {
        (document.getElementById(
          'btnEditar'
        ) as HTMLInputElement).disabled = true;
        const datosUsuario = JSON.parse(
          atob(localStorage.getItem('loginInfo'))
        );
        this.datos = this.editUsuarioForm.value;
        if (this.rol === '02clie2' && !this.estado && this.datos.estado) {
          this.datos.fechaPago = new Date();
          this.datos.fechaVencimientoPago = new Date(
            this.fecha.setFullYear(this.fecha.getFullYear() + 1)
          );
        }
        this.datos.fechaModificacion = new Date();
        this.datos.usuarioModificacion = datosUsuario.nombre;
        this.datos.email = this.usuario.email;
        this.datos.uid = this.usuario.uid;
        this.datos.photoURL = this.usuario.photoURL;
        this.datos.terminoC = true;
        if (this.datos.estado) {
          this.datos.estado = '01canc1';
        } else {
          this.datos.estado = '02pend2';
        }
        if (this.datos.rol === '1.gxp12jt$l#') {
          this.datos.codigoS = '823MW.$E#';
        } else {
          this.datos.codigoS = '0123';
        }
        this.datos.tipoPago = 'Administrativo';
        this.usuSvc.editUsuarioById(this.datos);
        (document.getElementById(
          'btnEditar'
        ) as HTMLInputElement).disabled = false;
        this.snackBar.open(
          `Usuario ${this.datos.nombre} editado con éxito.`,
          'Cerrar',
          {
            duration: 3000,
          }
        );
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
        (document.getElementById(
          'btnEditar'
        ) as HTMLInputElement).disabled = false;
      }
    } else {
      (document.getElementById(
        'txtNombre'
      ) as HTMLInputElement).focus();
    }
  }
  rolSeleccionado() {
    if (this.editUsuarioForm.get('rol').value === '1.gxp12jt$l#') {
      this.activaControles = true;
    } else {
      this.activaControles = false;
    }
  }

  private initValuesUsuForm(): void {
    this.editUsuarioForm.patchValue({
      id: this.usuario.id,
      email: this.usuario.email,
      nombre: this.usuario.nombre,
      rol: this.usuario.rol,
      tipoPlan: this.usuario.tipoPlan,
      codigoR: this.usuario.codigoR
    });
    if (this.editUsuarioForm.get('codigoR').value === undefined) {
      this.editUsuarioForm.get('codigoR').setValue('');
    }
    if (this.usuario.estado === '01canc1') {
      this.editUsuarioForm.get('estado').setValue(true);
    } else {
      this.editUsuarioForm.get('estado').setValue(false);
    }
    this.rol = this.editUsuarioForm.get('rol').value;
    if (this.rol === '1.gxp12jt$l#') {
      this.activaControles = true;
    } else {
      this.activaControles = false;
    }
    this.estado = this.editUsuarioForm.get('estado').value;
  }
}

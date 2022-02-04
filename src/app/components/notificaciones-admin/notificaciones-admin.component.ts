import { Component, OnInit, Inject } from '@angular/core';
import { Service } from '../../shared/services/service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { NotificacionModel, Styles } from '../../shared/models/notificacion';
import { FormGroup, FormArray, FormControl, Validators } from '@angular/forms';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-notificaciones-admin',
  templateUrl: './notificaciones-admin.component.html',
  styleUrls: ['./notificaciones-admin.component.scss']
})
export class NotificacionesAdminComponent implements OnInit {
  notificacion: NotificacionModel[];
  styles = new Styles().styles;
  validaT: boolean;
  validaM: boolean;
  btnNombre: string = 'Guardar';
  tipo: number = 0;
  constructor(
    private notSvc: Service,
    private snackBar: MatSnackBar,
    public dialogRef: MatDialogRef<NotificacionesAdminComponent>,
    @Inject(MAT_DIALOG_DATA) public data: NotificacionModel
  ) { }

  public notificacionForm = new FormGroup({
    id: new FormControl('', Validators.required),
    controlNotification: new FormArray([])
  });

  ngOnInit(): void {
    this.initValuesActForm();
  }

  addControlNotifications(validar: boolean) {
    if (this.notificacionForm.get('controlNotification').value.length === 0) {
      (this.notificacionForm.get('controlNotification') as FormArray).push(new FormGroup({
        id: new FormControl(Math.floor(Math.random() * 9999 + 1)),
        title: new FormControl('', Validators.required),
        message: new FormControl('', Validators.required),
        style: new FormControl(1, Validators.required),
        estado: new FormControl(true)
      }));
      this.validaT = false;
      this.validaM = false;
      return;
    }
    if (this.notificacionForm.get('controlNotification').valid) {
      (this.notificacionForm.get('controlNotification') as FormArray).push(new FormGroup({
        id: new FormControl(Math.floor(Math.random() * 9999 + 1)),
        title: new FormControl('', Validators.required),
        message: new FormControl('', Validators.required),
        style: new FormControl(1, Validators.required),
        estado: new FormControl(true)
      }));
      this.validaT = false;
      this.validaM = false;
      return;
    } else {
      if (validar) {
      this.validacion();        
      } 
    }
  }
  getControls() {
    return (this.notificacionForm.get('controlNotification') as FormArray).controls;
  }

  deleteControlNotifications(indice: number) {
    (this.notificacionForm.get('controlNotification') as FormArray).removeAt(indice);
  }


  private initValuesActForm(): void {
    this.notSvc
      .getDataxFiltro('notificacion')
      .subscribe((responseN) => {
        if (responseN.length > 0) {
          this.notificacion = responseN;
          this.tipo = 1;
          this.notificacionForm.patchValue({
            id: this.notificacion[0].id
          });
          if (this.notificacion[0].controlNotification.length > 0) {
            this.btnNombre = 'Editar';
            this.notificacion[0].controlNotification.map(a => {
              (this.notificacionForm.get('controlNotification') as FormArray).push(new FormGroup({
                title: new FormControl(a.title, Validators.required),
                message: new FormControl(a.message, Validators.required),
                style: new FormControl(a.style, Validators.required),
                estado: new FormControl(a.estado),
                id: new FormControl(a.id)
              }));
            });
          } else {
            this.borrarControlNotificaciones();
            this.addControlNotifications(false);
          }
        } else {
          this.addControlNotifications(false);
        }
      });
  }
  borrarControlNotificaciones() {
    this.notSvc.getDataxFiltro('controlUsuarioNotificacion')
      .subscribe((response) => {
        response.map(c => {
          if (response.length > 0 && this.notificacion[0].controlNotification.length === 0) {
            this.notSvc.deleteControlUsuarioNotificacionById(c);
          }
        });
      });
  }

  saveChanges() {
    if (this.notificacionForm.get('controlNotification').valid) {
      try {
        this.data = this.notificacionForm.value;
        (document.getElementById(
          'btnSalvar'
        ) as HTMLInputElement).disabled = true;
        if (this.tipo === 1) {
          const datosUsuario = JSON.parse(
            atob(localStorage.getItem('loginInfo'))
          );
          this.data.fechaModificacion = new Date();
          this.data.usuarioModificacion = datosUsuario.nombre;
          this.notSvc.editNotificacionById(this.data);
          (document.getElementById(
            'btnSalvar'
          ) as HTMLInputElement).disabled = false;
          this.snackBar.open(
            `Notificación editada con éxito.`,
            'Cerrar',
            {
              duration: 3000,
            }
          );
        } else {
          this.data.fechaCreacion = new Date();
          this.data.id = '';
          this.notSvc.preAddUpdateNotificacion(this.data);
          (document.getElementById(
            'btnSalvar'
          ) as HTMLInputElement).disabled = false;
          this.snackBar.open(
            `Notificación creada con éxito.`,
            'Cerrar',
            {
              duration: 3000,
            }
          );
        }
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
          'btnSalvar'
        ) as HTMLInputElement).disabled = false;
      }
    } else {
      this.validacion();
    }
  }
  validacion() {
    if (this.notificacionForm.get('controlNotification').valid) {
      this.validaT = false;
      this.validaM = false;
    }
    this.notificacionForm.get('controlNotification').value.map((a, index) => {
     // if (this.notificacion[0].controlNotification.length > 0) {
        if (a.title === '') {
          (document.getElementById(
            `txtTitle_${index}`
          ) as HTMLInputElement).focus();
          this.validaT = true;
        } else {
          if (a.message === '') {
            (document.getElementById(
              `txtMessage_${index}`
            ) as HTMLInputElement).focus();
            this.validaM = true;
          }
    //    }
      }
    });
  }
}

import { Component, OnInit, Inject } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Service } from '../../../shared/services/service';
import { EtapaModel, Secciones } from '../../../shared/models/etapa';

import Swal from 'sweetalert2';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { NullVisitor } from '@angular/compiler/src/render3/r3_ast';

@Component({
  selector: 'app-edit-etapa',
  templateUrl: './edit-etapa.component.html',
  styleUrls: ['./edit-etapa.component.scss'],
})
export class EditEtapaComponent implements OnInit {
  fechaSistema = new Date();
  etapa: EtapaModel;
  datos: EtapaModel;
  secciones = new Secciones().secciones;

  constructor(
    private etapaSvc: Service,
    private snackBar: MatSnackBar,
    public dialogRef: MatDialogRef<EditEtapaComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.etapa = data.etp;
  }

  public editEtapaForm = new FormGroup({
    id: new FormControl('', Validators.required),
    descripcion: new FormControl('', Validators.required),
    codigoSeccion: new FormControl('', Validators.required),
    nombreEtapa: new FormControl(''),
    estado: new FormControl(''),
  });

  get validaDescripcion() {
    return (
      this.editEtapaForm.get('descripcion').invalid 
    );
  }

  ngOnInit(): void {
    this.editEtapaForm.get('codigoSeccion').disable();
    this.editEtapaForm.get('nombreEtapa').disable();
    this.initValuesEtaForm();
  }
  editEtapa() {
    if (this.editEtapaForm.valid) {
      try {
        (document.getElementById(
          'btnEditar'
        ) as HTMLInputElement).disabled = true;
        const datosUsuario = JSON.parse(
          atob(localStorage.getItem('loginInfo'))
        );
        this.datos = this.editEtapaForm.value;
        this.datos.fechaModificacion = new Date();
        this.datos.usuarioModificacion = datosUsuario.nombre;
        this.etapaSvc.editEtapaById(this.datos);
        if (this.datos.estado !== this.etapa.estado) {
          this.etapaSvc
            .getDataxFiltro('video', (ref) =>
              ref
                .where('codigoSeccion', '==', this.etapa.codigoSeccion)
                .where('idEtapa', '==', this.etapa.idEtapa)
                .orderBy('posicionVideo')
            )
            .subscribe((response) => {
              if (this.etapaSvc !== null) {
                if (this.datos.estado) {
                  response.map(v => {
                    v.estado = true;
                    this.etapaSvc.editVideoById(v, 1);
                  });
                } else {
                  response.map(v => {
                    v.estado = false;
                    this.etapaSvc.editVideoById(v, 1);
                  });
                }
              }
              this.etapaSvc = null;
            });
        }
        (document.getElementById(
          'btnEditar'
        ) as HTMLInputElement).disabled = false;
        this.snackBar.open(
          `Etapa ${this.datos.descripcion} editada con éxito.`,
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
        'txtDescripcion'
      ) as HTMLInputElement).focus();
    }
  }

  private initValuesEtaForm(): void {
    this.editEtapaForm.patchValue({
      id: this.etapa.id,
      descripcion: this.etapa.descripcion,
      codigoSeccion: this.etapa.codigoSeccion,
      nombreEtapa: this.etapa.nombreEtapa,
      estado: this.etapa.estado
    });
  }
}

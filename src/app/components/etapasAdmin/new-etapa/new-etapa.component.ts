import { Component, OnInit, Inject, ViewEncapsulation } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Service } from '../../../shared/services/service';
import { EtapaModel, Secciones } from '../../../shared/models/etapa';

import Swal from 'sweetalert2';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
@Component({
  selector: 'app-new-etapa',
  templateUrl: './new-etapa.component.html',
  styleUrls: ['./new-etapa.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class NewEtapaComponent implements OnInit {
  fechaSistema = new Date();
  idEtapa: number;
  secciones = new Secciones().secciones;

  constructor(
    private etapaSvc: Service,
    public dialogRef: MatDialogRef<NewEtapaComponent>,
    @Inject(MAT_DIALOG_DATA) public data: EtapaModel,
    private snackBar: MatSnackBar
  ) { }

  public newEtapaForm = new FormGroup({
    descripcion: new FormControl('', Validators.required),
    codigoSeccion: new FormControl(1, Validators.required),
    nombreEtapa: new FormControl(''),
    estado: new FormControl(true),
  });

  get validaDescripcion() {
    return (
      this.newEtapaForm.get('descripcion').invalid
    );
  }

  ngOnInit(): void {
    this.etapaSvc
      .getDataxFiltro('etapa', (ref) => ref.where('codigoSeccion', '==', 1))
      .subscribe((response) => {
        this.newEtapaForm
          .get('nombreEtapa')
          .setValue(`etapa${response.length + 1}`);
        this.newEtapaForm.get('nombreEtapa').disable();
        this.idEtapa = response.length + 1;
      });
  }
  onChangeS() {
    this.etapaSvc
      .getDataxFiltro('etapa', (ref) =>
        ref.where(
          'codigoSeccion',
          '==',
          this.newEtapaForm.get('codigoSeccion').value
        )
      )
      .subscribe((responseE) => {
        this.newEtapaForm
          .get('nombreEtapa')
          .setValue(`etapa${responseE.length + 1}`);
        this.idEtapa = responseE.length + 1;
      });
  }

  addNewEtapa() {
    if (this.newEtapaForm.valid) {
      try {
        (document.getElementById('btnGuardar') as HTMLInputElement).disabled = true;
        this.data = this.newEtapaForm.value;
        this.secciones
          .filter(a => a.id === this.data.codigoSeccion)
          .map(data => {
            this.data.nombreSeccion = data.descripcion;
          });
        this.data.nombreEtapa = this.newEtapaForm.get('nombreEtapa').value;
        this.data.idEtapa = this.idEtapa;
        this.data.fechaCreacion = new Date();
        this.etapaSvc.preAddUpdateEtapa(this.data);
        (document.getElementById('btnGuardar') as HTMLInputElement).disabled = false;
        this.newEtapaForm.reset();
        this.newEtapaForm.get('codigoSeccion').setValue(1);
        this.newEtapaForm.get('estado').setValue(true);
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
}

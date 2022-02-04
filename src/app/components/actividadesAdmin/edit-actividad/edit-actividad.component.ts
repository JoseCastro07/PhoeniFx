import { Component, OnInit, Inject, ViewEncapsulation } from '@angular/core';
import { FormGroup, FormControl, Validators, FormArray } from '@angular/forms';
import Swal from 'sweetalert2';
import { Service } from '../../../shared/services/service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ActividadModel } from '../../../shared/models/actividad';
import { DatePipe } from '@angular/common';
@Component({
  selector: 'app-edit-actividad',
  templateUrl: './edit-actividad.component.html',
  styleUrls: ['./edit-actividad.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class EditActividadComponent implements OnInit {
  progress = 0;
  estado: boolean = false;
  actividad: ActividadModel;
  actividadA: ActividadModel[] = [];
  fechaA = new Date();
  nombreT = 'Editar Actividad';
  nombreB = 'Cancelar';
  validaH: boolean;
  validaU: boolean;
  validaC: boolean;
  validaHF: boolean;
  validaMF: boolean;
  calendario: boolean;
  constructor(
    private actSvc: Service,
    private snackBar: MatSnackBar,
    private datePipe: DatePipe,
    public dialogRef: MatDialogRef<EditActividadComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.actividad = data.acti;
  }

  public editActividadForm = new FormGroup({
    id: new FormControl('', Validators.required),
    nombre: new FormControl('', Validators.required),
    descripcion: new FormControl('', Validators.required),
    estado: new FormControl(true),
    controlUrls: new FormArray([])
  });

  range = new FormGroup({
    start: new FormControl('', Validators.required),
    end: new FormControl('', Validators.required)
  });

  ngOnInit(): void {
    this.actSvc
      .getDataxFiltro('actividad', (ref) =>
        ref.where('fechaActividad', '>=', new Date(this.datePipe.transform(this.fechaA, 'yyyy/MM/dd')))
          .orderBy('fechaActividad').orderBy('fechaCreacion'))
      .subscribe((actividad) => {
        if (actividad.length > 0) {
          this.actividadA = actividad;
        }
      });
    this.initValuesActForm();
    if (this.actividad.tipo === 2) {
      this.editActividadForm.get('nombre').disable();
      this.editActividadForm.get('descripcion').disable();
      this.editActividadForm.get('estado').disable();
      this.editActividadForm.get('controlUrls').disable();
      this.nombreT = 'Ver Actividad';
      this.nombreB = 'Cerrar';
    }
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


  addControlUrls() {
    if (this.editActividadForm.get('controlUrls').value.length === 0) {
      (this.editActividadForm.get('controlUrls') as FormArray).push(new FormGroup({
        id: new FormControl(Math.floor(Math.random() * 9999 + 1)),
        hora: new FormControl('', Validators.required),
        horaD: new FormControl('0', [Validators.required, Validators.min(0), Validators.max(23)]),
        minutoD: new FormControl('0', [Validators.required, Validators.min(0), Validators.max(60)]),
        url: new FormControl('', Validators.required),
        descripcion: new FormControl('', [Validators.required, Validators.maxLength(50)])
      }));
      this.validaH = false;
      this.validaU = false;
      this.validaC = false;
      this.validaHF = false;
      this.validaMF = false;
      return;
    }
    if (this.editActividadForm.valid && this.range.valid) {
      (this.editActividadForm.get('controlUrls') as FormArray).push(new FormGroup({
        id: new FormControl(Math.floor(Math.random() * 9999 + 1)),
        hora: new FormControl('', Validators.required),
        horaD: new FormControl('0', [Validators.required, Validators.min(0), Validators.max(23)]),
        minutoD: new FormControl('0', [Validators.required, Validators.min(0), Validators.max(60)]),
        url: new FormControl('', Validators.required),
        descripcion: new FormControl('', [Validators.required, Validators.maxLength(50)])
      }));
      this.validaH = false;
      this.validaU = false;
      this.validaC = false;
      this.validaHF = false;
      this.validaMF = false;
      return;
    } else {
      this.validacion();
    }
  }
  getControls() {
    return (this.editActividadForm.get('controlUrls') as FormArray).controls;
  }

  deleteControlUrls(indice: number) {
    (this.editActividadForm.get('controlUrls') as FormArray).removeAt(indice);
  }

  validaControl(name: string) {
    return (
      this.editActividadForm.get(name).invalid
    );
  }
  validaFecha(name: string) {
    return (
      this.range.get(name).invalid &&
      this.range.get(name).touched
    );
  }


  editActividad() {
    let fechaS = new Date(this.datePipe.transform(this.range.get('start').value, 'yyyy/MM/dd'));
    if ((new Date(this.datePipe.transform(this.actividad.fechaActividad, 'yyyy/MM/dd'))).toString() !== fechaS.toString() ) {
      this.snackBar.open(
        `La Fecha Inicio de la Actividad debe ser la misma escogida para editar`,
        'Cerrar',
        {
          duration: 5000,
        }
      );
      return;
    }
    if (this.editActividadForm.valid && this.range.valid) {
      try {
        this.data = this.editActividadForm.value;
        this.validarH();
        if (this.validaH) {
          return;
        }
        (document.getElementById(
          'btnEditar'
        ) as HTMLInputElement).disabled = true;
        while (fechaS.getTime() <= this.range.get('end').value.getTime()) {
          let cont = 0;
          //  this.data.fechaActividad = new Date(this.datePipe.transform(fechaS, 'yyyy/MM/dd'));
          this.data.fechaActividad = new Date(fechaS.getFullYear(), fechaS.getMonth(), fechaS.getDate(), 0, 0, 0);
          this.actividadA.map(a => {
            if (this.datePipe.transform(a.fechaActividad, 'yyyy/MM/dd') ===
              this.datePipe.transform(this.data.fechaActividad, 'yyyy/MM/dd')) {
              this.data.id = a.id;
              cont = 1;
            }
          });
          if (cont === 1) {
            if (this.data.controlUrls.length > 0) {
              this.data.controlUrls.sort((h, b) =>
                (new Date(new Date().setHours(Number(h.hora.split(':')[0]), Number(h.hora.split(':')[1]), 0)).getTime()) -
                (new Date(new Date().setHours(Number(b.hora.split(':')[0]), Number(b.hora.split(':')[1]), 0)).getTime()));
            }
            const datosUsuario = JSON.parse(
              atob(localStorage.getItem('loginInfo'))
            );
            this.data.fechaModificacion = new Date();
            this.data.usuarioModificacion = datosUsuario.nombre;
            this.actSvc.editActividadById(this.data);
          } else {
            this.data.tipo = 1;
            this.data.fechaCreacion = new Date();
            this.data.id = '';
            this.actSvc.preAddUpdateActividad(this.data);
          }
          fechaS.setDate(fechaS.getDate() + 1);
        }
        (document.getElementById(
          'btnEditar'
        ) as HTMLInputElement).disabled = false;
        this.snackBar.open(
          `Actividad ${this.data.nombre} editada con éxito.`,
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
      this.validacion();
    }
  }

  private initValuesActForm(): void {
    this.editActividadForm.patchValue({
      id: this.actividad.id,
      nombre: this.actividad.nombre,
      descripcion: this.actividad.descripcion,
      estado: this.actividad.estado,

    });
    this.range.patchValue({
      start: this.actividad.fechaActividad,
      end: this.actividad.fechaActividad
    });
    if (this.actividad.controlUrls.length > 0) {
      this.actividad.controlUrls.map(a => {
        (this.editActividadForm.get('controlUrls') as FormArray).push(new FormGroup({
          id: new FormControl(a.id),
          hora: new FormControl(a.hora, Validators.required),
          horaD: new FormControl(a.horaD, [Validators.required, Validators.min(0), Validators.max(23)]),
          minutoD: new FormControl(a.minutoD, [Validators.required, Validators.min(0), Validators.max(60)]),
          url: new FormControl(a.url, Validators.required),
          descripcion: new FormControl(a.descripcion, Validators.required)
        }));
      });
    }
    // const arrayC = this.actividad.descripcionHora.split('|');
    // if (this.actividad.descripcionHora !== '') {
    //   arrayC.map(a => {
    //       (this.editActividadForm.get('controlUrls') as FormArray).push(new FormGroup({
    //         hora: new FormControl(`${a.split('~')[1].substring(0, 5)}`, Validators.required),
    //         url: new FormControl(`${a.split('~')[1].substring(6, a.split('~')[1].length)}`, Validators.required),
    //         descripcionHora: new FormControl(`${a.split('~')[2]}`, Validators.required)
    //       }));
    //   });
    // }
  }

  validarH() {
    this.validaH = false;
    this.editActividadForm.get('controlUrls').value.map((c, index) => {
      const minutos = '00';
      let hora = c.hora.split(':')[0];
      if (hora.length === 1) {
        hora = `0${hora}`;
        this.editActividadForm.get('controlUrls').value[index].hora = `${hora}:${c.hora.split(':')[1]}`;
      }
      if (c.hora.split(':')[1].length === 1) {
        this.editActividadForm.get('controlUrls').value[index].hora = `${hora}:0${c.hora.split(':')[1]}`;
      }
      if (c.hora.includes('AM') || c.hora.includes('am')) {
        if (hora === '12') {
          hora = '00';
        }
        this.editActividadForm.get('controlUrls').value[index].hora = `${hora}:${minutos}`;
      } else {
        if (c.hora.includes('PM') || c.hora.includes('pm')) {
          if (c.hora.split(':')[0] >= 0 && c.hora.split(':')[0] < 12) {
            hora = Number.parseInt(hora) + 12;
          }
          this.editActividadForm.get('controlUrls').value[index].hora = `${hora}:${minutos}`;
        }
      }

      if (this.datePipe.transform(this.range.get('start').value, 'yyyy/MM/dd') ===
        this.datePipe.transform(this.fechaA, 'yyyy/MM/dd') && this.editActividadForm.get('estado').value) {
        if (Number(hora) < this.fechaA.getHours() || (Number(hora) === new Date().getHours() && Number(c.hora.split(':')[1]) < new Date().getMinutes())) {
          this.snackBar.open(
            `La hora agregada es menor a la hora de la fecha actual.`,
            'Cerrar',
            {
              duration: 5000,
            }
          );
          (document.getElementById(
            `tmHora_${index}`
          ) as HTMLInputElement).focus();
          this.validaH = true;
        }
      }
    });
  }
  validacion() {
    if (this.editActividadForm.get('controlUrls').valid) {
      this.validaH = false;
      this.validaU = false;
      this.validaC = false;
      this.validaHF = false;
      this.validaMF = false;
    }
    if (this.editActividadForm.get('nombre').value === '') {
      (document.getElementById(
        'txtNombre'
      ) as HTMLInputElement).focus();
    } else {
      if (this.editActividadForm.get('descripcion').value === '') {
        (document.getElementById(
          'txtDescripcion'
        ) as HTMLInputElement).focus();
      } else {
        this.editActividadForm.get('controlUrls').value.map((a, index) => {
          if (a.url === '') {
            (document.getElementById(
              `txtUrl_${index}`
            ) as HTMLInputElement).focus();
            this.validaU = true;
          } else {
            if (a.descripcion === '') {
              (document.getElementById(
                `txtDescripcion_${index}`
              ) as HTMLInputElement).focus();
              this.validaC = true;
            } else {
              if (a.hora === '') {
                (document.getElementById(
                  `tmHora_${index}`
                ) as HTMLInputElement).focus();
                this.validaH = true;
              } else {
                if (a.horaD === null || a.horaD > 23 || a.horaD < 0) {
                  (document.getElementById(
                    `nbHoraD_${index}`
                  ) as HTMLInputElement).focus();
                  this.validaHF = true;
                } else {
                  if (a.minutoD === null || a.minutoD > 60 || a.minutoD < 0) {
                    (document.getElementById(
                      `nbMinutoD_${index}`
                    ) as HTMLInputElement).focus();
                    this.validaMF = true;
                  }
                }
              }
            }
          }
        });
      }
    }
  }
}


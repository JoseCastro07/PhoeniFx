import { Component, OnInit, Inject, ViewEncapsulation } from '@angular/core';
import { FormGroup, FormControl, Validators, FormArray } from '@angular/forms';
import { ActividadModel } from '../../../shared/models/actividad';
import Swal from 'sweetalert2';
import { Service } from '../../../shared/services/service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-new-actividad',
  templateUrl: './new-actividad.component.html',
  styleUrls: ['./new-actividad.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class NewActividadComponent implements OnInit {
  fileImagen: File | null = null;
  progress = 0;
  estado: boolean = false;
  validaImagen = false;
  fechaA = new Date();
  actividad: ActividadModel[] = [];
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
    public dialogRef: MatDialogRef<NewActividadComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ActividadModel
  ) { }

  public newActividadForm = new FormGroup({
    nombre: new FormControl('', Validators.required),
    descripcion: new FormControl('', Validators.required),
    estado: new FormControl(true),
    controlUrls: new FormArray([])
  });

  range = new FormGroup({
    start: new FormControl(this.fechaA, Validators.required),
    end: new FormControl(this.fechaA, Validators.required)
  });

  ngOnInit(): void {
    this.actSvc
      .getDataxFiltro('actividad', (ref) =>
        ref.where('fechaActividad', '>=', new Date(this.datePipe.transform(this.fechaA, 'yyyy/MM/dd')))
          .orderBy('fechaActividad').orderBy('fechaCreacion'))
      .subscribe((actividad) => {
        if (actividad.length > 0) {
          this.actividad = actividad;
        }
      });
    if (window.innerWidth <= 400) {
      this.calendario = true;
    } else {
      this.calendario = false;
    }
    this.addControlUrls();
  }

  onResize(event) {
    if (event.target.innerWidth <= 400) {
      this.calendario = true;
    } else {
      this.calendario = false;
    }
  }

  addControlUrls() {
    if (this.newActividadForm.get('controlUrls').value.length === 0) {
      (this.newActividadForm.get('controlUrls') as FormArray).push(new FormGroup({
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
    if (this.newActividadForm.valid && this.range.valid) {
      (this.newActividadForm.get('controlUrls') as FormArray).push(new FormGroup({
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
    return (this.newActividadForm.get('controlUrls') as FormArray).controls;
  }

  deleteControlUrls(indice: number) {
    (this.newActividadForm.get('controlUrls') as FormArray).removeAt(indice);
  }

  validaControl(name: string) {
    return (
      this.newActividadForm.get(name).invalid
    );
  }
  validaFecha(name: string) {
    return (
      this.range.get(name).invalid &&
      this.range.get(name).touched
    );
  }

  newActividad() {
    if (this.newActividadForm.valid && this.range.valid) {
      try {
        this.data = this.newActividadForm.value;
        this.validarH();
        if (this.validaH) {
          return;
        }
        (document.getElementById(
          'btnGuardar'
        ) as HTMLInputElement).disabled = true;
        this.data.tipo = 1;
        this.data.fechaCreacion = new Date();

        let fechaS = new Date(this.datePipe.transform(this.range.get('start').value, 'yyyy/MM/dd'));
        let contN = 0;
        while (fechaS.getTime() <= this.range.get('end').value.getTime()) {
          let cont = 0;
          //  this.data.fechaActividad = new Date(this.datePipe.transform(fechaS, 'yyyy/MM/dd'));
          this.data.fechaActividad = new Date(fechaS.getFullYear(), fechaS.getMonth(), fechaS.getDate(), 0, 0, 0);
          console.log(this.data.fechaActividad);
          this.actividad.map(a => {
            if (this.datePipe.transform(a.fechaActividad, 'yyyy/MM/dd') ===
              this.datePipe.transform(this.data.fechaActividad, 'yyyy/MM/dd')) {
              cont = 1;
            }
          });
          if (cont === 0) {
            if (this.data.controlUrls.length > 0) {
              this.data.controlUrls.sort((h, b) =>
                (new Date(new Date().setHours(Number(h.hora.split(':')[0]), Number(h.hora.split(':')[1]), 0)).getTime()) -
                (new Date(new Date().setHours(Number(b.hora.split(':')[0]), Number(b.hora.split(':')[1]), 0)).getTime()));
            }
            contN = 1;
            this.actSvc.preAddUpdateActividad(this.data);
          }
          fechaS.setDate(fechaS.getDate() + 1);
        }
        if (contN === 1) {
          (document.getElementById(
            'btnGuardar'
          ) as HTMLInputElement).disabled = false;
          this.snackBar.open(
            `Actividad ${this.data.nombre} creada con éxito.`,
            'Cerrar',
            {
              duration: 3000,
            }
          );
          this.dialogRef.close();
        } else {
          (document.getElementById(
            'btnGuardar'
          ) as HTMLInputElement).disabled = false;
          this.snackBar.open(
            `No se puede agregar la actividad porque el rango de fechas escogido ya existe`,
            'Cerrar',
            {
              duration: 5000,
            }
          );
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
        (document.getElementById(
          'btnGuardar'
        ) as HTMLInputElement).disabled = false;
      }
    } else {
      this.validacion();
    }
  }
  validarH() {
    this.validaH = false;
    this.newActividadForm.get('controlUrls').value.map((c, index) => {
      const minutos = '00';
      let hora = c.hora.split(':')[0];
      if (hora.length === 1) {
        hora = `0${hora}`;
        this.newActividadForm.get('controlUrls').value[index].hora = `${hora}:${c.hora.split(':')[1]}`;
      }
      if (c.hora.split(':')[1].length === 1) {
        this.newActividadForm.get('controlUrls').value[index].hora = `${hora}:0${c.hora.split(':')[1]}`;
      }
      if (c.hora.includes('AM') || c.hora.includes('am')) {
        if (hora === '12') {
          hora = '00';
        }
        this.newActividadForm.get('controlUrls').value[index].hora = `${hora}:${minutos}`;
      } else {
        if (c.hora.includes('PM') || c.hora.includes('pm')) {
          if (c.hora.split(':')[0] >= 0 && c.hora.split(':')[0] < 12) {
            hora = Number.parseInt(hora) + 12;
          }
          this.newActividadForm.get('controlUrls').value[index].hora = `${hora}:${minutos}`;
        }
      }

      if (this.datePipe.transform(this.range.get('start').value, 'yyyy/MM/dd') ===
        this.datePipe.transform(this.fechaA, 'yyyy/MM/dd')) {
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
    if (this.newActividadForm.get('controlUrls').valid) {
      this.validaH = false;
      this.validaU = false;
      this.validaC = false;
      this.validaHF = false;
      this.validaMF = false;
    }
    if (this.newActividadForm.get('nombre').value === '') {
      (document.getElementById(
        'txtNombre'
      ) as HTMLInputElement).focus();

    } else {
      if (this.newActividadForm.get('descripcion').value === '') {
        (document.getElementById(
          'txtDescripcion'
        ) as HTMLInputElement).focus();

      } else {
        if (this.range.invalid) {
          (document.getElementById(
            'rango'
          ) as HTMLInputElement).focus();
        } else {
          this.newActividadForm.get('controlUrls').value.map((a, index) => {
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
}

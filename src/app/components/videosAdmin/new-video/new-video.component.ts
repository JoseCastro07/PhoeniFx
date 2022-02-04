import { Component, OnInit, Inject } from '@angular/core';
import { FormGroup, FormControl, Validators, FormArray } from '@angular/forms';
import { Service } from '../../../shared/services/service';
import { VideoModel } from '../../../shared/models/video';

import Swal from 'sweetalert2';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Secciones, EtapaModel } from '../../../shared/models/etapa';
import * as firebase from 'firebase/app';
import { Router } from '@angular/router';

@Component({
  selector: 'app-new-videos',
  templateUrl: './new-video.component.html',
  styleUrls: ['./new-video.component.scss'],
})
export class NewVideoComponent implements OnInit {
  fechaSistema = new Date();
  videos: VideoModel[] = [];
  etapas: EtapaModel[] = [];
  secciones = new Secciones().secciones;
  fileVideo: File | null = null;
  fileAdjunto: File | null = null;
  progressV = 0;
  progressA = 0;
  estado: boolean = false;
  filePathV: string;
  filePathA: string;
  validaN: boolean;
  validaU: boolean;

  constructor(
    private videoSvc: Service,
    private snackBar: MatSnackBar,
    private router: Router,
    public dialogRef: MatDialogRef<NewVideoComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  public newVideoForm = new FormGroup({
    nombre: new FormControl('', Validators.required),
    descripcion: new FormControl('', Validators.required),
    codigoSeccion: new FormControl(1, Validators.required),
    idEtapa: new FormControl(1, Validators.required),
    estado: new FormControl(true),
    posicionVideo: new FormControl(),
    controlLink: new FormArray([])
  });

  validaControl(name: string) {
    return (
      this.newVideoForm.get(name).invalid
    );
  }

  ngOnInit(): void {
    this.videoSvc
      .getDataxFiltro('etapa', (ref) =>
        ref
          .where('estado', '==', true)
          .where('codigoSeccion', '==', 1)
          .orderBy('idEtapa')
      )
      .subscribe((responseE) => {
        this.etapas = responseE;
      });
    this.videoSvc
      .getDataxFiltro('video', (ref) =>
        ref
          .where('codigoSeccion', '==', 1)
          .where('idEtapa', '==', 1)
          .orderBy('posicionVideo')
      )
      .subscribe((responseV) => {
        this.videos = responseV;
      });
    this.onChanges();
  }
  onChanges(): void {
    this.newVideoForm.get('codigoSeccion').valueChanges.subscribe((val) => {
      this.videoSvc
        .getDataxFiltro('etapa', (ref) =>
          ref.where('codigoSeccion', '==', val).orderBy('idEtapa')
        )
        .subscribe((response) => {
          this.etapas = response;
        });
      this.newVideoForm.get('idEtapa').setValue(1);
      this.videoSvc
        .getDataxFiltro('video', (ref) =>
          ref
            .where('codigoSeccion', '==', val)
            .where('idEtapa', '==', 1)
            .orderBy('posicionVideo')
        )
        .subscribe((responseVi) => {
          this.videos = responseVi;
        });
      this.newVideoForm.get('posicionVideo').setValue(null);
    });
    this.newVideoForm.get('idEtapa').valueChanges.subscribe((val) => {
      this.videoSvc
        .getDataxFiltro('video', (ref) =>
          ref
            .where(
              'codigoSeccion',
              '==',
              this.newVideoForm.get('codigoSeccion').value
            )
            .where('idEtapa', '==', val)
            .orderBy('posicionVideo')
        )
        .subscribe((responseVd) => {
          this.videos = responseVd;
        });
      this.newVideoForm.get('posicionVideo').setValue(null);
    });
  }
  onChangeFileVideo(file): void {
    this.fileVideo = file;
  }

  onChangeFileArchivo(file): void {
    this.fileAdjunto = file;
  }

  addControlLinks() {
    if (this.newVideoForm.get('controlLink').value.length === 0) {
      (this.newVideoForm.get('controlLink') as FormArray).push(new FormGroup({
        id: new FormControl(Math.floor(Math.random() * 9999 + 1)),
        nombre: new FormControl('', Validators.required),
        url: new FormControl('', Validators.required)
      }));
      this.validaN = false;
      this.validaU = false;
      return;
    }
    if (this.newVideoForm.valid) {
      (this.newVideoForm.get('controlLink') as FormArray).push(new FormGroup({
        id: new FormControl(Math.floor(Math.random() * 9999 + 1)),
        nombre: new FormControl('', Validators.required),
        url: new FormControl('', Validators.required)
      }));
      this.validaN = false;
      this.validaU = false;
      return;
    } else {
      this.validacion();
    }
  }

  getControls() {
    return (this.newVideoForm.get('controlLink') as FormArray).controls;
  }

  deleteControlLinks(indice: number) {
    (this.newVideoForm.get('controlLink') as FormArray).removeAt(indice);
  }


  newVideo() {
    if (this.newVideoForm.valid) {
      try {
        this.data = this.newVideoForm.value;
        this.control(true);
        this.data.fechaCreacion = new Date();
        this.data.nombreVideo = '';
        this.data.fileVideo = '';
        this.data.nombreAdjunto = '';
        this.data.fileAdjunto = '';
        this.secciones
          .filter((a) => a.id === this.data.codigoSeccion)
          .map((data) => {
            this.data.nombreSeccion = data.descripcion;
          });
        this.etapas
          .filter(
            (a) =>
              a.codigoSeccion === this.data.codigoSeccion &&
              a.idEtapa === this.data.idEtapa
          )
          .map((data) => {
            this.data.nombreEtapa = data.nombreEtapa;
          });
        if (this.data.posicionVideo === null) {
          this.data.posicionVideo = this.videos.length + 1;
        } else {
          this.videos
            .filter(
              (a) =>
                a.codigoSeccion === this.data.codigoSeccion &&
                a.idEtapa === this.data.idEtapa &&
                a.posicionVideo >= this.data.posicionVideo
            )
            .map((data) => {
              data.posicionVideo += 1;
              this.videoSvc.editVideoById(data);
            });
        }
        if (this.fileVideo && this.fileAdjunto) {
          if (this.fileVideo.name.includes('~') || this.fileAdjunto.name.includes('~')) {
            Swal.fire({
              text: 'El nombre del video o archivo adjunto no puede contener el caracter ~',
              icon: 'info',
              title: 'Oops...',
              showCloseButton: true
            });
            this.control(false);
            return;
          }
          if (this.fileVideo.size > this.fileAdjunto.size) {
            this.uploadVideo(1);
            this.uploadAdjunto();
          } else {
            if (this.fileVideo.size < this.fileAdjunto.size) {
              this.uploadAdjunto(1);
              this.uploadVideo();
            }
            else {
              this.uploadVideo(3);
            }
          }
        } else {
          if (this.fileVideo) {
            if (this.fileVideo.name.includes('~')) {
              Swal.fire({
                text: 'El nombre del video no puede contener el caracter ~',
                icon: 'info',
                title: 'Oops...',
                showCloseButton: true
              });
              this.control(false);
              return;
            }
            this.uploadVideo(2);
          }
          if (this.fileAdjunto) {
            if (this.fileAdjunto.name.includes('~')) {
              Swal.fire({
                text: 'El nombre del archivo adjunto no puede contener el caracter ~',
                icon: 'info',
                title: 'Oops...',
                showCloseButton: true
              });
              this.control(false);
              return;
            }
            this.uploadAdjunto(2);
          }
        }
        if (this.fileVideo === null && this.fileAdjunto === null) {
          this.videoSvc.preAddUpdateVideo(this.data);
          this.control(false);
          this.snackBar.open(
            `Dato ${this.data.nombre} agregado con éxito.`,
            'Cerrar',
            {
              duration: 3000,
            }
          );
          this.dialogRef.close();
        }
      } catch (error) {
        console.log('Error', error);
        if (this.etapas.length === 0) {
          Swal.fire({
            text: `Primero asegurate de crear una etapa para la seccion: ${this.data.nombreSeccion}`,
            icon: 'error',
            title: 'Oops...',
            showCloseButton: true
          });
          this.router.navigate(['/adminmaintenancemodulePF/etapas']);
        } else {
          Swal.fire({
            text: 'Hubo un problema!',
            icon: 'error',
            title: 'Oops...',
            footer: 'Comunicate con soporte!!',
            showCloseButton: true
          });
          this.control(false);
        }
      }
    } else {
      this.validacion();
    }
  }
  public async cancelarTask() {
    this.estado = true;
    if (this.progressA === 100) {
      firebase.storage().ref(this.filePathA).delete();
    }
    if (this.progressV === 100) {
      firebase.storage().ref(this.filePathV).delete();
    }
  }

  private async uploadVideo(tipo?: number) {
    const random = Math.floor(Math.random() * 9999 + 1);
    this.filePathV = `${this.data.nombreSeccion}/${this.data.nombreEtapa}/${random}~${this.fileVideo.name}`;
    const storageRef = firebase.storage().ref();
    const uploadTask = storageRef.child(this.filePathV).put(this.fileVideo);
    uploadTask.on(
      'state_changed',
      (snapshot) => {
        this.progressV =
          Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
        console.log('Upload is ' + this.progressV + '% done');
        switch (snapshot.state) {
          case firebase.storage.TaskState.PAUSED: // or 'paused'
            console.log('Upload is paused');
            break;
          case firebase.storage.TaskState.RUNNING: // or 'running'
            console.log('Upload is running');
            if (this.estado) {
              uploadTask.cancel();
            }
            break;
        }
      },
      (err) => {
        console.log(err);
        if (!this.estado) {
          Swal.fire({
            text: 'Hubo un problema!',
            icon: 'error',
            title: 'Oops...',
            footer: 'Comunicate con soporte!!',
            showCloseButton: true
          });
        }
      },
      () => {
        uploadTask.snapshot.ref.getDownloadURL().then((downloadURL) => {
          this.data.fileVideo = downloadURL;
          this.data.nombreVideo = `${random}~${this.fileVideo.name}`;
          if (tipo === 1) {
            this.guardarVideo();
            return;
          }
          if (tipo === 2) {
            this.guardarVideo();
            return;
          }
        });
      }
    );
  }

  private async uploadAdjunto(tipo?: number) {
    const random = Math.floor(Math.random() * 9999 + 1);
    this.filePathA = `${this.data.nombreSeccion}/${this.data.nombreEtapa}/${random}~${this.fileAdjunto.name}`;
    const storageRef = firebase.storage().ref();
    const uploadTask = storageRef.child(this.filePathA).put(this.fileAdjunto);
    uploadTask.on(
      'state_changed',
      (snapshot) => {
        this.progressA =
          Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
        console.log('Upload is ' + this.progressA + '% done');
        switch (snapshot.state) {
          case firebase.storage.TaskState.PAUSED: // or 'paused'
            console.log('Upload is paused');
            break;
          case firebase.storage.TaskState.RUNNING: // or 'running'
            console.log('Upload is running');
            if (this.estado) {
              uploadTask.cancel();
            }
            break;
        }
      },
      (err) => {
        console.log(err);
        if (!this.estado) {
          Swal.fire({
            text: 'Hubo un problema!',
            icon: 'error',
            title: 'Oops...',
            footer: 'Comunicate con soporte!!',
            showCloseButton: true
          });
        }
      },
      () => {
        uploadTask.snapshot.ref.getDownloadURL().then((downloadURL) => {
          this.data.fileAdjunto = downloadURL;
          this.data.nombreAdjunto = `${random}~${this.fileAdjunto.name}`;
          if (tipo === 1) {
            this.guardarVideo();
            return;
          }
          if (tipo === 2) {
            this.guardarVideo();
            return;
          }
        });
      }
    );
  }
  guardarVideo() {
    this.videoSvc.preAddUpdateVideo(this.data);
    this.control(false);
    this.snackBar.open(
      `Dato ${this.data.nombre} agregado con éxito.`,
      'Cerrar',
      {
        duration: 3000,
      }
    );
    this.dialogRef.close();
  }
  control(estado?) {
    if (estado) {
      this.newVideoForm.get('nombre').disable();
      this.newVideoForm.get('descripcion').disable();
      this.newVideoForm.get('codigoSeccion').disable();
      this.newVideoForm.get('idEtapa').disable();
      this.newVideoForm.get('estado').disable();
      this.newVideoForm.get('posicionVideo').disable();
      (document.getElementById(
        'adjuntoVideo'
      ) as HTMLInputElement).disabled = true;
      (document.getElementById(
        'adjuntoArchivo'
      ) as HTMLInputElement).disabled = true;
      (document.getElementById(
        'btnGuardar'
      ) as HTMLInputElement).disabled = true;
    }
    else {
      this.newVideoForm.get('nombre').enable();
      this.newVideoForm.get('descripcion').enable();
      this.newVideoForm.get('codigoSeccion').enable();
      this.newVideoForm.get('idEtapa').enable();
      this.newVideoForm.get('estado').enable();
      this.newVideoForm.get('posicionVideo').enable();
      (document.getElementById(
        'adjuntoVideo'
      ) as HTMLInputElement).disabled = false;
      (document.getElementById(
        'adjuntoArchivo'
      ) as HTMLInputElement).disabled = false;
      (document.getElementById(
        'btnGuardar'
      ) as HTMLInputElement).disabled = false;
    }
  }

  validacion() {
    if (this.newVideoForm.get('controlLink').valid) {
      this.validaN = false;
      this.validaU = false;
    }
    if (this.newVideoForm.get('nombre').value === '') {
      (document.getElementById(
        'txtNombre'
      ) as HTMLInputElement).focus();
    } else {
      if (this.newVideoForm.get('descripcion').value === '') {
        (document.getElementById(
          'txtDescripcion'
        ) as HTMLInputElement).focus();
      } else {
        this.newVideoForm.get('controlLink').value.map((a, index) => {
          if (a.nombre === '') {
            (document.getElementById(
              `txtNombre_${index}`
            ) as HTMLInputElement).focus();
            this.validaN = true;
          } else {
            if (a.url === '') {
              (document.getElementById(
                `txtUrl_${index}`
              ) as HTMLInputElement).focus();
              this.validaU = true;
            }
          }
        });
      }
    }
  }
}

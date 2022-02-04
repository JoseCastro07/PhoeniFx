import { Component, OnInit, Inject } from '@angular/core';
import { FormGroup, FormControl, Validators, FormArray } from '@angular/forms';
import { Service } from '../../../shared/services/service';
import { VideoModel } from '../../../shared/models/video';

import Swal from 'sweetalert2';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Secciones, EtapaModel } from '../../../shared/models/etapa';
import * as firebase from 'firebase/app';

@Component({
  selector: 'app-edit-video',
  templateUrl: './edit-video.component.html',
  styleUrls: ['./edit-video.component.scss'],
})
export class EditVideoComponent implements OnInit {
  fechaSistema = new Date();
  video: VideoModel;
  datos: VideoModel;
  secciones = new Secciones().secciones;
  etapa: EtapaModel[];
  videos: VideoModel[] = [];
  nombreActualV = 'El video no existe';
  nombreActualA = 'El archivo no existe';
  fileVideo: File | null = null;
  fileAdjunto: File | null = null;
  progressV = 0;
  progressA = 0;
  uploadTask: any;
  estado: boolean = false;
  filePathV: string;
  filePathA: string;
  validaN: boolean;
  validaU: boolean;

  constructor(
    private videoSvc: Service,
    private snackBar: MatSnackBar,
    public dialogRef: MatDialogRef<EditVideoComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.video = data.vid;
  }

  public editVideoForm = new FormGroup({
    id: new FormControl('', Validators.required),
    nombre: new FormControl('', Validators.required),
    descripcion: new FormControl('', Validators.required),
    codigoSeccion: new FormControl('', Validators.required),
    idEtapa: new FormControl('', Validators.required),
    nombreSeccion: new FormControl(''),
    nombreEtapa: new FormControl(''),
    nombreVideo: new FormControl(''),
    nombreAdjunto: new FormControl(''),
    estado: new FormControl(''),
    posicionVideo: new FormControl(''),
    controlLink: new FormArray([])
  });

  validaControl(name: string) {
    return (
      this.editVideoForm.get(name).invalid
    );
  }

  ngOnInit(): void {
    this.editVideoForm.get('codigoSeccion').disable();
    this.editVideoForm.get('idEtapa').disable();
    this.editVideoForm.get('posicionVideo').disable();
    this.initValuesVidForm();

    if (this.editVideoForm.get('nombreVideo').value) {
      this.nombreActualV = this.editVideoForm.get('nombreVideo').value;
      this.nombreActualV = this.nombreActualV.split('~')[1];
    }
    if (this.editVideoForm.get('nombreAdjunto').value) {
      this.nombreActualA = this.editVideoForm.get('nombreAdjunto').value;
      this.nombreActualA = this.nombreActualA.split('~')[1];
    }
    this.videoSvc
      .getDataxFiltro('etapa', (ref) =>
        ref
          .where(
            'codigoSeccion',
            '==',
            this.editVideoForm.get('codigoSeccion').value
          )
          .where('estado', '==', true)
          .orderBy('idEtapa')
      )
      .subscribe((responseE) => {
        this.etapa = responseE;
      });
    this.videoSvc
      .getDataxFiltro('video', (ref) =>
        ref
          .where(
            'codigoSeccion',
            '==',
            this.editVideoForm.get('codigoSeccion').value
          )
          .where('idEtapa', '==', this.editVideoForm.get('idEtapa').value)
          .orderBy('posicionVideo')
      )
      .subscribe((responseV) => {
        this.videos = responseV;
      });
  }

  onChangeFileVideo(file): void {
    this.fileVideo = file;
  }

  onChangeFileArchivo(file): void {
    this.fileAdjunto = file;
  }

  addControlLinks() {
    if (this.editVideoForm.get('controlLink').value.length === 0) {
      (this.editVideoForm.get('controlLink') as FormArray).push(new FormGroup({
        id: new FormControl(Math.floor(Math.random() * 9999 + 1)),
        nombre: new FormControl('', Validators.required),
        url: new FormControl('', Validators.required)
      }));
      this.validaN = false;
      this.validaU = false;
      return;
    }
    if (this.editVideoForm.valid) {
      (this.editVideoForm.get('controlLink') as FormArray).push(new FormGroup({
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
    return (this.editVideoForm.get('controlLink') as FormArray).controls;
  }

  deleteControlLinks(indice: number) {
    (this.editVideoForm.get('controlLink') as FormArray).removeAt(indice);
  }

  editVideo() {
    if (this.editVideoForm.valid) {
      try {
        const datosUsuario = JSON.parse(
          atob(localStorage.getItem('loginInfo'))
        );
        this.datos = this.editVideoForm.value;
        this.control(true);
        this.datos.fechaModificacion = new Date();
        this.datos.usuarioModificacion = datosUsuario.nombre;
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
          if (this.etapa.filter(x => x.nombreEtapa === this.datos.nombreEtapa).length === 0) {
            this.datos.estado = false;
          }
          this.videoSvc.editVideoById(this.datos, 1);
          this.control(false);
          this.snackBar.open(
            `Dato ${this.video.nombre} editado con éxito.`,
            'Cerrar',
            {
              duration: 3000,
            }
          );
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
        this.control(false);
      }
    } else {
      this.validacion();
    }
  }

  private uploadVideo(tipo?: number) {
    const random = Math.floor(Math.random() * 9999 + 1);
    this.filePathV = `${this.datos.nombreSeccion}/${this.datos.nombreEtapa}/${random}~${this.fileVideo.name}`;
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
          this.datos.fileVideo = downloadURL;
          this.datos.nombreVideo = `${random}~${this.fileVideo.name}`;
          if (tipo === 1) {
            this.terminarProceso();
            return;
          }
          if (tipo === 2) {
            this.terminarProceso();
            return;
          }
        });
      }
    );
  }

  private uploadAdjunto(tipo?: number) {
    const random = Math.floor(Math.random() * 9999 + 1);
    this.filePathA = `${this.datos.nombreSeccion}/${this.datos.nombreEtapa}/${random}~${this.fileAdjunto.name}`;
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
          this.datos.fileAdjunto = downloadURL;
          this.datos.nombreAdjunto = `${random}~${this.fileAdjunto.name}`;
          if (tipo === 1) {
            this.terminarProceso();
            return;
          }
          if (tipo === 2) {
            this.terminarProceso();
            return;
          }
        });
      }
    );
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
  terminarProceso() {
    if (this.etapa.filter(x => x.nombreEtapa === this.datos.nombreEtapa).length === 0) {
      this.datos.estado = false;
    }
    this.videoSvc.editVideoById(this.datos, 1);
    if (this.fileVideo) {
      if (
        this.datos.nombreVideo !==
        this.editVideoForm.get('nombreVideo').value &&
        this.editVideoForm.get('nombreVideo').value !== ''
      ) {
        this.videoSvc.deleteArchivos(
          this.datos,
          1,
          this.editVideoForm.get('nombreVideo').value
        );
        this.editVideoForm
          .get('nombreVideo')
          .setValue(this.datos.nombreVideo);
      }
    }
    if (this.fileAdjunto) {
      if (
        this.datos.nombreAdjunto !==
        this.editVideoForm.get('nombreAdjunto').value &&
        this.editVideoForm.get('nombreAdjunto').value !== ''
      ) {
        this.videoSvc.deleteArchivos(
          this.datos,
          1,
          this.editVideoForm.get('nombreAdjunto').value
        );
        this.editVideoForm
          .get('nombreAdjunto')
          .setValue(this.datos.nombreAdjunto);
      }
    }
    this.control(false);
    this.snackBar.open(
      `Dato ${this.datos.nombre} editado con éxito.`,
      'Cerrar',
      {
        duration: 3000,
      }
    );
    this.dialogRef.close();
  }

  private initValuesVidForm(): void {
    this.editVideoForm.patchValue({
      id: this.video.id,
      nombre: this.video.nombre,
      descripcion: this.video.descripcion,
      codigoSeccion: this.video.codigoSeccion,
      idEtapa: this.video.idEtapa,
      nombreSeccion: this.video.nombreSeccion,
      nombreEtapa: this.video.nombreEtapa,
      estado: this.video.estado,
      posicionVideo: this.video.posicionVideo,
      nombreVideo: this.video.nombreVideo,
      nombreAdjunto: this.video.nombreAdjunto,
    });
    if (this.video.controlLink !== undefined) {
      if (this.video.controlLink.length > 0) {
        this.video.controlLink.map(a => {
          (this.editVideoForm.get('controlLink') as FormArray).push(new FormGroup({
            id: new FormControl(a.id),
            nombre: new FormControl(a.nombre, Validators.required),
            url: new FormControl(a.url, Validators.required)
          }));
        });
      }

    }
  }
  control(estado?) {
    if (estado) {
      this.editVideoForm.get('nombre').disable();
      this.editVideoForm.get('descripcion').disable();
      this.editVideoForm.get('estado').disable();
      (document.getElementById(
        'adjuntoVideo'
      ) as HTMLInputElement).disabled = true;
      (document.getElementById(
        'adjuntoArchivo'
      ) as HTMLInputElement).disabled = true;
      (document.getElementById(
        'btnEditar'
      ) as HTMLInputElement).disabled = true;
    }
    else {
      this.editVideoForm.get('nombre').enable();
      this.editVideoForm.get('descripcion').enable();
      this.editVideoForm.get('estado').enable();
      (document.getElementById(
        'adjuntoVideo'
      ) as HTMLInputElement).disabled = false;
      (document.getElementById(
        'adjuntoArchivo'
      ) as HTMLInputElement).disabled = false;
      (document.getElementById(
        'btnEditar'
      ) as HTMLInputElement).disabled = false;
    }
  }
  validacion() {
    if (this.editVideoForm.get('controlLink').valid) {
      this.validaN = false;
      this.validaU = false;
    }

    if (this.editVideoForm.get('nombre').value === '') {
      (document.getElementById(
        'txtNombre'
      ) as HTMLInputElement).focus();
    } else {
      if (this.editVideoForm.get('descripcion').value === '') {
        (document.getElementById(
          'txtDescripcion'
        ) as HTMLInputElement).focus();
      } else {
        this.editVideoForm.get('controlLink').value.map((a, index) => {
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

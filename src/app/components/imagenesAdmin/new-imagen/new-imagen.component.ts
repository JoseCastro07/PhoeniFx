import { Component, OnInit, Inject, ViewEncapsulation } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ImagenModel, TipoImagenes } from '../../../shared/models/imagen';
import * as firebase from 'firebase/app';
import Swal from 'sweetalert2';
import { Service } from '../../../shared/services/service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-new-imagen',
  templateUrl: './new-imagen.component.html',
  styleUrls: ['./new-imagen.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class NewImagenComponent implements OnInit {
  fileImagen: File | null = null;
  progress = 0;
  estado: boolean = false;
  validaImagen: boolean = false;
  tipos = new TipoImagenes().tipos;
  constructor(
    private imgSvc: Service,
    private snackBar: MatSnackBar,
    public dialogRef: MatDialogRef<NewImagenComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ImagenModel
  ) { }

  public newImagenForm = new FormGroup({
    titulo: new FormControl('', Validators.required),
    descripcion: new FormControl('', Validators.required),
    estado: new FormControl(true),
    nombreImagen: new FormControl('', Validators.required),
    tipoImagen: new FormControl(1, Validators.required),
    urlA: new FormControl('')
  });

  ngOnInit(): void { }

  validaControl(name: string) {
    return (
      this.newImagenForm.get(name).invalid
    );
  }

  onChangeFileArchivo(file): void {
    this.fileImagen = file;
    if (this.fileImagen) {
      this.validaImagen = false;
    } else {
      this.validaImagen = true;
    }
  }

  newImagen() {
    if (this.newImagenForm.get('titulo').value === '') {
      (document.getElementById(
        'txtTitulo'
      ) as HTMLInputElement).focus();
    } else {
      if (this.newImagenForm.get('descripcion').value === '') {
        (document.getElementById(
          'txtDescripcion'
        ) as HTMLInputElement).focus();
      }
    }
    if (!this.fileImagen) {
      this.validaImagen = true;
      return;
    }
    if (this.newImagenForm.valid) {
      try {
        this.data = this.newImagenForm.value;
        this.control(true);
        this.data.fechaCreacion = new Date();
        this.cargarImagenes();
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
    }
  }
  public async cancelarTask() {
    this.estado = true;
  }

  private cargarImagenes(): void {
    const random = Math.floor(Math.random() * 999 + 1);
    const filePath = `images/${random}${this.fileImagen.name}`;
    const storageRef = firebase.storage().ref();
    const uploadTask = storageRef.child(filePath).put(this.fileImagen);
    uploadTask.on(
      'state_changed',
      (snapshot) => {
        this.progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
        console.log('Upload is ' + this.progress + '% done');
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
          this.data.urlImagen = downloadURL;
          this.data.nombreImagen = `${random}${this.fileImagen.name}`;
          this.imgSvc.preAddUpdateImagen(this.data);
          this.control(false);
          this.snackBar.open(
            `Dato ${this.data.titulo} agregado con éxito.`,
            'Cerrar',
            {
              duration: 3000,
            }
          );
          this.dialogRef.close();
        });
      }
    );
  }
  control(estado?) {
    if (estado) {
      this.newImagenForm.get('titulo').disable();
      this.newImagenForm.get('descripcion').disable();
      this.newImagenForm.get('estado').disable();
      (document.getElementById(
        'adjuntoImagen'
      ) as HTMLInputElement).disabled = true;
      (document.getElementById(
        'btnGuardar'
      ) as HTMLInputElement).disabled = true;
    }
    // else {
    //   this.newImagenForm.get('titulo').enable();
    //   this.newImagenForm.get('descripcion').enable();
    //   this.newImagenForm.get('estado').enable();
    //   (document.getElementById(
    //     'adjuntoImagen'
    //   ) as HTMLInputElement).disabled = false;
    //   (document.getElementById(
    //     'btnGuardar'
    //   ) as HTMLInputElement).disabled = false;
    //   this.newImagenForm.reset();
    //   this.newImagenForm.get('estado').setValue(true);
    //   this.fileImagen = null;
    // }
  }
}

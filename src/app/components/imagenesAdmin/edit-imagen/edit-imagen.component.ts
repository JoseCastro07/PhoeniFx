import { Component, OnInit, Inject } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ImagenModel, TipoImagenes } from '../../../shared/models/imagen';
import * as firebase from 'firebase/app';
import Swal from 'sweetalert2';
import { Service } from '../../../shared/services/service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-edit-imagen',
  templateUrl: './edit-imagen.component.html',
  styleUrls: ['./edit-imagen.component.scss'],
})
export class EditImagenComponent implements OnInit {
  fileImagen: File | null = null;
  progress = 0;
  estado: boolean = false;
  validaImagen: boolean = false;
  imagen: ImagenModel;
  datos: ImagenModel;
  nombreActualI = '';
  tipos = new TipoImagenes().tipos;
  constructor(
    private imgSvc: Service,
    private snackBar: MatSnackBar,
    public dialogRef: MatDialogRef<EditImagenComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.imagen = data.img;
  }

  public editImagenForm = new FormGroup({
    id: new FormControl('', Validators.required),
    titulo: new FormControl('', Validators.required),
    descripcion: new FormControl('', Validators.required),
    estado: new FormControl(true),
    nombreImagen: new FormControl(''),
    tipoImagen: new FormControl('', Validators.required),
    urlA: new FormControl('')
  });

  ngOnInit(): void {
    this.editImagenForm.get('tipoImagen').disable();
    this.initValuesImgForm();
    this.nombreActualI = this.editImagenForm.get('nombreImagen').value;
  }

  validaControl(name: string) {
    return (
      this.editImagenForm.get(name).invalid
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

  editImagen() {
    if (this.editImagenForm.valid) {
      try {
        const datosUsuario = JSON.parse(
          atob(localStorage.getItem('loginInfo'))
        );
        this.datos = this.editImagenForm.value;
        this.control(true);
        this.datos.fechaModificacion = new Date();
        this.datos.usuarioModificacion = datosUsuario.nombre;
        if (this.fileImagen) {
          this.cargarImagenes();
        } else {
          this.imgSvc.editImageById(this.datos);
          this.control(false);
          this.snackBar.open(
            `Dato ${this.datos.titulo} editado con éxito.`,
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
      if (this.editImagenForm.get('titulo').value === '') {
        (document.getElementById(
          'txtTitulo'
        ) as HTMLInputElement).focus();
      } else {
        if (this.editImagenForm.get('descripcion').value === '') {
          (document.getElementById(
            'txtDescripcion'
          ) as HTMLInputElement).focus();
        }
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
          this.datos.urlImagen = downloadURL;
          this.datos.nombreImagen = `${random}${this.fileImagen.name}`;
          this.imgSvc.editImageById(this.datos);
          if (this.fileImagen) {
            if (
              `${random}${this.fileImagen.name}` !==
              this.editImagenForm.get('nombreImagen').value
            ) {
              this.imgSvc.deleteImages(
                'images',
                this.editImagenForm.get('nombreImagen').value
              );
              this.editImagenForm
                .get('nombreImagen')
                .setValue(this.datos.nombreImagen);
            }
          }
          this.control(false);
          this.snackBar.open(
            `Dato ${this.datos.titulo} editado con éxito.`,
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

  private initValuesImgForm(): void {
    this.editImagenForm.patchValue({
      id: this.imagen.id,
      titulo: this.imagen.titulo,
      descripcion: this.imagen.descripcion,
      nombreImagen: this.imagen.nombreImagen,
      estado: this.imagen.estado,      
      tipoImagen: this.imagen.tipoImagen,
      urlA: this.imagen.urlA
    });
  }

  control(estado?) {
    if (estado) {
      this.editImagenForm.get('titulo').disable();
      this.editImagenForm.get('descripcion').disable();
      this.editImagenForm.get('estado').disable();
      (document.getElementById(
        'adjuntoImagen'
      ) as HTMLInputElement).disabled = true;
      (document.getElementById(
        'btnEditar'
      ) as HTMLInputElement).disabled = true;
    }
    // else {
    //   this.editImagenForm.get('titulo').enable();
    //   this.editImagenForm.get('descripcion').enable();
    //   this.editImagenForm.get('estado').enable();
    //   (document.getElementById(
    //     'adjuntoImagen'
    //   ) as HTMLInputElement).disabled = false;
    //   (document.getElementById(
    //     'btnEditar'
    //   ) as HTMLInputElement).disabled = false;
    // }
  }
}

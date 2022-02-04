import { Injectable } from '@angular/core';
import {
  AngularFirestore,
  AngularFirestoreCollection,
} from '@angular/fire/firestore';

import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AngularFireStorage } from '@angular/fire/storage';
import { UsuarioModel } from '../models/usuario';

import { firestore } from 'firebase/app';
import { EtapaModel } from '../models/etapa';
import { HttpClient } from '@angular/common/http';
import * as firebase from 'firebase/app';
import Swal from 'sweetalert2';
import { MatSnackBar } from '@angular/material/snack-bar';
import { VideoModel } from '../models/video';
import { ImagenModel } from '../models/imagen';
import { AuthService } from './auth.service';
import { CorreoModel } from '../models/correo';
import { ControlUsuarioVideoModel } from '../models/controlUsuarioVideo';
import { ActividadModel } from '../models/actividad';
import { NotificacionModel } from '../models/notificacion';
import { ControlErrorModel } from '../models/controlError';
import { ControlUsuarioNotificacionModel } from '../models/controlUsuarioNotificacion';
import { PlanTradingModel } from '../models/planTrading';
import { PagoUsuarioModel } from '../models/pagoUsuario';

type CollentionPredicate<T> = string | AngularFirestoreCollection;

@Injectable({
  providedIn: 'root',
})
export class Service {
  private usuarioCollection: AngularFirestoreCollection<UsuarioModel>;
  private etapaCollection: AngularFirestoreCollection<EtapaModel>;
  private videoCollection: AngularFirestoreCollection<VideoModel>;
  private imagenCollection: AngularFirestoreCollection<ImagenModel>;
  private correoCollection: AngularFirestoreCollection<CorreoModel>;
  private controlUsuarioVideoCollection: AngularFirestoreCollection<ControlUsuarioVideoModel>;
  private actividadCollection: AngularFirestoreCollection<ActividadModel>;
  private notificacionCollection: AngularFirestoreCollection<NotificacionModel>;
  private controlErrorCollection: AngularFirestoreCollection<ControlErrorModel>;
  private controlUsuarioNotificacionCollection: AngularFirestoreCollection<ControlUsuarioNotificacionModel>;
  private planTradingCollection: AngularFirestoreCollection<PlanTradingModel>;
  private pagoUsuarioCollection: AngularFirestoreCollection<PagoUsuarioModel>;
  private imagenEtapaNueva = 'https://picsum.photos/id/1/200/300';


  private filePathV: any;
  private filePathA: any;

  constructor(
    private afs: AngularFirestore,
    private storage: AngularFireStorage,
    private http: HttpClient,
    private snackBar: MatSnackBar,
    private userAuth: AuthService
  ) {
    this.usuarioCollection = afs.collection<UsuarioModel>('usuario');
    this.etapaCollection = afs.collection<EtapaModel>('etapa');
    this.videoCollection = afs.collection<VideoModel>('video');
    this.imagenCollection = afs.collection<ImagenModel>('imagen');
    this.correoCollection = afs.collection<CorreoModel>('correo');
    this.controlUsuarioVideoCollection = afs.collection<ControlUsuarioVideoModel>('controlUsuarioVideo');
    this.actividadCollection = afs.collection<ActividadModel>('actividad');
    this.notificacionCollection = afs.collection<NotificacionModel>('notificacion');
    this.controlErrorCollection = afs.collection<ControlErrorModel>('controlError');
    this.controlUsuarioNotificacionCollection = afs.collection<ControlUsuarioNotificacionModel>('controlUsuarioNotificacion');
    this.planTradingCollection = afs.collection<PlanTradingModel>('planTrading');
    this.pagoUsuarioCollection = afs.collection<PagoUsuarioModel>('pagoUsuario');
  }

  public getAllUsuarios(): Observable<UsuarioModel[]> {
    return this.usuarioCollection.snapshotChanges().pipe(
      map((changes) => {
        return changes.map((a) => {
          const data = a.payload.doc.data() as any;
          Object.keys(data)
            .filter((key) => data[key] instanceof firestore.Timestamp)
            .map((key) => (data[key] = data[key].toDate()));
          data.id = a.payload.doc.id;
          return data;
        });
      })
    );
  }
  private col<T>(
    ref: CollentionPredicate<T>,
    queryFn?
  ): AngularFirestoreCollection {
    return typeof ref === 'string' ? this.afs.collection(ref, queryFn) : ref;
  }

  public getDataxFiltro(
    ref: CollentionPredicate<object>,
    queryFn?
  ): Observable<any[]> {
    return this.col(ref, queryFn)
      .snapshotChanges()
      .pipe(
        map((actions) => {
          return actions.map((a) => {
            const data = a.payload.doc.data() as any;
            Object.keys(data)
              .filter((key) => data[key] instanceof firestore.Timestamp)
              .forEach((key) => (data[key] = data[key].toDate()));
            data.id = a.payload.doc.id;
            return data;
          });
        })
      );
  }

  public codigoPais() {
    return this.http
      .get('https://geolocation-db.com/json/')
      .pipe(
        map((response) => {
          return response;
        })
      );
  }

  public getOneUsuario(uid: string): Observable<UsuarioModel> {
    return this.afs.doc<UsuarioModel>(`usuario/${uid}`).valueChanges();
  }

  public deleteUsuarioById(usuario: UsuarioModel) {
    return this.usuarioCollection.doc(usuario.id).delete();
  }
  public editUsuarioById(usuario: UsuarioModel, actualizar?: number) {
    if (actualizar) {
      this.userAuth.preSaveUserProfile(usuario);
    }
    return this.usuarioCollection.doc(usuario.id).update(usuario);
  }
  public editEtapaById(etapa: EtapaModel) {
    return this.etapaCollection.doc(etapa.id).update(etapa);
  }
  public editVideoById(video: VideoModel, tipo?) {
    if (video.nombreVideo === '' && tipo === 1) {
      video.estado = false;
    }
    return this.videoCollection.doc(video.id).update(video);
  }
  public editImageById(imagen: ImagenModel) {
    return this.imagenCollection.doc(imagen.id).update(imagen);
  }
  public editActividadById(actividad: ActividadModel) {
    const codigoPais = JSON.parse(
      atob(localStorage.getItem('codigoPais'))
    );
    if (codigoPais[0].codigoPais !== 'CR') {
      actividad.fechaActividad = new Date(actividad.fechaActividad.getFullYear(), (actividad.fechaActividad.getMonth()), actividad.fechaActividad.getDate(), Number(actividad.fechaActividad.getHours()) + Number(codigoPais[0].hora), Number(actividad.fechaActividad.getMinutes()), 0);
    }
    return this.actividadCollection.doc(actividad.id).update(actividad);
  }
  public preAddUpdateControlUVById(controlUV: ControlUsuarioVideoModel) {
    return this.controlUsuarioVideoCollection.doc(controlUV.id).update(controlUV);
  }
  public preAddUpdatePlanTradingById(planTrading: PlanTradingModel) {
    return this.planTradingCollection.doc(planTrading.id).update(planTrading);
  }
  public preAndUpdateUsuario(usuario: UsuarioModel, opcion?: number): void {
    this.saveUsuario(usuario, opcion);
  }
  public preAddUpdateActividad(actividad: ActividadModel): void {
    this.saveActividad(actividad);
  }
  public preAddUpdateEtapa(etapa: EtapaModel): void {
    this.cargarCarpetas(etapa);
  }
  public deleteArchivos(video: VideoModel, tipo?, nombre?) {
    this.deleteFile(video, tipo, nombre);
  }
  public deleteImages(carpeta, nombreImagen): void {
    this.deleteImage(carpeta, nombreImagen);
  }
  public preAddUpdateVideo(video: VideoModel): void {
    if (video.fileVideo === '') {
      video.estado = false;
    }
    this.saveVideo(video);
  }
  public preAddUpdateImagen(imagen: ImagenModel): void {
    this.saveImagen(imagen);
  }
  public AddCorreo(correo: CorreoModel): void {
    this.saveCorreo(correo);
  }
  public preAddUpdateNotificacion(notificacion: NotificacionModel): void {
    this.saveNotificacion(notificacion);
  }
  public preAddUpdateControlUNById(controlUN: ControlUsuarioNotificacionModel) {
    return this.controlUsuarioNotificacionCollection.doc(controlUN.id).update(controlUN);
  }
  public preAddUpdateControlError(controlError: ControlErrorModel): void {
    this.saveControlError(controlError);
  }
  public editNotificacionById(notificacion: NotificacionModel) {
    return this.notificacionCollection.doc(notificacion.id).update(notificacion);
  }
  public AddControlUV(controlUV: ControlUsuarioVideoModel): ControlUsuarioVideoModel {
    return this.saveControlUsuarioVideo(controlUV);
  }
  public AddControlUN(controlUN: ControlUsuarioNotificacionModel) {
    return this.saveControlUsuarioNotificacion(controlUN);
  }

  public preAddUpdatePlanTrading(planTrading: PlanTradingModel): void {
    this.savePlanTrading(planTrading);
  }
  public preAddUpdatePagoUsuario(pagoUsuario: PagoUsuarioModel): void {
    this.savePagoUsuario(pagoUsuario);
  }
  public deleteVideoById(video: VideoModel) {
    return this.videoCollection.doc(video.id).delete();
  }
  public deleteImagenById(imagen: ImagenModel) {
    return this.imagenCollection.doc(imagen.id).delete();
  }
  public deleteActividadById(actividad: ActividadModel) {
    return this.actividadCollection.doc(actividad.id).delete();
  }
  public deleteControlUsuarioNotificacionById(controlUsuarioNotificacion: ControlUsuarioNotificacionModel) {
    return this.controlUsuarioNotificacionCollection.doc(controlUsuarioNotificacion.id).delete();
  }
  public editProfileUser(user: UsuarioModel, photoURL?, imagenA?): string {
    return this.cargarImagenProfile(user, photoURL, imagenA);
  }

  private saveUsuario(usuario: UsuarioModel, opcion?: number) {
    const usuarioObj = {
      uid: usuario.uid,
      email: usuario.email,
      password: usuario.password,
      nombre: usuario.nombre,
      estado: usuario.estado,
      fechaCreacion: usuario.fechaCreacion,
      rol: usuario.rol,
      usuarioCreacion: usuario.usuarioCreacion,
      fechaPago: usuario.fechaPago,
      fechaVencimientoPago: usuario.fechaVencimientoPago,
      photoURL: usuario.photoURL,
      nombreImagen: usuario.nombreImagen,
      tipoPlan: usuario.tipoPlan,
      codigoS: usuario.codigoS,
      codigoR: usuario.codigoR,
      terminoC: usuario.terminoC,
      tipoPago: usuario.tipoPago,
      id: '',
    };
    if (usuario.id) {
      return this.usuarioCollection.doc(usuario.id).update(usuarioObj).then((a) => {
        if (opcion === 1) {
          this.userAuth.logout();
        }
      });
    } else {
      return this.usuarioCollection.add(usuarioObj).then((a) => {
        usuarioObj.id = a.id;
        this.usuarioCollection.doc(a.id).update(usuarioObj);
        if (opcion === 1) {
          this.userAuth.logout();
        }
      });
    }
  }
  private saveEtapa(etapa: EtapaModel) {
    const datosUsuario = JSON.parse(
      atob(localStorage.getItem('loginInfo'))
    );
    const etapaObj = {
      descripcion: etapa.descripcion,
      codigoSeccion: etapa.codigoSeccion,
      nombreSeccion: etapa.nombreSeccion,
      idEtapa: etapa.idEtapa,
      nombreEtapa: etapa.nombreEtapa,
      fechaCreacion: etapa.fechaCreacion,
      usuarioCreacion: datosUsuario.nombre,
      estado: etapa.estado
    };

    if (etapa.id) {
      return this.etapaCollection.doc(etapa.id).update(etapaObj);
    } else {
      return this.etapaCollection.add(etapaObj);
    }
  }
  private saveVideo(video: VideoModel) {
    const datosUsuario = JSON.parse(
      atob(localStorage.getItem('loginInfo'))
    );
    const videoObj = {
      nombre: video.nombre,
      descripcion: video.descripcion,
      codigoSeccion: video.codigoSeccion,
      nombreSeccion: video.nombreSeccion,
      idEtapa: video.idEtapa,
      nombreEtapa: video.nombreEtapa,
      fechaCreacion: video.fechaCreacion,
      usuarioCreacion: datosUsuario.nombre,
      estado: video.estado,
      fileVideo: video.fileVideo,
      fileAdjunto: video.fileAdjunto,
      posicionVideo: video.posicionVideo,
      nombreVideo: video.nombreVideo,
      nombreAdjunto: video.nombreAdjunto,
      id: '',
      controlLink: video.controlLink
    };
    if (video.id) {
      return this.videoCollection.doc(video.id).update(videoObj);
    } else {
      return this.videoCollection.add(videoObj).then((a) => {
        videoObj.id = a.id;
        this.videoCollection.doc(a.id).update(videoObj);
      });
    }
  }
  private saveImagen(imagen: ImagenModel) {
    const datosUsuario = JSON.parse(
      atob(localStorage.getItem('loginInfo'))
    );
    const imagenObj = {
      titulo: imagen.titulo,
      descripcion: imagen.descripcion,
      nombreImagen: imagen.nombreImagen,
      urlImagen: imagen.urlImagen,
      fechaCreacion: imagen.fechaCreacion,
      usuarioCreacion: datosUsuario.nombre,
      estado: imagen.estado,
      tipoImagen: imagen.tipoImagen,
      urlA: imagen.urlA
    };
    if (imagen.id) {
      return this.imagenCollection.doc(imagen.id).update(imagenObj);
    } else {
      return this.imagenCollection.add(imagenObj);
    }
  }
  private saveCorreo(correo: CorreoModel) {
    const correoObj = {
      name: correo.name,
      emailF: correo.emailF,
      message: correo.message,
      emailT: correo.emailT,
      subject: correo.subject,
      fechaCreacion: correo.fechaCreacion,
      estado: correo.estado,
      id: ''
    };
    return this.correoCollection.add(correoObj).then((a) => {
      correoObj.id = a.id;
      this.correoCollection.doc(a.id).update(correoObj);
    });
  }
  private saveControlUsuarioVideo(controlUV: ControlUsuarioVideoModel): ControlUsuarioVideoModel {
    const controlUVObj = {
      idUsuario: controlUV.idUsuario,
      codigoSeccion: controlUV.codigoSeccion,
      idEtapa: controlUV.idEtapa,
      idVideoActual: controlUV.idVideoActual,
      fechaUltimaVisita: controlUV.fechaUltimaVisita,
      id: '',
      segundo: controlUV.segundo

    };
    this.controlUsuarioVideoCollection.add(controlUVObj).then((a) => {
      controlUVObj.id = a.id;
      this.controlUsuarioVideoCollection.doc(a.id).update(controlUVObj);
    });
    return controlUVObj;
  }

  private saveActividad(actividad: ActividadModel) {
    const datosUsuario = JSON.parse(
      atob(localStorage.getItem('loginInfo'))
    );
    const codigoPais = JSON.parse(
      atob(localStorage.getItem('codigoPais'))
    );
    const actividadObj = {
      nombre: actividad.nombre,
      descripcion: actividad.descripcion,
      controlUrls: actividad.controlUrls,
      estado: actividad.estado,
      tipo: actividad.tipo,
      fechaActividad: actividad.fechaActividad,
      fechaCreacion: actividad.fechaCreacion,
      usuarioCreacion: datosUsuario.nombre,
      id: ''
    };
    if (actividad.id) {
      return this.actividadCollection.doc(actividad.id).update(actividadObj);
    } else {
      return this.actividadCollection.add(actividadObj).then((a) => {
        actividadObj.id = a.id;
        if (codigoPais[0].codigoPais !== 'CR') {
          actividadObj.fechaActividad = new Date(actividadObj.fechaActividad.getFullYear(), (actividadObj.fechaActividad.getMonth()), actividadObj.fechaActividad.getDate(), Number(actividadObj.fechaActividad.getHours()) + Number(codigoPais[0].hora), Number(actividadObj.fechaActividad.getMinutes()), 0);
        }
        this.actividadCollection.doc(a.id).update(actividadObj);
      });
    }
  }
  private saveNotificacion(notificacion: NotificacionModel) {
    const datosUsuario = JSON.parse(
      atob(localStorage.getItem('loginInfo'))
    );
    const notificacionObj = {
      fechaCreacion: notificacion.fechaCreacion,
      usuarioCreacion: datosUsuario.nombre,
      controlNotification: notificacion.controlNotification,
      id: ''
    };
    if (notificacion.id) {
      return this.notificacionCollection.doc(notificacion.id).update(notificacionObj);
    } else {
      return this.notificacionCollection.add(notificacionObj).then((a) => {
        notificacionObj.id = a.id;
        this.notificacionCollection.doc(a.id).update(notificacionObj);
      });
    }
  }
  private saveControlUsuarioNotificacion(controlUN: ControlUsuarioNotificacionModel) {
    const controlUNObj = {
      idUsuario: controlUN.idUsuario,
      notificacionesVistas: controlUN.notificacionesVistas,
      id: ''
    };
    this.controlUsuarioNotificacionCollection.add(controlUNObj).then((a) => {
      controlUNObj.id = a.id;
      this.controlUsuarioNotificacionCollection.doc(a.id).update(controlUNObj);
    });
  }

  private saveControlError(controlError: ControlErrorModel) {
    const controlErrorObj = {
      ubicacionError: controlError.ubicacionError,
      descripcion: controlError.descripcion,
      email: controlError.email,
      fechaCreacion: controlError.fechaCreacion,
      usuarioCreacion: controlError.usuarioCreacion,
      idTipoColeccion: controlError.idTipoColeccion,
      id: ''
    };
    if (controlError.id) {
      return this.controlErrorCollection.doc(controlError.id).update(controlErrorObj);
    } else {
      return this.controlErrorCollection.add(controlErrorObj).then((a) => {
        controlErrorObj.id = a.id;
        this.controlErrorCollection.doc(a.id).update(controlErrorObj);
      });
    }
  }
  private savePlanTrading(planTrading: PlanTradingModel) {
    const planTradingObj = {
      tipoTrader: planTrading.tipoTrader,
      paresPreferidos: planTrading.paresPreferidos,
      sistema: planTrading.sistema,
      reglas: planTrading.reglas,
      riesgo: planTrading.riesgo,
      diasOperacion: planTrading.diasOperacion,
      meta: planTrading.meta,
      horasB: planTrading.horasB,
      horasE: planTrading.horasE,
      fortalezas: planTrading.fortalezas,
      creencia: planTrading.creencia,
      controlTrade: planTrading.controlTrade,
      controlNote: planTrading.controlNote,
      fechaCreacion: planTrading.fechaCreacion,
      usuarioCreacion: planTrading.usuarioCreacion,
      uid: planTrading.uid,
      id: ''
    };
    if (planTrading.id) {
      return this.planTradingCollection.doc(planTrading.id).update(planTradingObj);
    } else {
      return this.planTradingCollection.add(planTradingObj).then((a) => {
        planTradingObj.id = a.id;
        this.planTradingCollection.doc(a.id).update(planTradingObj);
      });
    }
  }
  private savePagoUsuario(pagoUsuario: PagoUsuarioModel) {
    const pagoUsuarioObj = {
      uid: pagoUsuario.uid,
      fechaCreacion: pagoUsuario.fechaCreacion,
      usuarioCreacion: pagoUsuario.usuarioCreacion,
      create_time: pagoUsuario.create_time,
      idPaypal: pagoUsuario.idPaypal,
      payee: pagoUsuario.payee,
      tipoPlan: pagoUsuario.tipoPlan,
      payer: pagoUsuario.payer,
      address: pagoUsuario.address,
      payment: pagoUsuario.payment,
      id: ''
    };
    if (pagoUsuario.id) {
      return this.pagoUsuarioCollection.doc(pagoUsuario.id).update(pagoUsuarioObj);
    } else {
      return this.pagoUsuarioCollection.add(pagoUsuarioObj).then((a) => {
        pagoUsuarioObj.id = a.id;
        this.pagoUsuarioCollection.doc(a.id).update(pagoUsuarioObj);
      });
    }
  }

  getImage() {
    return this.http
      .get(this.imagenEtapaNueva, {
        responseType: 'arraybuffer',
      })
      .pipe(
        map((response) => {
          return new File([response], 'BORRAR_SI_NO_ES_UNICA_IMAGEN.jpg');
        })
      );
  }
  private cargarCarpetas(etapa: EtapaModel): void {
    this.filePathA = `${etapa.nombreSeccion}/${etapa.nombreEtapa}/BORRAR_SI_NO_ES_UNICA_IMAGEN.jpg`;
    this.getImage().subscribe(
      (response) => {
        const storageRef = firebase.storage().ref();
        const uploadTask = storageRef.child(this.filePathA).put(response);
        uploadTask.on(
          'state_changed',
          (snapshot) => {
            const progress =
              (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            console.log('Upload is ' + progress + '% done');
            switch (snapshot.state) {
              case firebase.storage.TaskState.PAUSED:
                console.log('Upload is paused');
                break;
              case firebase.storage.TaskState.RUNNING:
                console.log('Upload is running');
                break;
            }
          },
          (err) => {
            console.log(err);
            Swal.fire({
              text: 'Hubo un problema!',
              icon: 'error',
              title: 'Oops...',
              footer: 'Comunicate con soporte!!',
              showCloseButton: true
            });
          },
          () => {
            this.saveEtapa(etapa);
            this.snackBar.open(
              `Etapa ${etapa.descripcion} creada con éxito.`,
              'Cerrar',
              {
                duration: 3000,
              }
            );
          }
        );
      },
      (error) => {
        console.log(error);
        Swal.fire({
          text: 'Hubo un problema!',
          icon: 'error',
          title: 'Oops...',
          footer: 'Comunicate con soporte!!',
          showCloseButton: true
        });
      }
    );
  }

  private deleteFile(video: VideoModel, tipo?, nombre?) {
    let fileRef;
    try {
      if (tipo === 1) {
        this.filePathV = `${video.nombreSeccion}/${video.nombreEtapa}/${nombre}`;
        fileRef = this.storage.ref(this.filePathV);
        fileRef.delete();
      }
      if (tipo === 2) {
        if (video.nombreVideo) {
          this.filePathV = `${video.nombreSeccion}/${video.nombreEtapa}/${video.nombreVideo}`;
          fileRef = this.storage.ref(this.filePathV);
          fileRef.delete();
        }
        if (video.nombreAdjunto) {
          this.filePathA = `${video.nombreSeccion}/${video.nombreEtapa}/${video.nombreAdjunto}`;
          fileRef = this.storage.ref(this.filePathA);
          fileRef.delete();
        }
      }
    } catch (error) {
      console.log(error);
      Swal.fire({
        text: 'Hubo un problema!',
        icon: 'error',
        title: 'Oops...',
        footer: 'Comunicate con soporte!!',
        showCloseButton: true
      });
    }
  }
  private deleteImage(carpeta, nombreImagen) {
    try {
      if (nombreImagen) {
        this.filePathA = `${carpeta}/${nombreImagen}`;
        const fileRef = this.storage.ref(this.filePathA);
        fileRef.delete();
      }
    } catch (error) {
      console.log(error);
      Swal.fire({
        text: 'Hubo un problema!',
        icon: 'error',
        title: 'Oops...',
        footer: 'Comunicate con soporte!!',
        showCloseButton: true
      });
    }
  }
  private cargarImagenProfile(user: UsuarioModel, photoURL, imagenA): any {
    const random = Math.floor(Math.random() * 9999 + 1);
    const filePath = `usuarios/${random}${photoURL.name}`;
    const storageRef = firebase.storage().ref();
    const uploadTask = storageRef.child(filePath).put(photoURL);
    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        console.log('Upload is ' + progress + '% done');
        switch (snapshot.state) {
          case firebase.storage.TaskState.PAUSED: // or 'paused'
            console.log('Upload is paused');
            break;
          case firebase.storage.TaskState.RUNNING: // or 'running'
            console.log('Upload is running');
            break;
        }
      },
      (err) => {
        console.log(err);
        Swal.fire({
          text: 'Hubo un problema o se cancelo la carga!',
          icon: 'error',
          title: 'Oops...',
          footer: 'Comunicate con soporte!!',
          showCloseButton: true
        });
        return '400';
      },
      () => {
        uploadTask.snapshot.ref.getDownloadURL().then((downloadURL) => {
          user.photoURL = downloadURL;
          user.nombreImagen = `${random}${photoURL.name}`;
          this.editUsuarioById(user);
          if (`${random}${photoURL.name}` !== imagenA && imagenA !== '') {
            this.deleteImage('usuarios', imagenA);
          }
          this.snackBar.open(
            `Usuario ${user.nombre} editado con éxito.`,
            'Cerrar',
            {
              duration: 3000,
            }
          );
        });
      }
    );
    return '200';
  }
}

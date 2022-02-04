import { Injectable } from '@angular/core';
import { UserI } from '../models/user.interface';
import { AngularFireAuth } from '@angular/fire/auth';
import { Observable } from 'rxjs';
import { AngularFireStorage } from '@angular/fire/storage';
import { UsuarioModel } from '../models/usuario';

import { HttpClient } from '@angular/common/http';
import * as firebase from 'firebase/app';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  public userData$: Observable<firebase.User | null>;
  public imagenEtapaNueva = 'https://picsum.photos/id/1/200/300';

  constructor(
    private afAuth: AngularFireAuth,
    private storage: AngularFireStorage,
    private http: HttpClient,
    private router: Router
  ) {
    this.userData$ = afAuth.authState;
  }

  // loginByEmail(user: UserI) {
  //   const { email, password } = user;
  //   return this.afAuth.auth.signInWithEmailAndPassword(email, password);
  // }


  public loginByEmailUsu(usuario: UsuarioModel) {
    const { email, password } = usuario;
    return this.afAuth.auth.signInWithEmailAndPassword(email, password);
    //     .then(user => {
    //      return user;
    //     }).catch(error => {
    // console.log(error);
    // return error;
    //     });
  }

  public saveUserState(estado?: number) {
    this.getUser()
      .then(data => {
        if (data !== null) {
          const uid = data.uid;
          const userStatusDatabaseRef = firebase.database().ref('/status/' + uid);
          const isOfflineForDatabase = {
            state: 'offline',
            last_changed: firebase.database.ServerValue.TIMESTAMP,
            nombre: data.displayName,
            correo: data.email,
            fechaEstado: new Date().toString()
          };

          const isOnlineForDatabase = {
            state: 'online',
            last_changed: firebase.database.ServerValue.TIMESTAMP,
            nombre: data.displayName,
            correo: data.email,
            fechaEstado: new Date().toString()
          };

          firebase.database().ref('.info/connected').on('value', function (snapshot) {
            if (snapshot.val() == false) {
              return;
            };
            if (estado === 0) {
              userStatusDatabaseRef.set(isOfflineForDatabase);
              return;
            }
            if (estado === 1) {
              userStatusDatabaseRef.set(isOnlineForDatabase);
              return;
            }
          });
        }
      });
  }
  public estadoUsuario(uid: string): Promise<any> {
    const estado = new Promise((resolve, reject) => {
      firebase.database().ref('/status/' + uid).once('value').then((snapshot) => {
        if (snapshot.exists()) {
          resolve(snapshot.val());
        } else {
          resolve(null);
        }
      });
    });
    return estado;
  }

  public addEmailUsu(usuario: UsuarioModel) {
    const { email, password } = usuario;
    return this.afAuth.auth.createUserWithEmailAndPassword(email, password);
  }

  public sendEmail(email: string) {
    return this.afAuth.auth.sendPasswordResetEmail(email);
  }

  public async sendVerification(email: string) {
    const actionCodeSettings = {
      //url: `http://localhost:4200/login`,
      url: `https://phoenifx.com/login`,
      handleCodeInApp: true
    };
    try {
      await this.afAuth.auth.sendSignInLinkToEmail(email, actionCodeSettings);
      window.localStorage.setItem('emailForSignIn', email);
      return console.log('Email sent!');
    } catch (err) {
      return console.log('Error', err);
    }
  }

  public async confirmSignIn(url): Promise<any> {
    let resultado = '';
    try {
      if (this.afAuth.auth.isSignInWithEmailLink(url)) {
        let email = window.localStorage.getItem('emailForSignIn');
        if (!email) {
          email = window.prompt('Por favor ingresa tu email de confirmación');
        }
        this.afAuth.auth.signInWithEmailLink(email, url).then((result) => {
          window.localStorage.removeItem('emailForSignIn');
          resultado = result.user.uid;
        })
          .catch((error) => {
            console.log('Error', error);
          });
      }
    } catch (err) {
      console.log('Error', err);
    }
    return resultado;
  }

  public deleteEmailUsu(usuario: UsuarioModel) {
    // this.http.post(`${this.url}:delete?key=${this.apiKey}`, JSON.stringify(usuario)).pipe(map( resp => {
    //   console.log(resp);
    //   return resp;
    // }));
  }

  public getUser(): Promise<any> {
    const user = new Promise((resolve, reject) => {
      this.afAuth.auth.onAuthStateChanged(user => {
        if (user) {
          resolve(user);
        } else {
          resolve(null);
        }
      });
    });
    return user;
  }

  public logout() {
    this.saveUserState(0);
    this.afAuth.auth.signOut().then( l => {
      localStorage.removeItem('loginInfo');
      localStorage.removeItem('notificationInfo');
      localStorage.removeItem('codigoPais');
    });
  }

  public preSaveUserProfile(user: UsuarioModel, image?): void {
    // if (image) {
    //   this.uploadImage(user, image);
    // } else {
    this.saveUserProfile(user);
    // }
  }

  // getImage() {
  //   return this.http
  //     .get(this.imagenEtapaNueva, {
  //       responseType: 'arraybuffer',
  //     })
  //     .pipe(
  //       map((response) => {
  //         return new File([response], 'BORRAR_SI_NO_ES_UNICA_IMAGEN.jpg');
  //       })
  //     );
  // }
  // private cargarCarpetas(): void {
  //   this.filePath = `#sesion/#etapa/BORRAR_SI_NO_ES_UNICA_IMAGEN.jpg`;
  //   this.getImage().subscribe((response) => {
  //     const storageRef = firebase.storage().ref();
  //     const uploadTask = storageRef.child(this.filePath).put(response);
  //     uploadTask.on(
  //       'state_changed',
  //       (snapshot) => {
  //         const progress =
  //           (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
  //         console.log('Upload is ' + progress + '% done');
  //         switch (snapshot.state) {
  //           case firebase.storage.TaskState.PAUSED:
  //             console.log('Upload is paused');
  //             break;
  //           case firebase.storage.TaskState.RUNNING:
  //             console.log('Upload is running');
  //             break;
  //         }
  //       },
  //       (err) => {
  //         console.log(err);
  //       },
  //       () => {
  //         uploadTask.snapshot.ref.getDownloadURL().then((downloadURL) => {
  //           console.log('File available at', downloadURL);
  //         });
  //       }
  //     );
  //   });
  // }
  // private uploadImage(user: UserI, image): void {
  //   console.log(image);
  //   this.filePath = `images/img/${image.name}`;
  //   const storageRef = firebase.storage().ref();
  //   // const fileRef = this.storage.ref(this.filePath); para borrar
  //   // fileRef.delete();
  //   const uploadTask = storageRef.child(this.filePath).put(image);
  //   uploadTask.on(
  //     'state_changed',
  //     (snapshot) => {
  //       const progress =
  //         (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
  //       console.log('Upload is ' + progress + '% done');
  //       switch (snapshot.state) {
  //         case firebase.storage.TaskState.PAUSED: // or 'paused'
  //           console.log('Upload is paused');
  //           break;
  //         case firebase.storage.TaskState.RUNNING: // or 'running'
  //           console.log('Upload is running');
  //           break;
  //       }
  //     },
  //     (err) => {
  //       console.log(err);
  //     },
  //     () => {
  //       uploadTask.snapshot.ref.getDownloadURL().then((downloadURL) => {
  //         console.log('File available at', downloadURL);
  //       });
  //     }
  //   );

  // const task = this.storage.upload(this.filePath, image);
  // const prueba = fileRef.put(image).then(
  //   a => {
  //     console.log(a);
  //     console.log(firebase.storage.TaskState.RUNNING);
  //   }
  // ).catch( err => {
  //  console.log(err);
  // });

  // prueba.snapshotChanges()
  //   .pipe(
  //     finalize(() => {
  //       fileRef.getDownloadURL().subscribe(urlImage => {
  //        console.log(urlImage);
  //       });
  //     })
  //   ).subscribe((error) => {
  //     console.log(error);
  //   });
  // const fileRef = this.storage.ref(this.filePath);
  // const task = this.storage.upload(this.filePath, image);
  // task.snapshotChanges()
  //   .pipe(
  //     finalize(() => {
  // fileRef.put(image).then(urlImage => {
  //         console.log(urlImage.task.snapshot(hola => hola);
  //         console.log(urlImage.downloadURL);
  //       //  console.log(fileRef.getDownloadURL());
  //       });
  //   })
  // ).subscribe();
  // }

  private saveUserProfile(user: UsuarioModel) {
    this.afAuth.auth.currentUser
      .updateProfile({
        displayName: user.nombre,
        photoURL: user.photoURL
      })
      .then(() => console.log('User updated!'))
      .catch((err) => console.log('Error', err));
  }
}

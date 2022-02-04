import { Component, OnInit, ViewChild, AfterViewInit, ViewEncapsulation } from '@angular/core';
import { MatPaginator, MatPaginatorIntl } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';

import { MatDialog } from '@angular/material/dialog';
import { VideoModel } from '../../../shared/models/video';
import { Service } from '../../../shared/services/service';
import { EditVideoComponent } from '../../../components/videosAdmin/edit-video/edit-video.component';
import { NewVideoComponent } from '../../../components/videosAdmin/new-video/new-video.component';
import Swal from 'sweetalert2';
import { SelectionModel } from '@angular/cdk/collections';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';

@Component({
  selector: 'app-list-video',
  templateUrl: './list-video.component.html',
  styleUrls: ['./list-video.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ListVideoComponent implements OnInit, AfterViewInit {
  displayedColumns: string[] = [
    'select',
    'nombre',
    // 'descripcion',
    'nombreSeccion',
    'nombreEtapa',
    'posicionVideo',
    'estado',
    'fechaCreacion',
    'usuarioCreacion',
    'fechaModificacion',
    'usuarioModificacion',
    'actions',
  ];
  dataSource = new MatTableDataSource<VideoModel>();
  selection = new SelectionModel<VideoModel>(true, []);
  video: VideoModel[] = [];
  dataLength: number;

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  constructor(private vidSvc: Service, public dialog: MatDialog, private snackBar: MatSnackBar, private router: Router, private paginatorE: MatPaginatorIntl) {
    this.paginatorE.itemsPerPageLabel = "Registros por página";
  }

  ngOnInit() {
    this.vidSvc
      .getDataxFiltro('etapa', (ref) =>
        ref
          .where('estado', '==', true)
          .where('idEtapa', '==', 1)
      )
      .subscribe((response) => {
        if (response.length === 0) {
          this.snackBar.open(
            `Se requiere crear primero una etapa!`,
            'Cerrar',
            {
              duration: 3000,
            }
          );
          this.router.navigate(['/adminmaintenancemodulePF/etapas']);
        }
      });
    this.vidSvc
      .getDataxFiltro('video', (ref) =>
        ref.orderBy('codigoSeccion').orderBy('idEtapa').orderBy('posicionVideo')
      )
      .subscribe((video) => {
        this.dataSource = new MatTableDataSource<VideoModel>(video);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
        this.selection = new SelectionModel<VideoModel>(true, []);
        this.video = video;
        this.dataLength = video.length;
      });
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  applyFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }
  masterToggle() {
    this.isAllSelected()
      ? this.selection.clear()
      : this.dataSource.data.forEach((row) => this.selection.select(row));
  }
  // checkboxLabel(row?: PeriodicElement): string {
  //   if (!row) {
  //     return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
  //   }
  //   return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.position + 1}`;
  // }
  onEditVideo(video: VideoModel) {
    this.openDialog(video);
  }
  onNewVideo() {
    this.openDialog();
  }

  openDialog(video?: any): void {
    if (video) {
      const dialogRef = this.dialog.open(EditVideoComponent, {
        data: { vid: video },
        width: '800px',
        maxHeight: '600px',
        disableClose: true
      });
      dialogRef.afterClosed().subscribe((result) => {
        console.log(`Dialog result ${result}`);
      });
    } else {
      const dialogRef = this.dialog.open(NewVideoComponent, {
        width: '800px',
        maxHeight: '600px',
        disableClose: true
      });
      dialogRef.afterClosed().subscribe((result) => {
        console.log(`Dialog result ${result}`);
      });
    }
  }

  onViewVideo(video: VideoModel) {
    let archivos = '';
    if (video.fileVideo) {
      archivos = `<a href='${video.fileVideo}' target='_blank'>Video</a>,&nbsp;`;
    } else {
      archivos = `No existe video a mostrar,&nbsp;`;
    }
    if (video.fileAdjunto) {
      archivos += `<a href='${video.fileAdjunto}' target='_blank'> Archivo adjunto</a>.`;
    } else {
      archivos += `el archivo adjunto no existe.`;
    }
    Swal.fire({
      title: 'Quieres ver tu video o archivo adjunto!!',
      text: 'Haz click sobre ellos en la parte inferior.',
      icon: 'info',
      timer: 60000,
      timerProgressBar: true,
      showClass: {
        popup: 'animate__animated animate__fadeInDown'
      },
      hideClass: {
        popup: 'animate__animated animate__fadeOutUp'
      },
      footer: `${archivos}`,
      confirmButtonColor: '#d33',
      confirmButtonText: 'Cerrar',
      showCloseButton: true
    });
  }

  onDeleteVideo(tipo?, video?: VideoModel) {
    if (tipo === 1 && this.selection.selected.length === 0) {
      this.snackBar.open(
        'Seleccione el o los videos que desea eliminar.',
        'Cerrar',
        { duration: 3000 }
      );
      return;
    }
    Swal.fire({
      title: 'Estás seguro?',
      text: `No podrás recuperar la información nuevamente!`,
      icon: 'warning',
      input: 'text',
      inputPlaceholder: 'Digite el código',
      showLoaderOnConfirm: true,
      timer: 30000,
      timerProgressBar: true,
      showClass: {
        popup: 'animate__animated animate__fadeInDown'
      },
      hideClass: {
        popup: 'animate__animated animate__fadeOutUp'
      },
      focusCancel: true,
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Si, borrar!',
      cancelButtonText: 'Cancelar',
      width: 350,
      heightAuto: true,
      showCloseButton: true,
      preConfirm: (result) => {
        if (result === 'Fibo612021') {
          if (tipo === 1) {
            this.selection.selected.map((a) => {
              this.video
                .filter(
                  (b) =>
                    b.codigoSeccion === a.codigoSeccion &&
                    b.idEtapa === a.idEtapa &&
                    b.posicionVideo > a.posicionVideo
                )
                .map((element) => {
                  element.posicionVideo -= 1;
                  this.vidSvc.editVideoById(element)
                    .catch(error => {
                      Swal.fire({
                        text: 'Hubo un problema!',
                        icon: 'error',
                        title: 'Oops...',
                        footer: 'Comunicate con soporte!!',
                        showCloseButton: true
                      });
                    });
                });
            });
            this.procesoBorrarS();
            this.selection.clear();
            if (this.selection.select.length === 0) {
              Swal.fire(
                'borrado!',
                'La o las imágenes han sido borradas.',
                'success'
              );
            }
          } else {
            this.video
              .filter(
                (a) =>
                  a.codigoSeccion === video.codigoSeccion &&
                  a.idEtapa === video.idEtapa &&
                  a.posicionVideo > video.posicionVideo
              )
              .map((element) => {
                element.posicionVideo -= 1;
                this.vidSvc.editVideoById(element);
              });
            this.vidSvc.deleteArchivos(video, 2);
            this.vidSvc
              .deleteVideoById(video)
              .then(() => {
                Swal.fire('borrado!', 'Su video a sido borrado.', 'success');
              })
              .catch((error) => {
                console.log(error);
                Swal.fire({
                  text: 'Hubo un problema!',
                  icon: 'error',
                  title: 'Oops...',
                  footer: 'Comunicate con soporte!!',
                  showCloseButton: true
                });
              });
          }
        } else {
          Swal.fire(
            'Error!',
            'Código incorrecto.',
            'error'
          );
        }
      }
    });
  }
  procesoBorrarS() {
    try {
      this.selection.selected.map((a) => {
        this.vidSvc.deleteArchivos(a, 2);
      });
      this.selection.selected.map((a) => {
        this.vidSvc.deleteVideoById(a);
      });
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
}

import { Component, OnInit, ViewChild, AfterViewInit, ViewEncapsulation } from '@angular/core';
import { MatPaginator, MatPaginatorIntl } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';

import { MatDialog } from '@angular/material/dialog';
import { Service } from '../../../shared/services/service';
import { EditImagenComponent } from '../../../components/imagenesAdmin/edit-imagen/edit-imagen.component';
import { NewImagenComponent } from '../../../components/imagenesAdmin/new-imagen/new-imagen.component';
import { Overlay } from '@angular/cdk/overlay';
import { ImagenModel } from '../../../shared/models/imagen';
import Swal from 'sweetalert2';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SelectionModel } from '@angular/cdk/collections';

@Component({
  selector: 'app-list-imagen',
  templateUrl: './list-imagen.component.html',
  styleUrls: ['./list-imagen.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ListImagenComponent implements OnInit, AfterViewInit {
  displayedColumns: string[] = [
    'select',
    'titulo',
    // 'descripcion',
    'nombreImagen',
    'tipoImagen',
    'estado',
    'fechaCreacion',
    'usuarioCreacion',
    'fechaModificacion',
    'usuarioModificacion',
    'actions',
  ];
  dataSource = new MatTableDataSource<ImagenModel>();
  selection = new SelectionModel<ImagenModel>(true, []);
  imagen: ImagenModel;
  dataLength: number;

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  constructor(
    private imgSvc: Service,
    public dialog: MatDialog,
    private overlay: Overlay,
    private snackBar: MatSnackBar, private paginatorE: MatPaginatorIntl) {
    this.paginatorE.itemsPerPageLabel = "Registros por página";
  }

  ngOnInit() {
    this.imgSvc
      .getDataxFiltro('imagen', (ref) => ref.orderBy('fechaCreacion', 'desc'))
      .subscribe((imagen) => {
        this.dataSource = new MatTableDataSource<ImagenModel>(imagen);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
        this.selection = new SelectionModel<ImagenModel>(true, []);
        this.dataLength = imagen.length;
      });
  }

  ngAfterViewInit() { }

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

  onEditImagen(imagen: ImagenModel) {
    this.openDialog(imagen);
  }
  onNewImagen() {
    this.openDialog();
  }

  openDialog(imagen?: any): void {
    if (imagen) {
      const dialogRef = this.dialog.open(EditImagenComponent, {
        data: { img: imagen },
        width: '700px',
        maxHeight: '600px',
        disableClose: true,
        scrollStrategy: this.overlay.scrollStrategies.noop(),
      });
      dialogRef.afterClosed().subscribe((result) => {
        console.log(`Dialog result ${result}`);
      });
    } else {
      const dialogRef = this.dialog.open(NewImagenComponent, {
        width: '700px',
        maxHeight: '600px',
        disableClose: true,
      });
      dialogRef.afterClosed().subscribe((result) => {
        console.log(`Dialog result ${result}`);
      });
    }
  }
  onDeleteImagen(tipo?, image?: ImagenModel) {
    if (tipo === 1 && this.selection.selected.length === 0) {
      this.snackBar.open(
        'Seleccione la o las imágenes que desea eliminar.',
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
        popup: 'animate__animated animate__fadeInDown',
      },
      hideClass: {
        popup: 'animate__animated animate__fadeOutUp',
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
              this.imgSvc.deleteImages('images', a.nombreImagen);
              this.imgSvc
                .deleteImagenById(a)
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
            });
            this.selection.clear();
            if (this.selection.select.length === 0) {
              Swal.fire(
                'borrado!',
                'La o las imágenes han sido borradas.',
                'success'
              );
            }
          } else {
            this.imgSvc.deleteImages('images', image.nombreImagen);
            this.imgSvc
              .deleteImagenById(image)
              .then(() => {
                Swal.fire('borrado!', 'Su imagen a sido borrada.', 'success');
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
}

import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { MatPaginator, MatPaginatorIntl } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { Service } from '../../../shared/services/service';
import { NewActividadComponent } from '../../../components/actividadesAdmin/new-actividad/new-actividad.component';
import { ActividadModel } from '../../../shared/models/actividad';
import Swal from 'sweetalert2';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SelectionModel } from '@angular/cdk/collections';
import { DatePipe } from '@angular/common';
import { EditActividadComponent } from '../edit-actividad/edit-actividad.component';

@Component({
  selector: 'app-list-actividad',
  templateUrl: './list-actividad.component.html',
  styleUrls: ['./list-actividad.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ListActividadComponent implements OnInit {
  displayedColumns: string[] = [
    'select',
    'nombre',
    'fechaActividad',
    'estado',
    'fechaCreacion',
    'usuarioCreacion',
    'fechaModificacion',
    'usuarioModificacion',
    'actions',
  ];
  dataSource = new MatTableDataSource<ActividadModel>();
  selection = new SelectionModel<ActividadModel>(true, []);
  actividad: ActividadModel[] = [];
  dataLength: number;

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  constructor(
    private actSvc: Service,
    public dialog: MatDialog,
    private snackBar: MatSnackBar,
    private datePipe: DatePipe, private paginatorE: MatPaginatorIntl) {
    this.paginatorE.itemsPerPageLabel = "Registros por página";
  }

  ngOnInit() {
    this.actSvc
      .getDataxFiltro('actividad', (ref) => ref.orderBy('fechaActividad', 'desc'))
      .subscribe((actividad) => {
        this.actividad = actividad;
        this.dataSource = new MatTableDataSource<ActividadModel>(actividad);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
        this.selection = new SelectionModel<ActividadModel>(true, []);
        this.dataLength = actividad.length;
      });
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

  onEdit_View_Actividad(actividad: ActividadModel) {
    this.openDialog(actividad);
  }
  onNewActividad() {
    this.openDialog();
  }

  openDialog(actividad?: any): void {
    if (actividad) {
      const dialogRef = this.dialog.open(EditActividadComponent, {
        data: { acti: actividad },
        width: '800px',
        maxHeight: '600px'
      });
      dialogRef.afterClosed().subscribe((result) => {
        console.log(`Dialog result ${result}`);
      });
    } else {
      const dialogRef = this.dialog.open(NewActividadComponent, {
        width: '800px',
        maxHeight: '600px'
      });
      dialogRef.afterClosed().subscribe((result) => {
        console.log(`Dialog result ${result}`);
      });
    }
  }
  onDeleteActividad(tipo?, actividad?: ActividadModel) {
    if (tipo === 1 && this.selection.selected.length === 0) {
      this.snackBar.open(
        'Seleccione la o las actividades que desea eliminar.',
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
              this.actSvc
                .deleteActividadById(a)
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
                'La o las actividades han sido borradas.',
                'success'
              );
            }
          } else {
            this.actSvc
              .deleteActividadById(actividad)
              .then(() => {
                Swal.fire('borrado!', 'Su actividad a sido borrada.', 'success');
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


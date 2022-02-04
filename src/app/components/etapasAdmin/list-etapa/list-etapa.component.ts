import { Component, OnInit, ViewChild, AfterViewInit, ViewEncapsulation } from '@angular/core';
import { MatPaginator, MatPaginatorIntl } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';

import { MatDialog } from '@angular/material/dialog';
import { EtapaModel } from '../../../shared/models/etapa';
import { Service } from '../../../shared/services/service';
import { EditEtapaComponent } from '../../../components/etapasAdmin/edit-etapa/edit-etapa.component';
import { NewEtapaComponent } from '../../../components/etapasAdmin/new-etapa/new-etapa.component';
import { Overlay } from '@angular/cdk/overlay';

@Component({
  selector: 'app-list-etapa',
  templateUrl: './list-etapa.component.html',
  styleUrls: ['./list-etapa.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ListEtapaComponent implements OnInit, AfterViewInit {
  displayedColumns: string[] = ['descripcion', 'nombreSeccion', 'nombreEtapa', 'estado', 'fechaCreacion', 'usuarioCreacion',
    'fechaModificacion', 'usuarioModificacion', 'actions'];
  dataSource = new MatTableDataSource();
  etapa: EtapaModel;
  dataLength: number;

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  constructor(private etapSvc: Service, public dialog: MatDialog, private overlay: Overlay, private paginatorE: MatPaginatorIntl) {
    this.paginatorE.itemsPerPageLabel = "Registros por página";
  }

  ngOnInit() {
    this.etapSvc
      .getDataxFiltro('etapa', (ref) =>
        ref
          .orderBy('codigoSeccion')
          .orderBy('idEtapa')
      )
      .subscribe(etapa => {
        this.dataSource.data = etapa;
        this.dataLength = etapa.length;
      });
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  applyFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }
  onEditEtapa(etapa: EtapaModel) {
    this.openDialog(etapa);
  }
  onNewEtapa() {
    this.openDialog();
  }

  openDialog(etapa?: any): void {
    if (etapa) {
      const dialogRef = this.dialog.open(EditEtapaComponent, {
        data: { etp: etapa },
        maxHeight: '600px',
        scrollStrategy: this.overlay.scrollStrategies.noop()
      });
      dialogRef.afterClosed().subscribe(result => {
        console.log(`Dialog result ${result}`);
      });
    } else {
      const dialogRef = this.dialog.open(NewEtapaComponent, {
        maxHeight: '600px'
      });
      dialogRef.afterClosed().subscribe(result => {
        console.log(`Dialog result ${result}`);
      });
    }

  }
}

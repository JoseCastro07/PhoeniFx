import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { MatPaginator, MatPaginatorIntl } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';

import Swal from 'sweetalert2';
import { AuthService } from '../../../shared/services/auth.service';

import { MatDialog } from '@angular/material/dialog';
import { UsuarioModel } from '../../../shared/models/usuario';
import { Service } from '../../../shared/services/service';
import { EditUsuarioComponent } from '../../../components/usuariosAdmin/edit-usuario/edit-usuario.component';
import { NewUsuarioComponent } from '../../../components/usuariosAdmin/new-usuario/new-usuario.component';
import { ProcessUsuarioComponent } from '../process-usuario/process-usuario.component';
import { FormGroup, FormControl } from '@angular/forms';
import { merge, Observable } from 'rxjs';

@Component({
  selector: 'app-list-usuario',
  templateUrl: './list-usuario.component.html',
  styleUrls: ['./list-usuario.component.scss']
})
export class ListUsuarioComponent implements OnInit, AfterViewInit {
  displayedColumns: string[] = ['photoURL', 'nombre', 'email', 'estado', 'rol', 'tipoPlan', 'codigoR', 'tipoPago', 'fechaPago', 'fechaVencimientoPago', 'fechaCreacion', 'fechaUltimaVisita', 'usuarioCreacion',
    'fechaModificacion', 'usuarioModificacion', 'actions', 'state'];
  dataSource = new MatTableDataSource();
  dataLength: number;
  select = 'Quitar Seleccionados';
  checked = true;
  indeterminate: boolean = false;


  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  form: FormGroup = new FormGroup({
    nombre: new FormControl(true),
    email: new FormControl(true),
    estado: new FormControl(true),
    rol: new FormControl(true),
    tipoPlan: new FormControl(true),
    codigoR: new FormControl(true),
    tipoPago: new FormControl(true),
    fechaPago: new FormControl(true),
    fechaVencimientoPago: new FormControl(true),
    fechaUltimaVisita: new FormControl(true),
    fechaCreacion: new FormControl(true),
    usuarioCreacion: new FormControl(true),
    fechaModificacion: new FormControl(true),
    usuarioModificacion: new FormControl(true),
    actions: new FormControl(true),
  });

  columnDefinitions = [
    { def: 'nombre', label: 'Usuario', hide: true },
    { def: 'email', label: 'Correo', hide: true },
    { def: 'estado', label: 'Estado de Pago', hide: true },
    { def: 'rol', label: 'Rol', hide: true },
    { def: 'tipoPlan', label: 'Tipo de Plan', hide: true },
    { def: 'codigoR', label: 'Código de Referido', hide: true },
    { def: 'tipoPago', label: 'Tipo de Pago', hide: true },
    { def: 'fechaPago', label: 'Fecha de Pago', hide: true },
    { def: 'fechaVencimientoPago', label: 'Fecha de Vencimiento de Pago', hide: true },
    { def: 'fechaUltimaVisita', label: 'Fecha de Última Visita', hide: true },
    { def: 'fechaCreacion', label: 'Fecha Creación', hide: true },
    { def: 'usuarioCreacion', label: 'Usuario Creación', hide: true },
    { def: 'fechaModificacion', label: 'Fecha Modificación', hide: true },
    { def: 'usuarioModificacion', label: 'Usuario Modificación', hide: true },
    { def: 'actions', label: 'Acción', hide: true },
  ]

  constructor(private usuSvc: Service, public dialog: MatDialog, private authSvc: AuthService, private paginatorE: MatPaginatorIntl) {
    this.paginatorE.itemsPerPageLabel = "Registros por página";
  }
  ngOnInit() {
    this.onRefresh();
    this.refrescarEstados();

  }
  refrescarEstados() {
    setInterval(() => {
      this.onRefresh();
    }, 30000);
  }

  onRefresh() {
    this.usuSvc
      .getDataxFiltro('usuario', (ref) =>
        ref.orderBy('fechaPago'))
      .subscribe(usuario => {
        this.dataSource.data = usuario;
        this.dataSource.data.map(d => {
          this.authSvc.estadoUsuario(d['uid']).then(datos => {
            if (datos === null) {
              d['fechaUltimaVisita'] = d['fechaCreacion'];
              d['state'] = 'offline';
              return;
            }
            d['fechaUltimaVisita'] = datos.fechaEstado;
            d['state'] = datos.state;
          });
        });
        this.dataLength = usuario.length;
      });
  }

  getDisplayedColumns(): string[] {
    return this.columnDefinitions.filter(cd => cd.hide).map(cd => cd.def);
  }
  allSelected() {
    if (!this.checked) {
      this.indeterminate = false;
      this.select = 'Seleccionar Todos';
      this.columnDefinitions.map(c => {
        c.hide = false;
      });
      Object.keys(this.form.controls).forEach(key => {
        this.form.controls[key].setValue(false);
      });
    } else {
      this.indeterminate = false;
      this.select = 'Quitar Seleccionados';
      this.columnDefinitions.map(c => {
        c.hide = true;
      });
      Object.keys(this.form.controls).forEach(key => {
        this.form.controls[key].setValue(true);
      });
    }
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;

    let o1: Observable<boolean> = this.form.get('nombre').valueChanges;
    let o2: Observable<boolean> = this.form.get('email').valueChanges;
    let o3: Observable<boolean> = this.form.get('estado').valueChanges;
    let o4: Observable<boolean> = this.form.get('rol').valueChanges;
    let o5: Observable<boolean> = this.form.get('tipoPlan').valueChanges;
    let o6: Observable<boolean> = this.form.get('codigoR').valueChanges;
    let o7: Observable<boolean> = this.form.get('tipoPago').valueChanges;
    let o8: Observable<boolean> = this.form.get('fechaPago').valueChanges;
    let o9: Observable<boolean> = this.form.get('fechaVencimientoPago').valueChanges;
    let o10: Observable<boolean> = this.form.get('fechaUltimaVisita').valueChanges;
    let o11: Observable<boolean> = this.form.get('fechaCreacion').valueChanges;
    let o12: Observable<boolean> = this.form.get('usuarioCreacion').valueChanges;
    let o13: Observable<boolean> = this.form.get('fechaModificacion').valueChanges;
    let o14: Observable<boolean> = this.form.get('usuarioModificacion').valueChanges;
    let o15: Observable<boolean> = this.form.get('actions').valueChanges;

    merge(o1, o2, o3, o4, o5, o6, o7, o8, o9, o10, o11, o12, o13, o14, o15).subscribe(v => {
      this.columnDefinitions[0].hide = this.form.get('nombre').value;
      this.columnDefinitions[1].hide = this.form.get('email').value;
      this.columnDefinitions[2].hide = this.form.get('estado').value;
      this.columnDefinitions[3].hide = this.form.get('rol').value;
      this.columnDefinitions[4].hide = this.form.get('tipoPlan').value;
      this.columnDefinitions[5].hide = this.form.get('codigoR').value;
      this.columnDefinitions[6].hide = this.form.get('tipoPago').value;
      this.columnDefinitions[7].hide = this.form.get('fechaPago').value;
      this.columnDefinitions[8].hide = this.form.get('fechaVencimientoPago').value;
      this.columnDefinitions[9].hide = this.form.get('fechaUltimaVisita').value;
      this.columnDefinitions[10].hide = this.form.get('fechaCreacion').value;
      this.columnDefinitions[11].hide = this.form.get('usuarioCreacion').value;
      this.columnDefinitions[12].hide = this.form.get('fechaModificacion').value;
      this.columnDefinitions[13].hide = this.form.get('usuarioModificacion').value;
      this.columnDefinitions[14].hide = this.form.get('actions').value;


      if (this.columnDefinitions.filter(t => t.hide).length > 0 && this.columnDefinitions.filter(t => !t.hide).length > 0) {
        this.select = 'Seleccionar Todos';
        this.indeterminate = true;
        this.checked = false;
      }
      if (this.columnDefinitions.filter(t => !t.hide).length === 0) {
        this.select = 'Quitar Seleccionados';
        this.indeterminate = false;
        this.checked = true;
      }
      if (this.columnDefinitions.filter(t => t.hide).length === 0) {
        this.select = 'Seleccionar Todos';
        this.checked = false;
        this.indeterminate = false;
      }
    });
  }
  applyFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }
  onEditUsuario(usuario: UsuarioModel) {
    this.openDialog(usuario);
  }
  onViewProceso(usuario: UsuarioModel) {
    this.openDialog(usuario, 1);
  }

  onDeleteUsuario(usuario: UsuarioModel) {
    Swal.fire({
      title: 'Estás seguro?',
      text: `No podrás recuperar la información nuevamente!`,
      icon: 'warning',
      focusCancel: true,
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Si, borrar!',
      cancelButtonText: 'Cancelar',
      timer: 30000,
      timerProgressBar: true,
      showCloseButton: true
    }).then(result => {
      if (result.value) {
        //  this.authSvc.deleteEmailUsu(usuario);
        this.usuSvc.deleteUsuarioById(usuario).then(() => {
          Swal.fire('Borrado!', 'Su usuario a sido borrado.', 'success');
        }).catch((error) => {
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
    });

  }
  onNewUsuario() {
    this.openDialog();
  }

  openDialog(usuario?: any, tipo?: number): void {
    if (tipo) {
      const dialogRef = this.dialog.open(ProcessUsuarioComponent, {
        data: { user: usuario },
        width: '600px',
        maxHeight: '600px'
      });
      dialogRef.afterClosed().subscribe(result => {
        console.log(`Dialog result ${result}`);
      });
    } else {
      if (usuario) {
        const dialogRef = this.dialog.open(EditUsuarioComponent, {
          data: { user: usuario },
          width: '700px',
          maxHeight: '600px'
        });
        dialogRef.afterClosed().subscribe(result => {
          console.log(`Dialog result ${result}`);
        });
      } else {
        const dialogRef = this.dialog.open(NewUsuarioComponent, {
          width: '720px',
          maxHeight: '600px'
        });
        dialogRef.afterClosed().subscribe(result => {
          console.log(`Dialog result ${result}`);
        });
      }
    }
  }
}

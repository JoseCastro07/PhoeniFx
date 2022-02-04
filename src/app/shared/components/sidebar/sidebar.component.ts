import { Component, Output, EventEmitter, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { NotificacionesAdminComponent } from 'src/app/components/notificaciones-admin/notificaciones-admin.component';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit {
  isActive: boolean;
  collapsed: boolean;
  showMenu: number;
  pushRightClass: string;
  public sideMenu: Array<any> = [];

  @Output() collapsedEvent = new EventEmitter<boolean>();
  @Output() evento = new EventEmitter<boolean>();

  constructor(public router: Router,
    public dialog: MatDialog) {
    this.router.events.subscribe(val => {
      if (val instanceof NavigationEnd && window.innerWidth <= 992 && this.isToggled()) {
        this.toggleSidebar();
      }
    });
    this.sideMenu.push(
      {
        link: 'usuarios',
        titulo: 'Usuarios',
        icono: 'account_circle'
      },
      {
        link: 'etapas',
        titulo: 'Etapas',
        icono: 'menu'
      },
      {
        link: 'videos',
        titulo: 'Videos',
        icono: 'play_circle_filled'
      },
      {
        link: 'imagenes',
        titulo: 'Imagenes',
        icono: 'add_photo_alternate'
      },
      {
        link: 'actividades',
        titulo: 'Actividades',
        icono: 'note_add'
      },
      {
        link: 'notificaciones',
        titulo: 'Notificaciones',
        icono: 'notifications'
      }
    );
  }

  ngOnInit() {
    this.isActive = false;
    this.collapsed = false;
    this.showMenu = 0;
    this.pushRightClass = 'push-right';
  }

  eventCalled() {
    this.isActive = !this.isActive;
  }

  addExpandClass(element: any) {
    if (element === this.showMenu) {
      this.showMenu = 0;
    } else {
      this.showMenu = element;
    }
  }

  toggleCollapsed() {
    this.collapsed = !this.collapsed;
    this.collapsedEvent.emit(this.collapsed);
  }
  eventoE() {
      this.evento.emit(true);
  }
  openDialog(): void {    
    const dialogRef = this.dialog.open(NotificacionesAdminComponent, {
      width: '800px',
      maxHeight: '600px'
    });
    dialogRef.afterClosed().subscribe((result) => {
      console.log(`Dialog result ${result}`);
    });
  }

  isToggled(): boolean {
    const dom: Element = document.querySelector('body');
    return dom.classList.contains(this.pushRightClass);
  }

  toggleSidebar() {
    const dom: any = document.querySelector('body');
    dom.classList.toggle(this.pushRightClass);
  }

  rltAndLtr() {
    const dom: any = document.querySelector('body');
    dom.classList.toggle('rtl');
  }
}

import { Component, OnInit, ViewEncapsulation, Input } from '@angular/core';
import { Service } from '../../../shared/services/service';
import { ImagenModel } from '../../../shared/models/imagen';
import { MatDialog } from '@angular/material/dialog';
import { ContactComponent } from '../contact/contact.component';
import { AuthService } from '../../../shared/services/auth.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class HomeComponent implements OnInit {
  imagenesN: ImagenModel[] = [];
  imagenesT: ImagenModel[] = [];
  iframe: string = 'https://s.tradingview.com/embed-widget/forex-cross-rates/?locale=es#%7B%22width%22%3A%221000%22%2C%22height%22%3A%22400%22%2C%22currencies%22%3A%5B%22EUR%22%2C%22USD%22%2C%22JPY%22%2C%22GBP%22%2C%22CHF%22%2C%22AUD%22%2C%22CAD%22%2C%22NZD%22%2C%22CNY%22%5D%2C%22isTransparent%22%3Afalse%2C%22colorTheme%22%3A%22dark%22%2C%22utm_source%22%3A%22tradinglabfx.com%22%2C%22utm_medium%22%3A%22widget_new%22%2C%22utm_campaign%22%3A%22forex-cross-rates%22%7D';
  divisa: string = 'https://es.tradingview.com/markets/currencies/forex-cross-rates';
  link: boolean;
  constructor(private hmSvc: Service, public dialog: MatDialog, public authSvc: AuthService) { }

  ngOnInit() {
    document.onkeydown = (event) => {
      if (event.code === 'F12') {
        return false;
      } else {
        if (event.ctrlKey && event.keyCode === 85) {
          return false;
        } else {
          if (event.ctrlKey && event.shiftKey) {
            return false;
          }
          else {
            return true;
          }
        }
      }
    };

    this.authSvc.getUser().then((data) => {
      if (data !== null && localStorage.getItem("loginInfo")) {
        this.link = true;
      } else {
        this.link = false;
      }
    });

    this.hmSvc
      .getDataxFiltro('imagen', (ref) =>
        ref
          .where('estado', '==', true)
          .orderBy('fechaCreacion', 'desc')
      )
      .subscribe((response) => {
        this.imagenesN = response.filter(n => n.tipoImagen === 1);
        this.imagenesT = response.filter(n => n.tipoImagen === 2);

      });
  }
  cambiarEstado(estado) {
    this.link = estado;
  }
  sendInfo() {
    const dialogRef = this.dialog.open(ContactComponent, {
      data: { tipo: 1 },
      width: '400px',
      disableClose: true,
      maxHeight: '600px'
    });
    dialogRef.afterClosed().subscribe((result) => {
      console.log(`Dialog result ${result}`);
    });
  }
}

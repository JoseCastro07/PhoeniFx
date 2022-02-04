import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-container-app',
  templateUrl: './container-app.component.html',
  styleUrls: ['./container-app.component.scss']
})
export class ContainerAppComponent implements OnInit {

  constructor(public router: Router) { }

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
  }

}

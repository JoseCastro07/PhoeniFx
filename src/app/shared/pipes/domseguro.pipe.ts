import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

@Pipe({
  name: 'domseguro'
})
export class DomseguroPipe implements PipeTransform {
  constructor(private domSanatizer: DomSanitizer) {}
  transform(url: string): unknown {
    return this.domSanatizer.bypassSecurityTrustResourceUrl(url);
  }

}

import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'split'
})
export class SplitPipe implements PipeTransform {

  transform(text: string, by: string, index: number, tipo: number) {
    if (text === undefined) {
      return ''; 
    }
    const arr = text.split(by);
    if (tipo === 1) {
      if (arr[index] !== undefined) {
        return arr[index].substring(1, arr[index].length);
      }
    }
    if (tipo === 2) {
      if (arr[0] !== undefined && index >= 0) {
        text = '';
        arr.map((a, i) => {
          if (i === 0) {
            text += a;
          } else {
            if (i <= index) {
              text += ' ' + a;
            }
          }
        });
        return text;
      }
    }
    return text;
  }
}

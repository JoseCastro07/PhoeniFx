import { Component, OnInit, Inject } from '@angular/core';
import { Service } from '../../../shared/services/service';
import { Dias, PlanTradingModel, TipoOperacion } from '../../../shared/models/planTrading';
import { FormGroup, FormControl, FormArray } from '@angular/forms';
import { UsuarioModel } from '../../../shared/models/usuario';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-plan-usuario',
  templateUrl: './plan-usuario.component.html',
  styleUrls: ['./plan-usuario.component.scss']
})
export class PlanUsuarioComponent implements OnInit {
  datos: PlanTradingModel = null;
  dias = new Dias().dias;;
  tipoOperaciones = new TipoOperacion().tipos;
  usuario: UsuarioModel;
  constructor(private pltSvc: Service, public dialogRef: MatDialogRef<PlanUsuarioComponent>, @Inject(MAT_DIALOG_DATA) public data: any) { this.usuario = data.user; }

  ngOnInit(): void {
    this.pltSvc
      .getDataxFiltro('planTrading', (ref) =>
        ref.where('uid', '==', this.usuario.uid)
          .orderBy('fechaCreacion', 'desc')
      )
      .subscribe((responseP) => {
        if (responseP.length > 0) {
          this.datos = responseP[0];
          this.initValuesActForm();
        } 
      });
  }

  public addPlanTradingForm = new FormGroup({
    tipoTrader: new FormControl({ value: '', disabled: true }),
    paresPreferidos: new FormControl({ value: '', disabled: true }),
    sistema: new FormControl({ value: '', disabled: true }),
    reglas: new FormControl({ value: '', disabled: true }),
    riesgo: new FormControl({ value: '', disabled: true }),
    diasOperacion: new FormArray([]),
    meta: new FormControl({ value: 0, disabled: true }),
    horasB: new FormControl({ value: 0, disabled: true }),
    horasE: new FormControl({ value: 0, disabled: true }),
    fortalezas: new FormControl({ value: '', disabled: true }),
    creencia: new FormControl({ value: '', disabled: true }),
    controlTrade: new FormArray([]),
    controlNote: new FormArray([]),
    id: new FormControl()
  });

  private initValuesActForm(): void {
    this.addPlanTradingForm.patchValue({
      tipoTrader: this.datos.tipoTrader,
      paresPreferidos: this.datos.paresPreferidos,
      sistema: this.datos.sistema,
      reglas: this.datos.reglas,
      riesgo: this.datos.riesgo,
      diasOperacion: this.datos.diasOperacion,
      meta: this.datos.meta,
      horasB: this.datos.horasB,
      horasE: this.datos.horasE,
      fortalezas: this.datos.fortalezas,
      creencia: this.datos.creencia,
      controlTrade: this.datos.controlTrade,
      controlNote: this.datos.controlNote,
      id: this.datos.id
    });
    const diasB: any = this.datos.diasOperacion;
    diasB.map(dB => {
      this.dias.map((d, index) => {
        if (d.id === dB.id) {
          d.estado = true;
          this.dias[index] = d;
        }
      });
    });
    if (this.datos.controlTrade.length > 0) {
      this.datos.controlTrade.map(a => {
        (this.addPlanTradingForm.get('controlTrade') as FormArray).push(new FormGroup({
          id: new FormControl(a.id),
          divisa: new FormControl({ value: a.divisa, disabled: true }),
          tipoOperacion: new FormControl({ value: a.tipoOperacion, disabled: true }),
          puntoEntrada: new FormControl({ value: a.puntoEntrada, disabled: true }),
          takeProfit: new FormControl({ value: a.takeProfit, disabled: true }),
          stopLoss: new FormControl({ value: a.stopLoss, disabled: true })
        }));
      });
    }

    if (this.datos.controlNote.length > 0) {
      this.datos.controlNote.map(a => {
        (this.addPlanTradingForm.get('controlNote') as FormArray).push(new FormGroup({
          id: new FormControl(a.id),
          title: new FormControl({ value: a.title, disabled: true }),
          note: new FormControl({ value: a.note, disabled: true }),
          fechaNota: new FormControl({ value: a.fechaNota, disabled: true })
        }));
      });
    }
  }

  getControlsT() {
    return (this.addPlanTradingForm.get('controlTrade') as FormArray).controls;
  }

  getControlsN() {
    return (this.addPlanTradingForm.get('controlNote') as FormArray).controls;
  }
}


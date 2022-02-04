export class PlanTradingModel {
    tipoTrader?: string;
    paresPreferidos?: string;
    sistema?: string;
    reglas?: string;
    riesgo?: string;
    diasOperacion?: Dias;
    meta?: number;
    horasB?: number;
    horasE?: number;
    fortalezas?: string;
    creencia?: string;
    controlTrade?: ControlTrade[];
    controlNote?: ControlNote[];
    fechaCreacion?: Date;
    fechaModificacion?: Date;
    usuarioCreacion?: string;
    usuarioModificacion?: string;
    uid?: string;
    id?: string;
}


export class Dias {
    dias = [
        {
            id: 1,
            descripcion: 'Lunes',
            estado: false
        },
        {
            id: 2,
            descripcion: 'Martes',
            estado: false
        },
        {
            id: 3,
            descripcion: 'Miércoles',
            estado: false
        },
        {
            id: 4,
            descripcion: 'Jueves',
            estado: false
        },
        {
            id: 5,
            descripcion: 'Viernes',
            estado: false
        }
    ];
}
export class ControlTrade {
    divisa?: string;
    tipoOperacion?: number;
    puntoEntrada?: string;
    takeProfit?: string;
    stopLoss?: string;
    id?: string;
}


export class TipoOperacion {
    tipos = [
        {
            id: 1,
            descripcion: 'Buy'
        },
        {
            id: 2,
            descripcion: 'Sell'
        },
        {
            id: 3,
            descripcion: 'Buy Limit'
        },
        {
            id: 4,
            descripcion: 'Sell Limit'
        },
        {
            id: 5,
            descripcion: 'Buy Stop'
        },
        {
            id: 6,
            descripcion: 'Sell Stop'
        }
    ];
}

export class ControlNote {
    title?: string;
    note?: string;
    fechaNota?: string;
    id?: string;
}


export class PagoUsuarioModel {
    uid?: string;
    fechaCreacion?: Date;
    usuarioCreacion?: string;
    create_time?: Date;
    idPaypal?: string;
    payee?: any;
    tipoPlan?: string;
    payer: Payer;
    address: Address
    payment: Payment;
    id?: string;
}


export class Payer {
    address?: any;
    email_address?: string;
    name?: any;
    payer_id?: string;
}


export class Address {
    address_line_1?: string;
    admin_area_1?: string;
    admin_area_2?: string;
    country_code?: string;
    postal_code?: string;
}

export class Payment {
    amount?: any;
    create_time?: Date;
    idPayment?: string;
}
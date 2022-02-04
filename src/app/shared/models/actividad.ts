export class ActividadModel {
    nombre: string;
    descripcion: string;
    // descripcionHora: string;
    estado: boolean;
    tipo?: number;
    fechaActividad: Date;
    fechaCreacion?: Date;
    fechaModificacion?: Date;
    usuarioCreacion?: string;
    usuarioModificacion?: string;
    id?: string;
    controlUrls?: ControlUrls[];
}

export class ControlUrls {
    hora: string;
    horaD: number;
    minutoD: number;
    url: string;
    descripcion: string;
    id: string;
}

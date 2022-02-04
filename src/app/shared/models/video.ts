export class VideoModel {
  nombre: string;
  descripcion: string;
  codigoSeccion: number;
  nombreSeccion: string;
  idEtapa: number;
  nombreEtapa: string;
  fechaCreacion?: Date;
  fechaModificacion?: Date;
  usuarioCreacion?: string;
  usuarioModificacion?: string;
  estado?: boolean;
  id?: string;
  fileVideo?: string;
  fileAdjunto?: string;
  posicionVideo?: number;
  nombreVideo?: string;
  nombreAdjunto?: string;
  posicionVPantalla?: number;
  posicionVEtapa?: number;
  estadoVideo?: boolean;
  controlLink?: ControlLink[];
}

export class ControlLink {
  id: string;
  nombre: string;
  url: string;
}


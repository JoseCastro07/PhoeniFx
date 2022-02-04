export class EtapaModel {
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
  totalVideosE?: number;
  totalVistosE?: number;
}


export class Secciones {
  secciones = [
    {
      id: 1,
      descripcion: 'seccionTrading'
    },
    {
      id: 2,
      descripcion: 'seccionEducación'
    },
    {
      id: 3,
      descripcion: 'seccionDesarrollo'
    },
    {
      id: 4,
      descripcion: 'seccionWebinar'
    }
  ];
}

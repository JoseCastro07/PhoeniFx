export class NotificacionModel {
    fechaCreacion?: Date;
    fechaModificacion?: Date;
    usuarioCreacion?: string;
    usuarioModificacion?: string;
    id?: string;
    controlNotification?: ControlNotification[];
}

export class ControlNotification {
    title: string;
    message: string;
    style: number;
    estado: boolean;
    id: string;
}



export class Styles {
    styles = [
      {
        id: 1,
        descripcion: 'Información'
      },
      {
        id: 2,
        descripcion: 'Éxito'
      },
      {
        id: 3,
        descripcion: 'Advertencia'
      },
      {
        id: 4,
        descripcion: 'Error'
      }
    ];
  }
  
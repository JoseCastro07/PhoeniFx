export class ImagenModel {
    titulo: string;
    descripcion: string;
    nombreImagen: string;
    urlImagen?: string;
    fechaCreacion?: Date;
    fechaModificacion?: Date;
    usuarioCreacion?: string;
    usuarioModificacion?: string;
    estado?: boolean;
    id?: string;
    tipoImagen: number;
    urlA?: string;
    tipoE?: string;
  }

  export class TipoImagenes {
    tipos = [
      {
        id: 1,
        descripcion: 'imagenNoticia'
      },
      {
        id: 2,
        descripcion: 'imagenTestimonio'
      },
      {
        id: 3,
        descripcion: 'análisis'
      }
    ];
  }

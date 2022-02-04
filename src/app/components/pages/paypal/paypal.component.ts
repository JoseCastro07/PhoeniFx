import { Component, OnInit, Inject, ViewChild, ElementRef, ViewEncapsulation } from '@angular/core';
import { Service } from '../../../shared/services/service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../../../shared/services/auth.service';
import { MatDialog, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { UsuarioModel } from 'src/app/shared/models/usuario';
import { CorreoModel } from '../../../shared/models/correo';
import Swal from 'sweetalert2';
import { PagoUsuarioModel } from '../../../shared/models/pagoUsuario';

declare var paypal;
@Component({
  selector: 'app-paypal',
  templateUrl: './paypal.component.html',
  styleUrls: ['./paypal.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class PaypalComponent implements OnInit {
  usuario: UsuarioModel;
  correo = new CorreoModel();
  tipo: number;
  procesando: boolean = false;
  tipoPlan: string;
  precio: number;
  @ViewChild('paypal', { static: true }) paypalElement: ElementRef;
  order: any;
  pagoUsuarioObj: PagoUsuarioModel = null;
  constructor(
    private paySvc: Service,
    private snackBar: MatSnackBar,
    public authSvc: AuthService,
    public dialogRef: MatDialogRef<PaypalComponent>,
    public dialog: MatDialog,
    public router: Router,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.usuario = data.usu;
    this.tipo = data.tipo;
  }

  ngOnInit(): void {
    if (this.usuario.tipoPlan === '01sta1') {
      this.tipoPlan = 'Plan Standard';
      this.precio = 550;
    } else {
      this.tipoPlan = 'Plan Premium';
      this.precio = 950;
    }
    paypal
      .Buttons({
        style: {
          color: 'gold', label: 'pay', shape: 'pill'
        },
        createOrder: (data, actions) => {
          return actions.order.create({
            purchase_units: [
              {
                description: this.tipoPlan,
                amount: {
                  currency_code: 'USD',
                  value: this.precio
                }
              }
            ]
          });
        },
        onApprove: async (_data: any, actions: { order: { capture: () => any; }; }) => {
          this.procesando = true;
          this.order = await actions.order.capture();
          // console.log(this.order);
          if (this.order.status === 'COMPLETED') {
            this.guardarCambios();
          }
        },
        onError: (err: any) => {
          //console.log(err.message);
          if (this.tipo === 2) {
            this.usuario.id = 'No existe';
          }
          var controlError = {
            ubicacionError: "Módulo Paypal",
            descripcion: err.message.replace(/(\r\n|\n|\r)/gm, ''),
            email: this.usuario.email,
            fechaCreacion: new Date(),
            usuarioCreacion: this.usuario.nombre,
            idTipoColeccion: this.usuario.id
          };
          this.paySvc.preAddUpdateControlError(controlError);
          Swal.fire({
            text: 'Hubo un problema.',
            icon: 'error',
            title: 'Oops...',
            footer: 'Contacta a soporte.',
            showCloseButton: true
          });
          this.procesando = false;
        }
      })
      .render(this.paypalElement.nativeElement);
  }

  guardarCambios() {

    if (this.tipo === 1) {
      this.paySvc.editUsuarioById(this.usuario);
      this.guardarPagoUsuario();

      // correo al cliente
      this.correo.name = 'PhoeniFx';
      this.correo.emailF = '';
      this.correo.emailT = this.usuario.email;
      this.correo.subject = 'Renovación Membresía';
      this.correo.message = `<p>
      Hola de parte del Equipo de <strong>PhoeniFx</strong> te agradecemos por la confianza de renovar tu membresía.</p>
        `;
      this.correo.fechaCreacion = new Date();
      this.correo.estado = 'pendiente';
      this.paySvc.AddCorreo(this.correo);

      // correo a phoeniFx
      this.correo.name = this.usuario.nombre;
      this.correo.emailF = this.usuario.email;
      this.correo.emailT = '';
      this.correo.subject = 'Renovación Plan Cliente';
      this.correo.message = `<p>Se ha Renovado la membresía del usuario <strong>${this.usuario.nombre}</strong> con el correo: <strong>${this.usuario.email}</strong> y tipo de plan: <strong>${this.tipoPlan}</strong><p>`;
      this.correo.fechaCreacion = new Date();
      this.correo.estado = 'pendiente';
      this.paySvc.AddCorreo(this.correo);

      this.snackBar.open(
        `Membresía renovada con éxito!!`,
        'Cerrar',
        {
          duration: 10000,
        }
      );
      this.procesando = false;
      this.router.navigate(['/home']);
      this.dialogRef.close();
    } else {
      let mensaje = '';

      this.authSvc
        .addEmailUsu(this.usuario)
        .then((res) => {
          this.usuario.uid = res.user.uid;
          this.paySvc.preAndUpdateUsuario(this.usuario, 1);
          this.guardarPagoUsuario();
        }).catch((err) => {
          console.log('Error', err);
          let error = 'Contacta a soporte';
          if (err.code === 'auth/email-already-in-use') {
            error = 'Este correo ya está en uso. Prueba con otro.';
          }
          this.procesando = false;
          Swal.fire({
            text: 'Hubo un problema!',
            icon: 'error',
            title: 'Oops...',
            footer: error,
            showCloseButton: true
          });
          return;
        });

      // correo al cliente
      this.correo.name = 'PhoeniFx';
      this.correo.emailF = '';
      this.correo.emailT = this.usuario.email;
      this.correo.subject = 'Bienvenido a  PhoeniFx';
      this.correo.message = `<p>De parte de <strong>PhoeniFx</strong> es un placer darte la bienvenida <strong>${this.usuario.nombre}</strong> a nuestra comunidad educativa, sabemos que vas a crecer junto a nosotros. </p>
      <p>Queremos informarte que tu cuenta se ha creado con éxito y a continuación te detallamos la información de esta. </p>
      <h4>
        <strong>Usuario: ${this.usuario.email}</strong>
      </h4>
      <h4>
        <strong>Contraseña: ${this.usuario.password}</strong>
      </h4>
      <p>
        <strong>PRIMEROS PASOS A SEGUIR:</strong>
      </p>
      <p>
        <strong>PASO 1:</strong>
        <a href=' https://www.youtube.com/watch?v=kopz9Tm9nCI' target='_blank'> Ver el video de inducción a la academia (servicios, uso, sistema de trabajo)</a>
      </p>
      <p>
        <strong>PASO 2:</strong> Ingresar con tu usuario y contraseña en la página web <a href='https://phoenifx.com/' target='_blank'>www.phoenifx.com</a>
      </p>
      <p>
        <strong>PASO 3:</strong> Escribir al número de WhatsApp <strong>+506 86832651 </strong> (para recibir el acceso a canales de telegram).
      </p>
      <p>
        <strong>PASO 4:</strong>
        <a href='https://drive.google.com/file/d/1YVhifJCl3DHpLwnCRpmfyYQuzZHbaEy0/view?usp=sharing' target='_blank'>Descargar la guía de estudio</a>
      </p>
      <p>
        <strong>PASO 5:</strong> Para consultas de soporte técnico enviar un correo a la dirección <a href='mailto:info@phoenifx.com'>info@phoenifx.com</a>
      </p>
      <p>Vive la experiencia de crecer con nosotros, <strong>PhoeniFx</strong> ha creado un sistema de trabajo único para potenciar tu proceso de formación y resultados. </p>`;
      this.correo.fechaCreacion = new Date();
      this.correo.estado = 'pendiente';
      this.paySvc.AddCorreo(this.correo);

      // correo a phoeniFx
      this.correo.name = this.usuario.nombre;
      this.correo.emailF = this.usuario.email;
      this.correo.emailT = '';
      this.correo.subject = 'Nuevo ingreso';
      if (this.usuario.codigoR !== '') {
        mensaje = `,tipo de plan: <strong>${this.tipoPlan}</strong> y el Código de Referido: <strong>${this.usuario.codigoR}</strong>`;
      } else {
        mensaje = `y tipo de plan: <strong>${this.tipoPlan}</strong>`;
      }
      this.correo.message = `<p>Se a registrado un nuevo cliente <strong>${this.usuario.nombre}</strong> con el correo: <strong>${this.usuario.email}</strong> ${mensaje}<p>`;
      this.correo.fechaCreacion = new Date();
      this.correo.estado = 'pendiente';
      this.paySvc.AddCorreo(this.correo);

      // this.authSvc.sendVerification(this.usuario.email);
      this.procesando = false;
      this.dialogRef.close();
      this.router.navigate(['/login']);
      this.snackBar.open(
        `Cuenta creada con éxito!!
   Por favor validar usuario enviado al correo ${this.usuario.email}`,
        'Cerrar',
        {
          duration: 10000
        }
      );
    }
  }

  guardarPagoUsuario() {
    if (!this.order.payer.address) {
      this.order.payer.address = '';
    }
    if (!this.order.payer.email_address) {
      this.order.payer.email_address = '';
    }
    if (!this.order.payer.name) {
      this.order.payer.name = '';
    }
    if (!this.order.payer.payer_id) {
      this.order.payer.payer_id = '';
    }
    if (!this.order.purchase_units[0].shipping.address.address_line_1) {
      this.order.purchase_units[0].shipping.address.address_line_1 = '';
    }
    if (!this.order.purchase_units[0].shipping.address.admin_area_1) {
      this.order.purchase_units[0].shipping.address.admin_area_1 = '';
    }
    if (!this.order.purchase_units[0].shipping.address.admin_area_2) {
      this.order.purchase_units[0].shipping.address.admin_area_2 = '';
    }
    if (!this.order.purchase_units[0].shipping.address.country_code) {
      this.order.purchase_units[0].shipping.address.country_code = '';
    }
    if (!this.order.purchase_units[0].shipping.address.postal_code) {
      this.order.purchase_units[0].shipping.address.postal_code = '';
    }
    if (!this.order.purchase_units[0].payments.captures[0].amount) {
      this.order.purchase_units[0].payments.captures[0].amount = '';
    }
    if (!this.order.purchase_units[0].payments.captures[0].create_time) {
      this.order.purchase_units[0].payments.captures[0].create_time = new Date();
    }
    if (!this.order.purchase_units[0].payments.captures[0].id) {
      this.order.purchase_units[0].payments.captures[0].id = '';
    }

    const payerObj = {
      address: this.order.payer.address,
      email_address: this.order.payer.email_address,
      name: this.order.payer.name,
      payer_id: this.order.payer.payer_id
    }
    const addressObj = {
      address_line_1: this.order.purchase_units[0].shipping.address.address_line_1,
      admin_area_1: this.order.purchase_units[0].shipping.address.admin_area_1,
      admin_area_2: this.order.purchase_units[0].shipping.address.admin_area_2,
      country_code: this.order.purchase_units[0].shipping.address.country_code,
      postal_code: this.order.purchase_units[0].shipping.address.postal_code
    }
    const paymentObj = {
      amount: this.order.purchase_units[0].payments.captures[0].amount,
      create_time: this.order.purchase_units[0].payments.captures[0].create_time,
      idPayment: this.order.purchase_units[0].payments.captures[0].id
    }
    const pagoUsuarioObj = {
      uid: this.usuario.uid,
      fechaCreacion: new Date(),
      usuarioCreacion: this.usuario.nombre,
      create_time: this.order.create_time,
      idPaypal: this.order.id,
      payee: this.order.purchase_units[0].payee,
      tipoPlan: this.tipoPlan,
      payer: payerObj,
      address: addressObj,
      payment: paymentObj
    }
    this.paySvc.preAddUpdatePagoUsuario(pagoUsuarioObj);
  }

}

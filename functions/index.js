const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();

const nodemailer = require("nodemailer");

const firestore = admin.firestore();

const gmailEmail = encodeURIComponent(functions.config().gmail.email);
const gmailPassword = encodeURIComponent(functions.config().gmail.password);
const transport = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: decodeURIComponent(gmailEmail),
        pass: decodeURIComponent(gmailPassword),
    },
});
exports.sendEmail = functions.firestore
    .document("correo/{id}")
    .onCreate((snap, context) => {
        firestore
            .collection("correo")
            .where("id", "==", snap.id)
            .onSnapshot((a) => {
                a.forEach((b) => {
                    let correo = null;
                    correo = b.data();
                    if (correo.estado === "pendiente") {
                        correo.estado = "proceso";
                        console.log("proceso");
                        firestore.collection("correo").doc(correo.id).update(correo);
                        let emailT = "";
                        if (correo.emailT) {
                            emailT = correo.emailT;
                        } else {
                            emailT = decodeURIComponent(gmailEmail);
                        }
                        const mailOptions = {
                            from: `${correo.name} <${decodeURIComponent(gmailEmail)}>`,
                            to: emailT,
                            subject: correo.subject,
                            html: correo.message,
                        };
                        transport
                            .sendMail(mailOptions)
                            .then(() => {
                                correo.estado = "enviado";
                                firestore.collection("correo").doc(correo.id).update(correo);
                                console.log("enviado");
                                return console.log(`Correo enviado a: ${emailT}.`);
                            })
                            .catch((error) => {
                                correo.estado = "error";
                                firestore.collection("correo").doc(correo.id).update(correo);
                                let emailF = "";
                                if (correo.emailF) {
                                    emailF = correo.emailF;
                                } else {
                                    emailF = decodeURIComponent(gmailEmail);
                                }
                                const controlError = firestore.collection("controlError").doc();
                                controlError.set({
                                    ubicacionError: "Módulo Correo",
                                    descripcion: error,
                                    email: `De: ${emailF}, a: ${emailT}`,
                                    fechaCreacion: new Date(),
                                    usuarioCreacion: correo.name,
                                    idTipoColeccion: correo.id,
                                });
                                console.log("Empieza error.");
                                console.log(error);
                                console.log("Termina error.");
                            });
                    }
                });
            });
    });

const firestoreE = require("@google-cloud/firestore");
const client = new firestoreE.v1.FirestoreAdminClient();
const bucket = "gs://phoenifx.com";

exports.scheduledFirestoreExport = functions.pubsub
    .schedule("every 24 hours")
    .onRun((context) => {
        const projectId = process.env.GCP_PROJECT || process.env.GCLOUD_PROJECT;
        const databaseName = client.databasePath(projectId, "(default)");

        return client
            .exportDocuments({
                name: databaseName,
                outputUriPrefix: bucket,
                collectionIds: [],
            })
            .then((responses) => {
                const response = responses[0];
                return console.log(`Nombre de la Operación: ${response.name}.`);
            })
            .catch((err) => {
                console.error(err);
                throw new Error("Operación de Exportación Fallida.");
            });
    });

exports.validateUser = functions.pubsub
    .schedule("0 23 * * *")
    .onRun((context) => {
        let mensaje = "";
        firestore
            .collection("usuario")
            .where("rol", "==", "02clie2")
            .where("fechaVencimientoPago", "<", new Date())
            .where("estado", "==", "01canc1")
            .get()
            .then((a) => {
                a.forEach((b) => {
                    let usuario = null;
                    usuario = b.data();
                    usuario.estado = "02pend2";
                    usuario.fechaModificacion = new Date();
                    usuario.usuarioModificacion = "Sistema";
                    firestore.collection("usuario").doc(usuario.id).update(usuario);

                    const correoU = firestore.collection("correo").doc();
                    correoU.set({
                        name: "PhoeniFx",
                        emailF: "",
                        emailT: usuario.email,
                        subject: "Renovación de Pago",
                        message: `<p>Hola <strong>${usuario.nombre}</strong>; </p>
            <p>De parte del equipo de <strong>PhoeniFx</strong> es un gusto saludarte y a la vez queremos recordarte que tu membresía se encuentra pendiente de pago. </p>
            <p>Te invitamos a renovar tu pago y así poder seguir disfrutando de nuestros servicios.</p>
            <p>
              <a href='https://phoenifx.com/login' target='_blank'>PhoeniFx.com</a>
            </p>`,
                        fechaCreacion: new Date(),
                        estado: "pendiente",
                        id: correoU.id,
                    });
                    mensaje = "Usuario actualizado y Correo enviado.";
                });
                return console.log(mensaje);
            })
            .catch((error) => {
                console.log("Error obteniendo los documentos: ", error);
            });
    });

exports.validateActivity = functions.pubsub
    .schedule("0 23 * * *")
    .onRun((context) => {
        firestore
            .collection("actividad")
            .get()
            .then((a) => {
                let mensaje = "";
                a.forEach((b) => {
                    let actividad = null;
                    actividad = b.data();
                    if (actividad.estado || (!actividad.estado && actividad.tipo === 1)) {
                        let fechaActi = new Date(actividad.fechaActividad.toDate());
                        let fechaActividad = new Date(
                            fechaActi.getFullYear(),
                            fechaActi.getMonth(),
                            fechaActi.getDate(),
                            0,
                            0,
                            0
                        );
                        let actual = new Date();
                        let fechaAc = new Date(
                            actual.getFullYear(),
                            actual.getMonth(),
                            actual.getDate(),
                            0,
                            0,
                            0
                        );
                        let time = fechaAc.getTime();
                        if (
                            actual.getHours() >= 0 &&
                            (actual.getHours() < 6 ||
                                (actual.getHours() === 6 &&
                                    actual.getMinutes() === 0 &&
                                    actual.getSeconds() === 0))
                        ) {
                            time -= 86400000;
                        }
                        if (fechaActividad.getTime() < time) {
                            let cont = 0;
                            if (actividad.controlUrls) {
                                actividad.controlUrls.forEach((c) => {
                                    let fechaProceso = new Date(
                                        fechaActividad.getFullYear(),
                                        fechaActividad.getMonth(),
                                        fechaActividad.getDate(),
                                        Number(c.hora.split(":")[0]) + Number(c.horaD),
                                        Number(c.hora.split(":")[1]) + Number(c.minutoD),
                                        0
                                    );
                                    if (fechaProceso.getTime() > time) {
                                        cont = 1;
                                    }
                                });
                            }
                            if (cont === 0) {
                                actividad.estado = false;
                                actividad.tipo = 2;
                                actividad.fechaModificacion = new Date();
                                actividad.usuarioModificacion = "Sistema";
                                firestore
                                    .collection("actividad")
                                    .doc(actividad.id)
                                    .update(actividad);
                                mensaje = "Actividad actualizada.";
                            }
                        }
                    }
                });
                return console.log(mensaje);
            })
            .catch((error) => {
                console.log("Error obteniendo los documentos: ", error);
            });
    });
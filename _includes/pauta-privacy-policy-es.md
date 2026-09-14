Pauta es un planificador diario para ti y tu familia, con aire de periódico impreso. Esta página
explica, sin lenguaje enrevesado, qué guarda la app, dónde vive, quién lo ve y cómo recuperarlo o
borrarlo.

---

### Quién es responsable

**MagicLab Solutions**, nombre comercial de **Hoffmann Tech LTDA**, es la responsable del
tratamiento de los datos descritos aquí.

Dudas, solicitudes o reclamaciones: [redacao@pauta.app](mailto:redacao@pauta.app). Respondemos en
español, portugués o inglés.

---

### Tu cuenta

Hay tres maneras de entrar en Pauta:

* **Iniciar sesión con Apple** — puedes ocultar tu correo, y Apple nos entrega una dirección de
  reenvío en lugar de la real. Funciona igual; no necesitamos la verdadera.
* **Correo y contraseña** — a cargo de Firebase Authentication. Tu contraseña nunca pasa por
  nosotros.
* **Cuenta anónima para niños** — un niño entra en una casa escribiendo un código de seis letras
  que aprobó el dueño de la casa. Sin correo, sin contraseña y sin registro público de menores.

De la cuenta guardamos **nombre**, **correo** (cuando lo hay), **idioma** y **zona horaria**. Ese
es todo el perfil.

---

### Qué guarda la casa

Todo lo que escribes en Pauta pertenece a tu casa y lo ve quien está en ella:

* **Miembros** — nombres y avatares, incluidos los de los niños. Sin fecha de nacimiento, sin
  ubicación, sin teléfono.
* **Tareas, compra, deseos, ideas** y los garabatos que dibujas (guardados como imágenes PNG).
* **Proyectos e hitos**, organizados por área — Casa, Trabajo, Personal, Familia.
* **Prompts programados y las propuestas** que devuelven.
* **Preferencias de aviso** y los tokens push de tus dispositivos, para que la notificación llegue
  al aparato correcto.

Nadie fuera de tu casa ve nada de esto, y nada de esto se convierte en un perfil sobre ti.

---

### Dónde viven los datos

Pauta funciona sobre **Firebase**, de Google:

* **Firestore**, en la región `nam5` (Estados Unidos), guarda los datos de la casa.
* Las **Cloud Functions**, en `us-central1`, ejecutan los prompts programados, las llamadas de IA
  y el borrado de la cuenta.
* Una **caché local en el dispositivo** mantiene la app funcionando sin conexión y sincroniza
  cuando vuelves.

Es decir: tus datos se transfieren y se tratan en Estados Unidos. Esa transferencia internacional
se apoya en las cláusulas contractuales tipo de Google.

---

### Cómo funciona la IA

Cuando capturas algo por voz o por texto, la app envía a nuestras Cloud Functions:

* el texto que escribiste, o la transcripción de lo que dijiste, y
* un resumen breve del contexto de la casa — los nombres de tus áreas, proyectos y tareas
  abiertas — para que la IA archive la nota en el sitio correcto.

Las Functions se lo pasan a la **API de Anthropic (Claude)**, que devuelve la interpretación.
Según los términos de API de Anthropic, **ese contenido no se usa para entrenar modelos**. El uso
se mide por plan.

La voz la transcribe tu propio dispositivo, con el dictado de Apple; el audio nunca llega a
nuestros servidores.

La IA propone, nunca decide. Cada propuesta espera a que la aceptes o la ignores.

---

### Pagos

Las suscripciones se venden a través de la **App Store**. Apple procesa el pago y solo nos dice si
la suscripción está activa. **No vemos tu tarjeta, tu dirección de facturación ni tu cuenta de
Apple.**

---

### Diagnóstico

La versión 1.0 incluye **Firebase Crashlytics** (informes de fallos) y **Firebase Analytics**
(eventos de uso agregados, del tipo "hubo una captura" o "se mostró el paywall"). Esos eventos
**no llevan datos personales** — ni títulos de tareas, ni nombres, ni notas.

---

### Lo que no hacemos

* Nada de publicidad ni de identificadores publicitarios.
* Nada de rastreo en apps y webs de otras empresas. Pauta ni siquiera pide el permiso de
  seguimiento (ATT), porque no tiene nada que rastrear.
* Nada de vender ni alquilar tus datos, a nadie, nunca.
* Nada de usar el contenido de tu casa para entrenar modelos, ni nuestros ni de terceros.

---

### Tus derechos

Bajo la **LGPD** brasileña y el **RGPD** europeo, puedes:

* **Ver y exportar tus datos** — en Redacción › Cuenta › Exportar datos recibes un archivo con
  todo lo que guarda tu casa.
* **Corregir** lo que esté mal, directamente en la app.
* **Borrar tu cuenta** — Redacción › Cuenta › *Cerrar la redacción*. Tienes **30 días** para
  arrepentirte; pasado el plazo, una Cloud Function borra la cuenta y sus datos de forma
  definitiva.
* **Oponerte, limitar el tratamiento o reclamar** — escribe a
  [redacao@pauta.app](mailto:redacao@pauta.app), o acude a la ANPD brasileña o a la autoridad de
  protección de datos de tu país.

Guardamos tus datos mientras exista la cuenta, y ni un día más.

---

### Niños

Un niño solo entra en una casa invitado por un adulto, con un código de seis letras. No hay
registro público de menores, no hay chat, no hay contenido de terceros y no hay publicidad en
ningún rincón de la app. El niño ve su casa y nada más. El adulto dueño de la casa puede retirarle
el acceso cuando quiera.

---

### Cambios en esta política

Si algo de aquí cambia de forma relevante, actualizamos la fecha de vigencia arriba y te avisamos
dentro de la app antes de que el cambio entre en vigor.

---

### Contacto

**MagicLab Solutions** (Hoffmann Tech LTDA) — [redacao@pauta.app](mailto:redacao@pauta.app)

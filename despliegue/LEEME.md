# Despliegue del sitio de Gramanat

Esta carpeta no se publica. Sirve para armar el paquete exacto de archivos que se sube al hosting.

## Generar el paquete

Requiere Node.js. Desde la raíz del repositorio:

```
node despliegue/generar-paquete.cjs --salida <carpeta-fuera-del-repositorio>
```

El paquete se arma así:

- Incluye las 17 páginas rediseñadas (portada, 15 fichas de soluciones y Webinars) y todo lo que enlazan: CSS, JavaScript, imágenes, videos y fuentes.
- Incluye `contacto-envio.php`, el formulario de Contacto de la portada.
- Incluye las 17 imágenes para compartir (Open Graph), una por página. Se detectan en el `<head>` de cada página y se comprueban contra `imagenes-og.txt`: nombre exacto, peso y huella SHA-256. Si falta una, sobra una o no coincide, el script se detiene sin generar nada.
- Deja fuera las páginas antiguas (`arquitectura.html`, `casas.html`, `marketing.html`), `send.php`, esta carpeta, la documentación interna y las herramientas de desarrollo.

Sin `--salida`, el script solo comprueba y muestra el resumen. Con `--lista <archivo>` guarda además la lista de archivos.

## Formulario de Contacto (`contacto-envio.php`)

Va siempre en el paquete. Antes de publicar, en el hosting:

- Configura `REMITENTE` y `DOMINIOS` con el dominio real; hoy dicen `DOMINIO-PENDIENTE` y el script lo avisa.
- Usa PHP 8.3 o superior con mbstring y `mail()`.
- Guarda el secreto en la variable de entorno `GRAMANAT_FORM_SECRET`, o en el archivo `gramanat-contacto.secret` fuera de la carpeta pública. Nunca en el repositorio.

## Imágenes para compartir

Si se cambia o se añade una imagen aprobada, actualiza su línea en `imagenes-og.txt`: ruta, página, peso y SHA-256.

Cuando exista el dominio, `og:image` debe apuntar a la misma ruta; el script también sigue esas direcciones.

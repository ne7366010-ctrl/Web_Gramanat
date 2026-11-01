// Gramanat · paquete de despliegue del sitio.
// Arma la lista de archivos que el sitio público necesita y, con --salida, copia esos archivos a una carpeta nueva lista
// para subir al hosting. Uso, desde la raíz del repositorio:
//   node despliegue/generar-paquete.cjs                     → solo comprueba y muestra el resumen
//   node despliegue/generar-paquete.cjs --salida <carpeta>  → además copia el paquete (la carpeta no debe existir)
//   node despliegue/generar-paquete.cjs --lista <archivo>   → además guarda la lista de archivos, uno por línea
// Parte de las 17 páginas rediseñadas y de contacto-envio.php, y sigue sus referencias locales (src, href, srcset,
// poster, data-src, url() del CSS y rutas img/ video/ css/ js/ escritas en el JavaScript).
// Imágenes para compartir (Open Graph): ninguna página las enlaza mientras no exista og:image, así que se detectan
// aparte. En cada página se toma la ruta de og:image si existe o, si no, la del comentario «Pendientes del dominio
// definitivo». Cada imagen debe existir con ese nombre exacto (mayúsculas incluidas) y coincidir en peso y huella SHA-256
// con despliegue/imagenes-og.txt; si falta una, sobra una o no coincide, el script se detiene sin generar nada.
const fs = require('fs'), path = require('path'), crypto = require('crypto');
const RAIZ = path.resolve(__dirname, '..');
const args = process.argv.slice(2);
const opcion = (n) => { const i = args.indexOf(n); return i >= 0 ? args[i + 1] : null; };
const SALIDA = opcion('--salida'), LISTA = opcion('--lista');
const PAGINAS = ['index.html', 'webinars.html', 'administrative-business.html', 'administrativo-punto-de-venta.html', 'soluciones/personalBusiness.html',
  'soluciones/centroImpresionFiscal.html', 'ecommerceGestionDigital/PSKloudEShop.html', 'ecommerceGestionDigital/PSKloudManager.html',
  'contabilidadFinanzas/SistemaContabilidad.html', 'SaludLaboratorios/SistemaHistoriasMedicas.html', 'SaludLaboratorios/SistemaClinicasHospitales.html',
  'SaludLaboratorios/SistemaLaboratorios.html', 'recursosHumanosNomina/sistemaNomina.html', 'recursosHumanosNomina/sistemaNominaWeb.html',
  'hoteleria/sistemaHoteles.html', 'talleresYConcesionarios/talleresYConcesionarios.html', 'restaurantes/restaurantes.html'];
const PHP = 'contacto-envio.php';
const ANTIGUAS = ['arquitectura.html', 'casas.html', 'marketing.html', 'send.php'];
const errores = [], avisos = [];
const falla = (m) => errores.push(m);

const todos = (d) => fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => e.isDirectory() ? (e.name === '.git' ? [] : todos(path.join(d, e.name)))
  : [path.relative(RAIZ, path.join(d, e.name)).replace(/\\/g, '/')]);
const archivos = new Set(todos(RAIZ));
const publicar = new Set([...PAGINAS, PHP]);
const cola = [...PAGINAS];
const agregar = (desde, ref) => {
  ref = ref.split('#')[0].split('?')[0].trim(); if (!ref || /^(https?:|data:|mailto:|tel:|javascript:|\/\/)/.test(ref)) return;
  let rel; try { rel = path.posix.normalize(path.posix.join(path.posix.dirname(desde), decodeURIComponent(ref))); } catch { return; }
  if (archivos.has(rel) && !publicar.has(rel)) { publicar.add(rel); if (/\.(html|css|js)$/.test(rel)) cola.push(rel); }
};
for (const p of [...PAGINAS, PHP]) if (!archivos.has(p)) falla('falta el archivo ' + p);
while (cola.length) {
  const f = cola.shift(); if (!archivos.has(f)) continue;
  const t = fs.readFileSync(path.join(RAIZ, f), 'utf8').replace(/<!--[\s\S]*?-->/g, '');
  if (f.endsWith('.html')) {
    for (const m of t.matchAll(/\b(?:src|href|poster|data-src)="([^"]+)"/g)) agregar(f, m[1]);
    for (const m of t.matchAll(/\bsrcset="([^"]+)"/g)) m[1].split(/,\s+/).forEach((s) => agregar(f, s.trim().replace(/\s+\d+[wx]$/, '')));
    for (const m of t.matchAll(/url\(\s*['"]?([^'")]+)['"]?\s*\)/g)) agregar(f, m[1]);
  } else if (f.endsWith('.css')) {
    for (const m of t.matchAll(/url\(\s*['"]?([^'")]+)['"]?\s*\)/g)) agregar(f, m[1]);
    for (const m of t.matchAll(/@import\s+['"]([^'"]+)['"]/g)) agregar(f, m[1]);
  } else if (f.endsWith('.js')) {
    for (const m of t.matchAll(/['"`]((?:\.\.\/)*(?:img|video|css|js)\/[^'"`$]+)['"`]/g)) agregar('index.html', m[1]);
  }
}
// Las páginas antiguas, el formulario antiguo y esta carpeta nunca se publican, aunque algo las enlace.
for (const f of [...publicar]) if (ANTIGUAS.includes(f) || f.startsWith('despliegue/')) publicar.delete(f);

// Imágenes Open Graph: una por página, detectadas en el <head>.
const referencia = new Map(fs.readFileSync(path.join(__dirname, 'imagenes-og.txt'), 'utf8').split(/\r?\n/)
  .filter((l) => l.startsWith('img/')).map((l) => { const [ruta, pagina, bytes, sha] = l.split('\t'); return [ruta, { pagina, bytes: +bytes, sha }]; }));
const og = new Map();
for (const p of PAGINAS) {
  if (!archivos.has(p)) continue;
  const t = fs.readFileSync(path.join(RAIZ, p), 'utf8'); const head = t.slice(0, t.indexOf('</head>'));
  const meta = head.match(/<meta property="og:image" content="([^"]+)"/);
  const comentario = head.match(/Pendientes del dominio definitivo:[^>]*?URL absoluta de (img\/[^\s()]+)/);
  const absoluta = meta && meta[1].replace(/^https?:\/\/[^/]+/, ''); // la URL del dominio se reduce a su ruta
  const ruta = meta ? (absoluta.startsWith('/') ? path.posix.normalize(absoluta).slice(1) : path.posix.normalize(path.posix.join(path.posix.dirname(p), absoluta)))
    : comentario ? comentario[1] : null;
  if (!ruta) { falla(`${p}: no tiene og:image ni el comentario con la ruta de su imagen para compartir`); continue; }
  if (og.has(ruta)) falla(`${p}: usa la misma imagen que ${og.get(ruta)} (${ruta})`);
  og.set(ruta, p);
  if (!archivos.has(ruta)) { falla(`${p}: su imagen ${ruta} no existe con ese nombre exacto`); continue; }
  const ref = referencia.get(ruta);
  if (!ref) { falla(`${p}: su imagen ${ruta} no está en despliegue/imagenes-og.txt`); continue; }
  if (ref.pagina !== p) falla(`${ruta}: en despliegue/imagenes-og.txt corresponde a ${ref.pagina}, no a ${p}`);
  const b = fs.readFileSync(path.join(RAIZ, ruta));
  if (b.length !== ref.bytes || crypto.createHash('sha256').update(b).digest('hex') !== ref.sha) falla(`${ruta}: el peso o la huella SHA-256 no coinciden con la imagen aprobada`);
  publicar.add(ruta);
}
for (const ruta of referencia.keys()) if (!og.has(ruta)) falla(`${ruta}: está en despliegue/imagenes-og.txt pero ninguna página la usa`);
if (og.size !== PAGINAS.length) falla(`se detectaron ${og.size} imágenes para compartir; se esperaban ${PAGINAS.length}`);

// Formulario de Contacto: se publica siempre; su configuración depende del hosting.
const php = archivos.has(PHP) ? fs.readFileSync(path.join(RAIZ, PHP), 'utf8') : '';
if (php.includes('DOMINIO-PENDIENTE')) avisos.push(`${PHP}: REMITENTE y DOMINIOS siguen como DOMINIO-PENDIENTE; configúralos con el dominio real antes de publicar`);
avisos.push(`${PHP}: necesita PHP 8.3 o superior con mbstring y mail(), y el secreto en la variable GRAMANAT_FORM_SECRET o en un archivo fuera de la carpeta pública`);
for (const f of publicar) if (/\.secret$/.test(f)) falla('un archivo de secreto quedó dentro del paquete: ' + f);

const lista = [...publicar].sort();
const mb = (lista.reduce((s, f) => s + (archivos.has(f) ? fs.statSync(path.join(RAIZ, f)).size : 0), 0) / 1048576).toFixed(1);
if (errores.length) { console.error('NO SE GENERÓ EL PAQUETE:\n- ' + errores.join('\n- ')); process.exit(1); }
console.log(`Paquete: ${lista.length} archivos, ${mb} MB · imágenes para compartir: ${og.size} de ${PAGINAS.length} · ${PHP}: incluido`);
for (const a of avisos) console.log('Aviso: ' + a);
if (LISTA) { fs.writeFileSync(path.resolve(LISTA), lista.join('\n') + '\n'); console.log('Lista guardada en ' + path.resolve(LISTA)); }
if (SALIDA) {
  const destino = path.resolve(SALIDA);
  if (fs.existsSync(destino)) { console.error('La carpeta de salida ya existe: ' + destino); process.exit(1); }
  if (destino.startsWith(RAIZ + path.sep)) { console.error('La carpeta de salida debe estar fuera del repositorio'); process.exit(1); }
  for (const f of lista) { const d = path.join(destino, f); fs.mkdirSync(path.dirname(d), { recursive: true }); fs.copyFileSync(path.join(RAIZ, f), d); }
  console.log('Paquete copiado en ' + destino);
}

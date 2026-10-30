<?php
// Gramanat · envío del formulario de Contacto de index.html (opción A1).
// Archivo independiente: no incluye ni modifica send.php, y solo lo usa el formulario .gn-contact-form de index.html.
// Requiere PHP 8.3 o superior (recomendado 8.4) con mbstring.
//
// Todas las peticiones son POST desde el propio sitio, con la cabecera X-Requested-With: GramanatContacto.
//   accion=token → devuelve un token firmado de un solo uso (texto plano).
//   resto        → valida y envía. Responde siempre en texto plano: "OK" si mail() aceptó el mensaje, o un mensaje
//                  breve en español si no. Nunca HTML, nunca redirecciones, nunca guarda el contenido del mensaje.
//                  "OK" significa que el servidor entregó el correo a su sistema de envío, no que haya llegado a la
//                  bandeja de entrada; eso solo se comprueba en el hosting.

declare(strict_types=1);

// Ningún aviso interno de PHP llega al visitante, aunque el hosting tenga display_errors activado.
ini_set('display_errors', '0');
ini_set('log_errors', '1');

// --- Configuración (PENDIENTE de confirmar en el hosting) ------------------------------------------------------------
const DESTINO          = 'igramanat@gmail.com';
const REMITENTE        = 'web@DOMINIO-PENDIENTE'; // PENDIENTE: cuenta del dominio permitida como remitente
const DOMINIOS         = ['DOMINIO-PENDIENTE', 'www.DOMINIO-PENDIENTE']; // PENDIENTE: dominios reales
const SOLO_HTTPS       = true;
const PREFIJO_ASUNTO   = '';
const RUTA_SECRETO     = __DIR__ . '/../gramanat-contacto.secret'; // fuera de la carpeta pública, si no hay variable de entorno
const CABECERA_PROPIA  = 'GramanatContacto';
const TOKEN_MIN        = 2;      // segundos mínimos entre recibir el token y enviar
const TOKEN_MAX        = 7200;   // validez del token: 2 horas
const VENTANA          = 600;    // ventana del límite: 10 minutos
const MAX_INTENTOS     = 20;     // envíos con token válido por IP en la ventana (válidos o no)
const MAX_ENVIOS       = 5;      // correos aceptados por IP en la ventana
const CADUCIDAD_DATOS  = 3600;   // los archivos por IP se borran tras 1 hora sin uso
const MAX_ENLACES      = 5;
const LIMITES          = ['name' => 100, 'email' => 254, 'phone' => 30, 'subject' => 150, 'message' => 5000];

date_default_timezone_set('America/El_Salvador');
header('Content-Type: text/plain; charset=UTF-8');
header('X-Content-Type-Options: nosniff');
header('Cache-Control: no-store');

function responder(string $texto, int $codigo = 200): never
{
    http_response_code($codigo);
    echo $texto;
    exit;
}

// Secreto del servidor: variable de entorno o archivo fuera de la carpeta pública. Sin secreto no se envía nada, y
// tampoco si el archivo del secreto estuviera dentro de la carpeta pública (podría descargarse).
function secreto(): string
{
    $valor = (string) getenv('GRAMANAT_FORM_SECRET');
    if ($valor === '' && is_readable(RUTA_SECRETO)) {
        $archivo = (string) realpath(RUTA_SECRETO);
        $publica = (string) realpath((string) ($_SERVER['DOCUMENT_ROOT'] ?? ''));
        if ($publica !== '' && str_starts_with(strtolower($archivo), strtolower($publica) . DIRECTORY_SEPARATOR)) {
            error_log('contacto-envio.php: el secreto está dentro de la carpeta pública; no se usa');
            responder('No pudimos enviar tu mensaje.', 500);
        }
        $valor = trim((string) file_get_contents($archivo));
    }
    if (strlen($valor) < 32) {
        error_log('contacto-envio.php: falta el secreto del formulario');
        responder('No pudimos enviar tu mensaje.', 500);
    }
    return $valor;
}

function base64url(string $bytes): string
{
    return rtrim(strtr(base64_encode($bytes), '+/', '-_'), '=');
}

// Firma del token: hora de emisión y un valor aleatorio, para que dos tokens del mismo segundo nunca coincidan.
function firma(string $hora, string $aleatorio, string $secreto): string
{
    return base64url(hash_hmac('sha256', 'contacto|' . $hora . '|' . $aleatorio, $secreto, true));
}

// Origen: Origin (los navegadores lo envían en todo POST) o, si falta, Referer; si faltan los dos, se rechaza.
function origen_valido(): bool
{
    $origen = $_SERVER['HTTP_ORIGIN'] ?? '';
    if ($origen === '' || $origen === 'null') {
        $origen = $_SERVER['HTTP_REFERER'] ?? '';
    }
    $partes = $origen === '' ? false : parse_url($origen);
    return is_array($partes)
        && (!SOLO_HTTPS || ($partes['scheme'] ?? '') === 'https')
        && in_array(strtolower($partes['host'] ?? ''), DOMINIOS, true);
}

// Texto de un campo sin recortar: saltos de línea unificados, sin otros caracteres de control.
function campo(string $nombre): string
{
    $valor = $_POST[$nombre] ?? '';
    if (!is_string($valor)) {
        return '';
    }
    $valor = str_replace(["\r\n", "\r"], "\n", trim($valor));
    return preg_replace('/[^\P{C}\n\t]/u', '', $valor) ?? '';
}

// Abre un archivo JSON con bloqueo exclusivo, deja modificar su contenido y lo guarda.
function con_bloqueo(string $ruta, callable $cambio): mixed
{
    $archivo = fopen($ruta, 'c+');
    if ($archivo === false || !flock($archivo, LOCK_EX)) {
        responder('No pudimos enviar tu mensaje.', 500);
    }
    $datos = json_decode((string) stream_get_contents($archivo), true);
    $datos = is_array($datos) ? $datos : [];
    $resultado = $cambio($datos);
    ftruncate($archivo, 0);
    rewind($archivo);
    fwrite($archivo, (string) json_encode($datos));
    fflush($archivo);
    flock($archivo, LOCK_UN);
    fclose($archivo);
    return $resultado;
}

// --- Comprobaciones comunes ---------------------------------------------------------------------------------------------
// La cabecera propia no se puede añadir desde otro sitio sin una petición previa (preflight) que este script no
// autoriza; junto con el origen, impide que otra web use el formulario desde el navegador de un visitante.
if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    header('Allow: POST');
    responder('Método no permitido.', 405);
}
if (($_SERVER['HTTP_X_REQUESTED_WITH'] ?? '') !== CABECERA_PROPIA || !origen_valido()) {
    responder('No pudimos enviar tu mensaje.', 403);
}
$secreto = secreto();

if (($_POST['accion'] ?? '') === 'token') {
    $hora = (string) time();
    $aleatorio = bin2hex(random_bytes(8));
    responder($hora . '.' . $aleatorio . '.' . firma($hora, $aleatorio, $secreto));
}

// Token firmado: demuestra que el formulario se pidió desde la página y no hace menos de TOKEN_MIN segundos.
[$hora, $aleatorio, $firma] = array_pad(explode('.', (string) ($_POST['token'] ?? ''), 3), 3, '');
$edad = time() - (int) $hora;
if (!ctype_digit($hora) || !preg_match('/^[0-9a-f]{16}$/', $aleatorio) || !hash_equals(firma($hora, $aleatorio, $secreto), $firma)
    || $edad < TOKEN_MIN || $edad > TOKEN_MAX) {
    responder('No pudimos enviar tu mensaje.');
}

$carpeta = sys_get_temp_dir() . DIRECTORY_SEPARATOR . 'gramanat-contacto';
if (!is_dir($carpeta) && !mkdir($carpeta, 0700, true) && !is_dir($carpeta)) {
    error_log('contacto-envio.php: no se pudo crear la carpeta temporal');
    responder('No pudimos enviar tu mensaje.', 500);
}
if (random_int(1, 50) === 1) {
    foreach (glob($carpeta . DIRECTORY_SEPARATOR . 'ip-*.json') ?: [] as $viejo) {
        if (filemtime($viejo) < time() - CADUCIDAD_DATOS) {
            @unlink($viejo);
        }
    }
}

// --- Límite por IP ------------------------------------------------------------------------------------------------------
// Se guarda un HMAC de la IP con el secreto del servidor (un seudónimo: sin el secreto no se puede comprobar a qué
// IP corresponde, a diferencia de un SHA-256 simple, que con el espacio de IPv4 se revierte por fuerza bruta) y solo
// las horas de los intentos y envíos de los últimos 10 minutos. El bloqueo de archivo hace que las peticiones
// simultáneas de una misma IP se cuenten de una en una.
$ahora    = time();
$rutaIp   = $carpeta . DIRECTORY_SEPARATOR . 'ip-' . hash_hmac('sha256', (string) ($_SERVER['REMOTE_ADDR'] ?? ''), $secreto) . '.json';
$recientes = static fn (array $lista): array => array_values(array_filter($lista, static fn ($t) => is_int($t) && $t > $ahora - VENTANA));

// Reserva un envío (cuenta el intento y, si todo es válido más adelante, el envío) dentro del bloqueo.
$permitido = con_bloqueo($rutaIp, function (array &$datos) use ($recientes, $ahora): bool {
    $datos = ['intentos' => $recientes($datos['intentos'] ?? []), 'envios' => $recientes($datos['envios'] ?? [])];
    if (count($datos['intentos']) >= MAX_INTENTOS || count($datos['envios']) >= MAX_ENVIOS) {
        return false;
    }
    $datos['intentos'][] = $ahora;
    $datos['envios'][] = $ahora; // reservado; se libera si el mensaje no llega a enviarse
    return true;
});
if (!$permitido) {
    responder('Recibimos varios mensajes seguidos. Inténtalo de nuevo en unos minutos.');
}
$liberarEnvio = static function () use ($rutaIp, $ahora): void {
    con_bloqueo($rutaIp, function (array &$datos) use ($ahora): void {
        $i = array_search($ahora, $datos['envios'] ?? [], true);
        if ($i !== false) {
            array_splice($datos['envios'], $i, 1);
        }
    });
};

// --- Campo trampa y validación (sin recortes silenciosos) ---------------------------------------------------------------
if (campo('website') !== '') {
    $liberarEnvio();
    responder('OK'); // un robot cree que se envió; no se manda nada ni cuenta como envío
}

$v = [];
foreach (array_keys(LIMITES) as $nombre) {
    $v[$nombre] = campo($nombre);
}
$error = match (true) {
    mb_strlen($v['name']) < 2 || mb_strlen($v['name']) > LIMITES['name'] => 'Escribe tu nombre.',
    mb_strlen($v['email']) > LIMITES['email'] || !filter_var($v['email'], FILTER_VALIDATE_EMAIL) => 'Escribe un correo válido.',
    $v['phone'] !== '' && !preg_match('/^[0-9+()\-\s]{7,30}$/', $v['phone']) => 'Escribe un teléfono válido o deja el campo vacío.',
    mb_strlen($v['subject']) > LIMITES['subject'] => 'El asunto supera los 150 caracteres.',
    mb_strlen($v['message']) < 10 => 'Cuéntanos tu consulta en al menos 10 caracteres.',
    mb_strlen($v['message']) > LIMITES['message'] => 'Tu mensaje supera los 5.000 caracteres. Acórtalo e inténtalo de nuevo.',
    preg_match_all('~https?://|www\.~i', $v['message']) > MAX_ENLACES => 'No pudimos enviar tu mensaje.',
    default => '',
};
if ($error !== '') {
    $liberarEnvio();
    responder($error);
}

// --- Token de un solo uso: se reserva antes de enviar y se libera si mail() falla ---------------------------------------
$rutaTokens = $carpeta . DIRECTORY_SEPARATOR . 'tokens-usados.json';
$tokenLibre = con_bloqueo($rutaTokens, function (array &$usados) use ($firma, $hora): bool {
    $usados = array_filter($usados, static fn ($caduca) => is_int($caduca) && $caduca > time());
    if (isset($usados[$firma])) {
        return false;
    }
    $usados[$firma] = (int) $hora + TOKEN_MAX;
    return true;
});
if (!$tokenLibre) {
    $liberarEnvio();
    responder('No pudimos enviar tu mensaje.');
}

// --- Envío ---------------------------------------------------------------------------------------------------------------
$titulo = PREFIJO_ASUNTO . 'Mensaje del sitio web' . ($v['subject'] !== '' ? ': ' . $v['subject'] : '');
$cuerpo = "Nombre: {$v['name']}\n"
        . "Correo: {$v['email']}\n"
        . 'Teléfono o WhatsApp: ' . ($v['phone'] !== '' ? $v['phone'] : '—') . "\n"
        . "Página: Contacto (index.html)\n\n"
        . "Mensaje:\n{$v['message']}\n\n"
        . 'Enviado el ' . date('d/m/Y H:i') . ' (hora de El Salvador)';

// Remitente fijo del dominio; el correo del visitante (validado, sin saltos de línea) va en Reply-To.
$cabeceras = implode("\r\n", [
    'From: Sitio web Gramanat <' . REMITENTE . '>',
    'Reply-To: ' . $v['email'],
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=UTF-8',
    'Content-Transfer-Encoding: 8bit',
]);

$aceptado = mail(DESTINO, '=?UTF-8?B?' . base64_encode($titulo) . '?=', $cuerpo, $cabeceras, '-f' . REMITENTE);

if (!$aceptado) {
    $liberarEnvio();
    con_bloqueo($rutaTokens, function (array &$usados) use ($firma): void {
        unset($usados[$firma]);
    });
}
// Registro técnico sin contenido del mensaje ni datos personales, para detectar fallos de envío.
error_log('contacto-envio.php: mail() ' . ($aceptado ? 'aceptado' : 'rechazado'));

responder($aceptado ? 'OK' : 'No pudimos enviar tu mensaje.');

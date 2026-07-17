/**
 * HTTP Inspector CLI
 *
 * Tarea de la Sesión 1: Fundamentos de la Web
 *
 * Esta tarea NO usa la red, ni async/await, ni librerías externas.
 * Solo la biblioteca estándar de Node + tipos básicos de TypeScript.
 *
 * Idea: aplicar lo que aprendiste sobre HTTP (URLs, métodos, códigos
 * de estado y cabeceras) implementando pequeñas funciones puras.
 */

import { URL } from "url";

// ---------------------------------------------------------------------------
// Tipos
// ---------------------------------------------------------------------------

/** Resultado de analizar una URL. */
export interface UrlParts {
  /** Protocolo tal como lo devuelve la WHATWG URL, p. ej. "https:". */
  protocol: string;

  /** Host (puede incluir puerto), p. ej. "api.ejemplo.com:443". */
  host: string;

  /** Ruta, p. ej. "/users". */
  pathname: string;

  /** Query string con el "?" inicial, p. ej. "?id=1&name=Ana". */
  search: string;

  /** Lista de pares [clave, valor] de los query params. */
  query: Array<[string, string]>;
}

/** Categoría de un código de estado HTTP. */
export type StatusCategory =
  | "1xx Informativo"
  | "2xx Éxito"
  | "3xx Redirección"
  | "4xx Error del cliente"
  | "5xx Error del servidor"
  | "Desconocido";

/** Mapa de cabeceras HTTP. */
export type Headers = Record<string, string>;

// ---------------------------------------------------------------------------
// Funciones a implementar
// ---------------------------------------------------------------------------

/**
 * Analiza una URL y devuelve sus partes principales.
 *
 * @param url URL que se desea analizar.
 * @returns Objeto con protocolo, host, ruta, búsqueda y parámetros.
 */
export function parseUrl(url: string): UrlParts {
  const parsedUrl = new URL(url);

  return {
    protocol: parsedUrl.protocol,
    host: parsedUrl.host,
    pathname: parsedUrl.pathname,
    search: parsedUrl.search,
    query: Array.from(parsedUrl.searchParams.entries()),
  };
}

/**
 * Analiza una URL y devuelve sus partes principales.
 *
 * @param url URL que se desea analizar.
 * @returns Protocolo, host, ruta, búsqueda y parámetros de la URL.
 * @throws TypeError si la URL proporcionada no es válida.
 */
export function classifyStatus(code: number): StatusCategory {
  if (code >= 100 && code <= 199) {
    return "1xx Informativo";
  } else if (code >= 200 && code <= 299) {
    return "2xx Éxito";
  } else if (code >= 300 && code <= 399) {
    return "3xx Redirección";
  } else if (code >= 400 && code <= 499) {
    return "4xx Error del cliente";
  } else if (code >= 500 && code <= 599) {
    return "5xx Error del servidor";
  }

  return "Desconocido";
}
/**
 * Clasifica un código de estado HTTP según su rango.
 *
 * @param code Código de estado HTTP.
 * @returns Categoría correspondiente al código o "Desconocido".
 */
export function parseHeaders(text: string): Headers {
  const headers: Headers = {};

  for (const line of text.split(/\r?\n/)) {
    const trimmedLine = line.trim();

    if (trimmedLine === "") {
      continue;
    }

    const separatorIndex = trimmedLine.indexOf(":");

    if (separatorIndex === -1) {
      continue;
    }

    const name = trimmedLine.slice(0, separatorIndex).trim();
    const value = trimmedLine.slice(separatorIndex + 1).trim();

    if (name !== "") {
      headers[name] = value;
    }
  }

  return headers;
}

/**
 * Convierte un texto de cabeceras HTTP en un objeto.
 *
 * Ignora líneas vacías o líneas que no contengan dos puntos.
 *
 * @param text Texto que contiene las cabeceras HTTP.
 * @returns Objeto con los nombres y valores de las cabeceras.
 */
export function summarizeRequest(
  url: string,
  status: number,
  headersText: string,
): string {
  const urlParts = parseUrl(url);
  const statusCategory = classifyStatus(status);
  const headers = parseHeaders(headersText);

  const headersSummary = Object.entries(headers)
    .map(([name, value]) => `  • ${name}: ${value}`)
    .join("\n");

  return [
    "Resumen de la petición",
    "──────────────────────",
    `URL: ${url}`,
    `Protocolo: ${urlParts.protocol}`,
    `Host: ${urlParts.host}`,
    `Ruta: ${urlParts.pathname}`,
    `Status: ${status} (${statusCategory})`,
    "Headers:",
    headersSummary || "  (sin cabeceras)",
  ].join("\n");
}

/**
 * Genera un resumen legible de una petición HTTP.
 *
 * @param url URL de la petición.
 * @param status Código de estado HTTP.
 * @param headersText Cabeceras HTTP en formato de texto.
 * @returns Resumen con la URL, estado y cabeceras.
 */


// ---------------------------------------------------------------------------
// CLI
// ---------------------------------------------------------------------------

if (require.main === module) {
  const [, , cmd, ...args] = process.argv;

  try {
    if (cmd === "parse-url" && args[0]) {
      const parts = parseUrl(args[0]);
      console.log(JSON.stringify(parts, null, 2));
    } else if (cmd === "status" && args[0]) {
      const category = classifyStatus(Number(args[0]));
      console.log(category);
    } else if (cmd === "headers" && args.length > 0) {
      const headers = parseHeaders(args.join(" "));
      console.log(JSON.stringify(headers, null, 2));
    } else if (cmd === "summary" && args.length >= 2) {
      const [url, status, ...rest] = args;

      console.log(
        summarizeRequest(
          url,
          Number(status),
          rest.join(" "),
        ),
      );
    } else {
      console.log("Uso:");
      console.log(
        '  npm start parse-url "https://ejemplo.com/path?a=1"',
      );
      console.log("  npm start status 404");
      console.log(
        '  npm start headers "Content-Type: application/json"',
      );
      console.log(
        '  npm start summary "https://x.com" 200 "Content-Type: application/json"',
      );
    }
  } catch (error) {
    console.error("Error:", (error as Error).message);
    process.exit(1);
  }
}
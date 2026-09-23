/**
 * app.js — Servidor Express (API REST + sitio estático)
 * Tarea Sesión 7 · Desarrollo Web · UMG
 *
 * Contiene:
 * - Middleware de autenticación falsa
 * - Validación de alumnos
 * - Rutas CRUD
 * - Sitio web estático
 */

import express from 'express';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

// __dirname en ES Modules
export const __filename = fileURLToPath(import.meta.url);
export const __dirname = dirname(__filename);

// ============================================================
// MIDDLEWARES
// ============================================================

/**
 * Autenticación falsa por medio del header x-api-key.
 *
 * @type {import('express').RequestHandler}
 */
export function autenticacionFalsa(req, res, next) {
    const clave = req.get('x-api-key');
    const claveEsperada = process.env.API_KEY ?? 'umg-2026';

    if (clave !== claveEsperada) {
        return res.status(401).json({
            error: 'No autorizado',
        });
    }

    next();
}

/**
 * Valida los datos recibidos de un alumno.
 *
 * @type {import('express').RequestHandler}
 */
export function validarAlumno(req, res, next) {
    const {
        nombre,
        apellido,
        email,
        edad,
    } = req.body;

    if (
        typeof nombre !== 'string' ||
        nombre.trim() === ''
    ) {
        return res.status(400).json({
            error: 'Nombre obligatorio',
        });
    }

    if (
        typeof apellido !== 'string' ||
        apellido.trim() === ''
    ) {
        return res.status(400).json({
            error: 'Apellido obligatorio',
        });
    }

    if (
        typeof email !== 'string' ||
        email.trim() === '' ||
        !email.includes('@')
    ) {
        return res.status(400).json({
            error: 'Email inválido',
        });
    }

    if (
        edad !== undefined &&
        (
            typeof edad !== 'number' ||
            Number.isNaN(edad) ||
            edad < 0
        )
    ) {
        return res.status(400).json({
            error: 'Edad inválida',
        });
    }

    next();
}

// ============================================================
// APP
// ============================================================

/**
 * Crea la aplicación de Express.
 *
 * @param {import('./repositorio.js').RepositorioAlumnos} repositorio
 * @returns {import('express').Express}
 */
export function crearApp(repositorio) {
    const app = express();

    // Permite recibir JSON
    app.use(express.json());

    // Sirve public/index.html, styles.css y app.js
    app.use(
        express.static(
            join(__dirname, '..', 'public')
        )
    );

    // ========================================================
    // GET /alumnos
    // ========================================================

    app.get('/alumnos', (req, res) => {
        const alumnos = repositorio.listar();

        res.status(200).json(alumnos);
    });

    // ========================================================
    // GET /alumnos/:id
    // ========================================================

    app.get('/alumnos/:id', (req, res) => {
        const alumno = repositorio.obtener(
            req.params.id
        );

        if (!alumno) {
            return res.status(404).json({
                error: 'Alumno no encontrado',
            });
        }

        res.status(200).json(alumno);
    });

    // ========================================================
    // POST /alumnos
    // ========================================================

    app.post(
        '/alumnos',
        autenticacionFalsa,
        validarAlumno,
        (req, res) => {
            const alumno = repositorio.crear(
                req.body
            );

            res.status(201).json(alumno);
        }
    );

    // ========================================================
    // PUT /alumnos/:id
    // ========================================================

    app.put(
        '/alumnos/:id',
        autenticacionFalsa,
        validarAlumno,
        (req, res) => {
            const alumno =
                repositorio.actualizar(
                    req.params.id,
                    req.body
                );

            if (!alumno) {
                return res.status(404).json({
                    error: 'Alumno no encontrado',
                });
            }

            res.status(200).json(alumno);
        }
    );

    // ========================================================
    // DELETE /alumnos/:id
    // ========================================================

    app.delete(
        '/alumnos/:id',
        autenticacionFalsa,
        (req, res) => {
            const eliminado =
                repositorio.eliminar(
                    req.params.id
                );

            if (!eliminado) {
                return res.status(404).json({
                    error: 'Alumno no encontrado',
                });
            }

            res.status(204).end();
        }
    );

    return app;
}
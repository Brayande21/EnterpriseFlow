-- ==========================================
-- EnterpriseFlow - Database Schema
-- PostgreSQL
-- ==========================================

-- Tabla de empleados

CREATE TABLE IF NOT EXISTS empleados (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    puesto VARCHAR(100) NOT NULL,
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de proyectos

CREATE TABLE IF NOT EXISTS proyectos (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL,
    descripcion TEXT,
    estado VARCHAR(30) DEFAULT 'Pendiente',
    responsable_id INTEGER REFERENCES empleados(id),
    fecha_inicio DATE DEFAULT CURRENT_DATE,
    fecha_entrega DATE,
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de tareas

CREATE TABLE IF NOT EXISTS tareas (
    id SERIAL PRIMARY KEY,
    titulo VARCHAR(150) NOT NULL,
    descripcion TEXT,
    estado VARCHAR(30) DEFAULT 'Pendiente',
    prioridad VARCHAR(20) DEFAULT 'Media',
    proyecto_id INTEGER NOT NULL REFERENCES proyectos(id),
    empleado_id INTEGER REFERENCES empleados(id),
    fecha_entrega DATE,
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de usuarios

CREATE TABLE IF NOT EXISTS usuarios (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    rol VARCHAR(20) NOT NULL DEFAULT 'usuario',
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CHECK (rol IN ('admin', 'usuario'))
);
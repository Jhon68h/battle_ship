# Battleship Game (Batalla Naval)

## Overview
Un juego de Batalla Naval completamente refactorizado con arquitectura modular y dos modos de juego. Construido con vanilla HTML, CSS, y JavaScript, presenta diseño moderno de UI/UX, gestión de estado, persistencia en localStorage, y mecánicas de juego inteligentes.

## Recent Changes
**November 13, 2025** - Refactorización arquitectónica completa y nuevas funcionalidades:
- Refactorizado en arquitectura modular con motor de juego compartido (battle-core.js)
- Implementado sistema de configuración para diferentes modos de juego
- Creado menú principal con selección de modos
- **Modo Clásico**: Tablero 10x10, 5 barcos, reglas tradicionales
- **Modo Guerra**: Tablero 12x12, 10 barcos (2 de cada tipo), armas especiales (Bombas 3x3 y Misiles lineales)
- Implementado modal personalizado para fin de juego (no usa confirm() del navegador)
- Sistema de armas con estrategias (SingleShot, BombWeapon, MissileWeapon)
- Historial compartido entre modos con identificación de modo
- Preview de ataques para armas especiales
- Espacio fijo para notificaciones (sin desplazamiento de pantalla)
- Responsive design completo para móvil/tablet/desktop

## Arquitectura del Proyecto

### Estructura de Archivos
- **Menu Principal**
  - `index.html` - Redirige automáticamente al menú
  - `menu.html` - Pantalla de selección de modo de juego
  - `menu.css` - Estilos del menú principal
  - `menu.js` - Lógica del menú e historial combinado

- **Motor de Juego Compartido**
  - `battle-core.js` - Motor principal configurable con:
    - GameState (gestión de estado del juego)
    - Ship (clase de barcos)
    - Weapon strategies (SingleShotWeapon, BombWeapon, MissileWeapon)
    - GameEngine (controlador principal del juego)

- **Modo Clásico**
  - `classic.html` - Página del modo clásico
  - `classic.js` - Configuración e inicialización del modo clásico

- **Modo Guerra**
  - `war.html` - Página del modo guerra
  - `war.js` - Configuración e inicialización del modo guerra con armas
  - `war.css` - Estilos específicos del modo guerra

- **Estilos**
  - `battle-base.css` - Estilos compartidos entre ambos modos

- **Servidor**
  - `server.py` - Servidor HTTP con cache-control headers
  - `.gitignore` - Ignora archivos de Python cache y macOS

## Tecnología Stack
- Frontend: Vanilla JavaScript (ES6+ Classes), HTML5, CSS3
- Arquitectura: Motor configurable con composición de estrategias
- Servidor: Python 3.11 HTTP server
- Storage: localStorage para historial de juegos (separado por modo)
- Diseño: Responsive (mobile-first), CSS Grid, Flexbox, CSS animations

## Características por Modo

### Modo Clásico 🎯
- Tablero 10x10
- 5 barcos: 1 Portaviones (5), 1 Acorazado (4), 2 Submarinos (3), 1 Destructor (2)
- Ataque estándar de disparo único
- Reglas tradicionales de batalla naval
- Historial guardado en localStorage con clave 'battleshipHistory'

### Modo Guerra 💣
- Tablero expandido 12x12
- 10 barcos: 2 de cada tipo (2x Portaviones, 2x Acorazado, 4x Submarino, 2x Destructor)
- **Armas Especiales:**
  - **Bomba 💣**: Ataque en área 3x3 (3 usos por partida)
  - **Misil 🚀**: Ataque lineal de 3 casillas horizontal o vertical (2 usos)
- Preview visual del área de ataque
- Selector de armas durante la batalla
- Historial guardado en localStorage con clave 'battleshipHistoryWar'

## Características Compartidas

### Sistema de Gestión de Estado
- Fases de juego: SETUP, BATTLE, END
- Validación de colocación de barcos
- Detección de barcos hundidos
- Gestión de turnos jugador/PC

### Interfaz de Usuario
- Selección de barcos con botones de orientación (horizontal/vertical)
- Preview visual de colocación (verde=válido, rojo=inválido)
- Indicador de fase actual del juego
- Sistema de mensajes con espacio fijo (no mueve la pantalla)
- Modal de fin de juego con estadísticas
- Botones: Nueva Partida, Menú Principal, Ayuda

### Lógica del PC
- Colocación aleatoria de barcos con validación
- No repite disparos (tracking de historial de disparos)
- Sistema justo de targeting aleatorio

### Persistencia de Datos
- Historial de últimas 10 partidas por modo
- Métricas: Fecha, Modo, Ganador, Impactos, Duración
- Visualización combinada en el menú principal

### Diseño Responsive
- Desktop: Tableros lado a lado con todas las características
- Tablet: Tableros apilados con espaciado optimizado
- Mobile: Diseño compacto con celdas touch-friendly

## Cómo Jugar

### Menú Principal
1. Elige entre Modo Clásico o Modo Guerra
2. Ver historial de partidas anteriores
3. Leer instrucciones

### Fase de Preparación
1. Selecciona orientación de barco (― horizontal o | vertical)
2. Hover sobre tu tablero para ver preview de colocación
3. Click para colocar el barco
4. Repite para todos los barcos
5. Botón "Iniciar Batalla" se habilita automáticamente

### Fase de Batalla
**Modo Clásico:**
- Click en tablero enemigo para disparar
- Espera turno del PC

**Modo Guerra:**
- Selecciona arma (Disparo, Bomba, o Misil)
- Si seleccionas Misil, elige orientación
- Hover para ver área de ataque
- Click para atacar
- Usos limitados de armas especiales

### Feedback Visual
- ✕ Rojo = Impacto
- ○ Gris = Agua (fallo)
- ☠ Negro = Barco completamente hundido
- Colores = Tus barcos (según tipo)

### Condición de Victoria
- Hunde todos los barcos enemigos antes de que hundan los tuyos
- Modal de fin de juego muestra estadísticas
- Partida guardada automáticamente en historial

## Desarrollo
El servidor corre en puerto 5000 con no-cache headers para asegurar que las actualizaciones sean inmediatamente visibles. La arquitectura modular permite fácil extensión con nuevos modos de juego o armas.

## Fechas de Implementación
- November 13, 2025 - Importado desde GitHub y configurado para Replit
- November 13, 2025 - Refactorización completa con arquitectura modular
- November 13, 2025 - Implementación de Modo Guerra y armas especiales
- November 13, 2025 - Modal personalizado de fin de juego y mejoras de UX

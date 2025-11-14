# 🔧 FIX: Cantidad de Barcos del PC

## 🐛 Problema Reportado

El PC tiene más barcos de los que debería:
- **Modo Clásico:** El PC tenía más de 5 barcos (debería tener exactamente 5)
- **Modo Guerra:** El PC tenía más de 10 barcos (debería tener exactamente 10)

## 🔍 Causa Root

El método `placePCShips()` no estaba reiniciando correctamente los arrays/tableros del PC antes de colocar nuevos barcos. Cuando se iniciaba una nueva batalla, a veces quedaban barcos previos en la memoria.

## ✅ Solución Implementada

### 1. **Reiniciar Tablero del PC**
```javascript
// ANTES: No se reiniciaba el tablero
this.config.ships.forEach(shipConfig => { ... })

// AHORA: Se reinicia completamente
this.state.pcBoard = Array(this.config.boardSize).fill(null).map(() => Array(this.config.boardSize).fill(null));
this.state.pcShips = [];
```

### 2. **Validación de Cantidad de Barcos**
Se agregó verificación en `startBattle()`:
```javascript
const pcShipCount = this.state.pcShips.length;
const expectedShipCount = this.config.ships.reduce((sum, ship) => sum + ship.quantity, 0);

if (pcShipCount !== expectedShipCount) {
    console.warn(`Error: El PC tiene ${pcShipCount} barcos, se esperaban ${expectedShipCount}`);
    this.placePCShips(); // Reintentar
}
```

### 3. **Mejorar Reintentos**
- Reducción de intentos de 1000 a 500 por barco (más eficiente)
- Agregada lógica para reintentar si un barco no se puede colocar

## 📊 Configuraciones Verificadas

### Modo Clásico (classic.js)
```javascript
ships: [
    { name: 'Portaviones', size: 5, quantity: 1 },  // 1 barco
    { name: 'Acorazado', size: 4, quantity: 1 },    // 1 barco
    { name: 'Submarino', size: 3, quantity: 2 },    // 2 barcos
    { name: 'Destructor', size: 2, quantity: 1 }    // 1 barco
]
// TOTAL: 5 barcos ✅
```

### Modo Guerra (war.js)
```javascript
ships: [
    { name: 'Portaviones', size: 5, quantity: 2 },  // 2 barcos
    { name: 'Acorazado', size: 4, quantity: 2 },    // 2 barcos
    { name: 'Submarino', size: 3, quantity: 4 },    // 4 barcos
    { name: 'Destructor', size: 2, quantity: 2 }    // 2 barcos
]
// TOTAL: 10 barcos ✅
```

## 📁 Archivos Modificados

### `battle-core.js`
1. ✅ `placePCShips()` - Reiniciar tablero y barcos antes de colocar
2. ✅ `startBattle()` - Agregar validación de cantidad de barcos
3. ✅ Mejorar lógica de reintentos

## 🧪 Cómo Probar

1. **Modo Clásico:**
   - Abre `classic.html`
   - Coloca tus 5 barcos
   - Inicia batalla
   - Abre la consola (F12)
   - Verifica: "Barcos del PC: 5"

2. **Modo Guerra:**
   - Abre `war.html`
   - Coloca tus 10 barcos
   - Inicia batalla
   - Abre la consola (F12)
   - Verifica: "Barcos del PC: 10"

## 📋 Validaciones en Consola

Cuando inicias batalla, verás:
```
Barcos del Jugador: 5     (Clásico) o 10 (Guerra)
Barcos del PC: 5          (Clásico) o 10 (Guerra)
Barcos Esperados: 5       (Clásico) o 10 (Guerra)
```

## ✨ Características

✅ **Cantidad exacta de barcos** para el PC
✅ **Mismo número que el jugador** en cada modo
✅ **Validación automática** al iniciar batalla
✅ **Reintentos automáticos** si hay error
✅ **Logs de depuración** en consola

## 🎯 Resultado

Ahora:
- ✅ Modo Clásico: PC tiene exactamente 5 barcos
- ✅ Modo Guerra: PC tiene exactamente 10 barcos
- ✅ Ambos modos: PC tiene la misma cantidad que el jugador

---

**Estado:** ✅ ARREGLADO
**Fecha:** 14 Noviembre 2025

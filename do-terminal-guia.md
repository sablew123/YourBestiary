# Guía de la terminal `/do` — YourBestiary

La terminal se abre con el botón `/do` en la esquina inferior izquierda (aparece tras pasar el mouse ahí un par de segundos). Cada línea que escribas y mandes con Enter se procesa como un comando.

---

## 1. `Limited`

Controla si los comandos **limited** (los más potentes/destructivos) están disponibles. **Siempre empieza en OFF al cargar la página.**

```
Limited On
Limited Off
Limited
```

- `Limited On` → activa los comandos limited.
- `Limited Off` → los desactiva.
- `Limited` (sin On/Off) → te dice el estado actual.

Si intentas usar un comando limited estando en OFF, la terminal responde:

```
You can't do that
```

---

## 2. `Clear all` *(limited)*

Borra **todas** las bestias del bestiario actual. No se puede deshacer, y no pide confirmación (a diferencia del botón ✕ de la interfaz).

```
Limited On
Clear all
```

---

## 3. `Add` — crear bestias

### Estructura general

```
Add <cantidad> [Name(...)] [Stats(...)] [Info(...)] [Type(...)]
```

- `<cantidad>`: número de bestias a crear. Es lo único obligatorio.
- Los demás bloques (`Name`, `Stats`, `Info`, `Type`) son **opcionales** y pueden ir en cualquier orden.
- Si omites un bloque, ese dato queda vacío en todas las bestias creadas.

```
Add 3
```
→ crea 3 bestias vacías (sin nombre, sin stats, sin descripciones, sin tipos).

### Regla clave: cada bloque cicla por su cuenta

Cada bloque tiene su propia cantidad de "grupos" (uno por bestia, en teoría). Si pones **menos grupos que bestias**, la lista de ese bloque **se repite dando la vuelta** (round-robin), y esto pasa **de forma independiente para cada bloque** — no se sincronizan entre sí.

Ejemplo: `Add 10` con 3 nombres, 5 grupos de Stats y 2 grupos de Type:

| Bestia # | Nombre usado | Stats usados | Type usado |
|---|---|---|---|
| 1 | nombre 1 | stats 1 | type 1 |
| 2 | nombre 2 | stats 2 | type 2 |
| 3 | nombre 3 | stats 3 | type 1 |
| 4 | nombre 1 | stats 4 | type 2 |
| 5 | nombre 2 | stats 5 | type 1 |
| ... | ... | ... | ... |

Cada columna avanza a su propio ritmo.

### Comillas obligatorias

Dentro de los paréntesis de datos (emojis, valores, nombres, etc.) **siempre van comillas**, aunque el valor parezca un número. Ningún dato del bestiario está obligado a ser numérico, así que todo se trata como texto:

```
Stats(HP("🔥")("12"))     ✅ correcto
Stats(HP("🔥")(12))       ❌ incorrecto
```

### Dejar algo en blanco

Puedes dejar comillas vacías `""` o paréntesis vacíos `()` para que ese dato quede en blanco en la bestia:

```
Name("")                  → nombre vacío
Stats(HP("")("12"))       → emoji vacío, valor "12"
```

---

### 3.1 `Name(...)` — nombres

```
Name("Zorro")
Name("Ana","Beto","Cami")
```

Una lista simple de nombres separados por comas. Cicla si hay menos nombres que bestias.

---

### 3.2 `Stats(...)` — stats (HP, ataque, etc.)

Cada stat se escribe como `Etiqueta("emoji")("valor")`.

**Si solo estás añadiendo 1 bestia**, no hace falta agrupar con paréntesis extra:

```
Add 1 Stats(HP("🔥")("12"),XP("🟢")("85"))
```

**Si añades varias bestias con stats distintos**, agrupa cada set de stats entre paréntesis, separados por comas:

```
Add 2 Stats((HP("🔥")("12")), (HP("🔥")("20"),XP("🟢")("5")))
```
→ bestia 1 tiene solo HP=12; bestia 2 tiene HP=20 y XP=5.

Si todas las bestias comparten los mismos stats, puedes usar la forma simple sin agrupar aunque sean varias — se repetirá igual para todas:

```
Add 5 Stats(HP("🔥")("10"))
```
→ las 5 bestias tienen HP=10.

---

### 3.3 `Info(...)` — cajas de descripción

Define **solo los títulos** de las cajas de descripción (el contenido/texto siempre empieza vacío, se llena luego en EDIT).

```
Add 1 Info("Descripción","Historia")
```
→ crea 2 cajas: "Descripción" y "Historia", ambas con texto vacío.

Para varias bestias con distintos títulos, agrupa igual que Stats:

```
Add 2 Info(("Descripción"), ("Descripción","Comportamiento"))
```

---

### 3.4 `Type(...)` — tipos

Cada tipo se escribe como `("emoji")("nombre")`.

```
Add 1 Type(("🔥")("Fuego"),("🐺")("Bestia"))
```

Para varias bestias con tipos distintos:

```
Add 2 Type((("🔥")("Fuego")), (("🌊")("Agua"),("🐟")("Pez")))
```
→ bestia 1: tipo Fuego. Bestia 2: tipos Agua y Pez.

---

## 4. Ejemplo completo

```
Add 3 Name("Lobo","Dragón","Sirena") Stats((HP("❤")("40")), (HP("❤")("90"),ATK("⚔")("30")), (HP("❤")("25"))) Info("Descripción","Hábitat") Type((("🐺")("Bestia")), (("🐲")("Dragón"),("🔥")("Fuego")), (("🌊")("Agua")))
```

Esto crea 3 bestias distintas (Lobo, Dragón, Sirena), cada una con sus propios stats y tipos, y las 3 comparten la misma estructura de cajas de descripción (Descripción / Hábitat, vacías).

---

## 4. `Del` — borrar bestias

```
Del(#1,#2,#3)
Del(#1_#3)
Del(#1_#3,#6_#9,#11)
```

- Los números son los **IDs** que ves junto al nombre en la pestaña EDIT (`#1`, `#2`, etc.), no el orden en que las creaste si luego las moviste.
- `Del(#1,#2,#3)` borra esas 3 bestias puntuales.
- `Del(#1_#3)` borra el rango del 1 al 3 (equivale a `#1,#2,#3`).
- `Del(#1_#3,#6_#9,#11)` mezcla rangos y sueltos: borra 1-3, 6-9 y la 11.

Los IDs fuera de rango simplemente se ignoran. No pide confirmación, así que ojo.

---

## 5. `Edit` — editar bestias existentes

```
Edit #1,#2,#3 [Name(...)] [Stats(...)] [Info(...)] [Type(...)]
Edit #1_#3 [Name(...)] [Stats(...)] [Info(...)] [Type(...)]
```

Igual que en `Del`, la selección usa los IDs (`#N`) o rangos (`#N_#M`), y se puede mezclar. Después de la selección van los mismos 4 bloques que en `Add`, en cualquier orden y todos opcionales: **lo que no menciones, no se toca.**

### 5.1 `Name(...)`

Funciona igual que en `Add`: una lista de nombres que se reparte entre las bestias seleccionadas (cicla si hay menos nombres que bestias).

```
Edit #1,#2 Name("Lobo Alfa","Dragón Rojo")
```

### 5.2 `Stats(...)` — editar/añadir stats por nombre

Formato: `"NombreDelStat"(Emoji("..."),Name("..."),Value("..."))`. El nombre entre comillas de afuera es la **clave de búsqueda** (busca un stat existente con esa etiqueta). Dentro, solo pones los campos que quieres cambiar — los que omitas quedan igual:

```
Edit #1 Stats("HP"(Value("999")))
```
→ solo cambia el valor de HP, deja emoji y nombre como estaban.

```
Edit #1 Stats("HP"(Emoji("💀"),Name("Vida"),Value("50")))
```
→ cambia los 3 campos del stat que se llamaba "HP".

Si el stat buscado **no existe**, se crea nuevo con lo que le hayas puesto (los campos no dados quedan vacíos, y el nombre del stat nuevo es el `Name(...)` si lo diste, o si no, la clave de búsqueda misma):

```
Edit #1 Stats("Suerte"(Emoji("🍀"),Value("7")))
```
→ como no existía un stat "Suerte", se crea uno con emoji 🍀, nombre "Suerte" y valor "7".

Varios stats a la vez, separados por coma:
```
Edit #1 Stats("HP"(Value("100")), "ATK"(Value("30")))
```

**Aplicar lo mismo a varias bestias:** si escribes un solo set de ediciones (como arriba), se aplica igual a todas las bestias seleccionadas. Si quieres ediciones distintas por bestia, agrúpalas entre paréntesis extra (mismo truco que en `Add`):

```
Edit #1,#2 Stats((("HP"(Value("50")))), (("HP"(Value("200")))))
```
→ bestia #1 → HP=50; bestia #2 → HP=200.

### 5.3 `Info(...)` — renombrar (o añadir) cajas de descripción

Formato: `"NombreActual"("NuevoNombre")`. Busca la caja por su título actual y le pone el nuevo. El **texto no se toca nunca** desde la terminal, solo el título.

```
Edit #1 Info("Descripción"("Sobre la bestia"))
```
→ la caja que se llamaba "Descripción" ahora se llama "Sobre la bestia" (su texto sigue igual).

Si no existe una caja con ese nombre, se crea una nueva con el título dado (texto vacío):

```
Edit #1 Info("Curiosidades"("Datos curiosos"))
```
→ como no había caja "Curiosidades", se crea una nueva llamada "Datos curiosos".

Varias a la vez: `Info("Descripción"("Nuevo1"), "Hábitat"("Nuevo2"))`.

### 5.4 `Type(...)` — editar/añadir tipos por nombre

Igual que Stats pero solo con `Emoji(...)` y `Name(...)`:

```
Edit #1 Type("Bestia"(Emoji("🐾")))
```
→ solo cambia el emoji del tipo "Bestia", deja el nombre igual.

```
Edit #1 Type("Fuego"(Name("Ígneo")))
```
→ renombra el tipo "Fuego" a "Ígneo" (emoji queda igual).

Si el tipo buscado no existe, se añade nuevo con lo dado (igual lógica que Stats).

### 5.5 Ejemplo combinado

```
Edit #1,#2,#3 Name("A","B") Stats("HP"(Value("100"))) Type("Bestia"(Emoji("🐾"))) Info("Descripción"("Resumen"))
```
- Nombres: bestia 1 → "A", bestia 2 → "B", bestia 3 → "A" (cicla).
- Stats, Type e Info: mismo cambio aplicado igual a las 3 bestias (un solo set, sin agrupar por bestia).

---

## Resumen rápido

| Comando | Limited | Qué hace |
|---|---|---|
| `Limited On` / `Limited Off` | — | Activa/desactiva comandos limited |
| `Limited` | — | Muestra el estado actual |
| `Clear all` | ✅ sí | Borra todas las bestias |
| `Add <n> ...` | ❌ no | Crea `n` bestias con los bloques dados |
| `Del(#..)` | ❌ no | Borra bestias por ID o rango |
| `Edit #.. ...` | ❌ no | Edita/añade nombre, stats, info y tipos en bestias existentes |

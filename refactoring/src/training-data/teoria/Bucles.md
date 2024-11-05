## Apuntes: Bucles en Programación

Los bucles son estructuras de control que permiten ejecutar un bloque de código repetidamente. Existen varios tipos, cada uno con sus características y usos.

**Tipos de Bucles:**

- **`for`**: Ideal para iterar un número específico de veces.

  - **Sintaxis:** `for (inicialización; condición; incremento/decremento) { ... }`
  - **Ejemplo:**
    ```javascript
    for (let i = 0; i < 10; i++) {
      console.log(i); // Imprime del 0 al 9
    }
    ```
  - **Explicación:** `i` se inicializa en 0. El bucle continúa mientras `i` sea menor que 10, incrementando `i` en 1 tras cada iteración.

- **`while`**: Ejecuta un bloque de código mientras una condición sea verdadera. ¡Cuidado con los bucles infinitos!

  - **Sintaxis:** `while (condición) { ... }`
  - **Ejemplo:**
    ```javascript
    let i = 0;
    while (i < 10) {
      console.log(i); // Imprime del 0 al 9
      i++;
    }
    ```
  - **Explicación:** El bucle se ejecuta mientras `i` sea menor que 10. `i++` incrementa `i` en cada iteración.

- **`do...while`**: Similar a `while`, pero la condición se evalúa _después_ de ejecutar el bloque de código, garantizando al menos una ejecución.

  - **Sintaxis:** `do { ... } while (condición);`
  - **Ejemplo:**
    ```javascript
    let i = 0;
    do {
      console.log(i); // Imprime del 0 al 9
      i++;
    } while (i < 10);
    ```
  - **Explicación:** El bloque dentro de `do...while` se ejecuta una vez. Luego se evalúa `i < 10`. Si es verdadera, el bucle continúa; si es falsa, termina.

- **`for...in`**: Itera sobre las propiedades enumerables de un objeto.

  - **Sintaxis:** `for (const property in object) { ... }`
  - **Ejemplo:**
    ```javascript
    const obj = { a: 1, b: 2, c: 3 };
    for (const property in obj) {
      console.log(`${property}: ${obj[property]}`);
    }
    ```
  - **Explicación:** Itera sobre las propiedades 'a', 'b' y 'c' de `obj`.

- **`for...of`**: Itera sobre los valores de un iterable (arrays, strings, maps, sets).
  - **Sintaxis:** `for (const value of iterable) { ... }`
  - **Ejemplo:**
    ```javascript
    const arr = [1, 2, 3];
    for (const value of arr) {
      console.log(value); // Imprime 1, 2, 3
    }
    ```
  - **Explicación:** Itera sobre los valores de `arr`.

**Control de flujo dentro de bucles:**

- **`break`**: Termina la ejecución del bucle por completo.
- **`continue`**: Salta a la siguiente iteración del bucle.

**Ejemplos adicionales (Completar):**

- Calcular la suma de los números del 1 al 100:

  ```javascript
  let suma = 0;
  for (let i = 1; i <= 100; i++) {
    suma += i;
  }
  console.log(suma); // Imprime 5050
  ```

- Imprimir los números pares del 1 al 20:

  ```javascript
  for (let i = 2; i <= 20; i += 2) {
    console.log(i);
  }
  ```

- Recorrer un array y encontrar el elemento mayor:
  ```javascript
  const arr = [5, 2, 9, 1, 5, 6];
  let mayor = arr[0];
  for (let i = 1; i < arr.length; i++) {
    if (arr[i] > mayor) {
      mayor = arr[i];
    }
  }
  console.log(mayor); // Imprime 9
  ```

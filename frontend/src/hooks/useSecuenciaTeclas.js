import { useEffect, useRef } from "react";

// Hook genérico y reutilizable: detecta cuándo el usuario tecleó, en
// orden, la secuencia indicada en `secuencia` (comparando por e.key en
// minúsculas) y entonces llama a `alCoincidir`. No usa librerías externas;
// solo un buffer circular del tamaño de la secuencia.
//
// Ejemplo (código Konami):
//   useSecuenciaTeclas(
//     ["arrowup","arrowup","arrowdown","arrowdown","arrowleft","arrowright","arrowleft","arrowright","b","a"],
//     () => setMostrarCreditos(true)
//   );

export function useSecuenciaTeclas(secuencia, alCoincidir) {
  const buffer = useRef([]);

  useEffect(() => {
    function manejarTecla(e) {
      const tecla = e.key.toLowerCase();
      buffer.current = [...buffer.current, tecla].slice(-secuencia.length);

      const coincide =
        buffer.current.length === secuencia.length &&
        buffer.current.every((t, i) => t === secuencia[i]);

      if (coincide) {
        buffer.current = [];
        alCoincidir();
      }
    }

    window.addEventListener("keydown", manejarTecla);
    return () => window.removeEventListener("keydown", manejarTecla);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [secuencia.join(","), alCoincidir]);
}

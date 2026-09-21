import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { establecerToken } from "./api";

const AuthContexto = createContext(null);

const CLAVE_ALMACENAMIENTO = "bookswap:sesion";

export function AuthProveedor({ children }) {
  const [sesion, setSesion] = useState(null);
  const [cargandoSesion, setCargandoSesion] = useState(true);

  useEffect(() => {
    const guardada = localStorage.getItem(CLAVE_ALMACENAMIENTO);
    if (guardada) {
      try {
        const datos = JSON.parse(guardada);
        establecerToken(datos.token);
        setSesion(datos);
      } catch {
        localStorage.removeItem(CLAVE_ALMACENAMIENTO);
      }
    }
    setCargandoSesion(false);
  }, []);

  const iniciarSesion = useCallback((usuario, token) => {
    const datos = { usuario, token };
    establecerToken(token);
    localStorage.setItem(CLAVE_ALMACENAMIENTO, JSON.stringify(datos));
    setSesion(datos);
  }, []);

  const cerrarSesion = useCallback(() => {
    establecerToken(null);
    localStorage.removeItem(CLAVE_ALMACENAMIENTO);
    setSesion(null);
  }, []);

  return (
    <AuthContexto.Provider value={{ sesion, cargandoSesion, iniciarSesion, cerrarSesion }}>
      {children}
    </AuthContexto.Provider>
  );
}

export function useAuth() {
  const contexto = useContext(AuthContexto);
  if (!contexto) throw new Error("useAuth debe usarse dentro de <AuthProveedor>");
  return contexto;
}

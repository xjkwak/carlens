import React, { createContext, useContext, useEffect, useState } from "react";
import Keycloak from "keycloak-js";

interface AuthContextType {
  isAuthenticated: boolean;
  keycloak: Keycloak | null;
  isLoading: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | null>(null);

// Create a singleton Keycloak instance
let keycloakInstance: Keycloak | null = null;
let isInitializing = false;
let initPromise: Promise<boolean> | null = null;

const getKeycloakInstance = () => {
  if (!keycloakInstance) {
    keycloakInstance = new Keycloak({
      url: import.meta.env.VITE_KEYCLOAK_URL || "http://localhost:8080/",
      realm: import.meta.env.VITE_KEYCLOAK_REALM || "myrealm",
      clientId: import.meta.env.VITE_KEYCLOAK_CLIENT_ID || "frontend-app",
    });
  }
  return keycloakInstance;
};

const initializeKeycloak = (): Promise<boolean> => {
  if (initPromise) {
    return initPromise;
  }

  if (isInitializing) {
    return new Promise((resolve) => {
      const checkInit = () => {
        if (!isInitializing) {
          resolve(keycloakInstance?.authenticated || false);
        } else {
          setTimeout(checkInit, 100);
        }
      };
      checkInit();
    });
  }

  isInitializing = true;
  const keycloak = getKeycloakInstance();

  initPromise = keycloak
    .init({
      onLoad: "login-required",
      pkceMethod: "S256",
      checkLoginIframe: false,
    })
    .then((auth) => {
      isInitializing = false;
      return auth;
    })
    .catch((err) => {
      isInitializing = false;
      initPromise = null;
      throw err;
    });

  return initPromise;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [keycloak, setKeycloak] = useState<Keycloak | null>(null);

  useEffect(() => {
    const keycloak = getKeycloakInstance();
    setKeycloak(keycloak);

    initializeKeycloak()
      .then((auth) => {
        setIsAuthenticated(auth);
        setIsLoading(false);
        if (auth) {
          console.log("User authenticated:", keycloak.tokenParsed);
        }
      })
      .catch((err) => {
        console.error("Keycloak initialization failed:", err);
        setError(err.message || "Authentication failed");
        setIsLoading(false);
      });
  }, []);

  const value: AuthContextType = {
    isAuthenticated,
    keycloak,
    isLoading,
    error,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

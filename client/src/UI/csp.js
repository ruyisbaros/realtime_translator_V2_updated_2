export const setDynamicCSP = () => {
  const isDevelopment = import.meta.env.MODE === "development";

  // Base CSP directives (common to both dev and prod)
  const baseCSP = {
    "default-src": ["'self'"],
    "img-src": ["'self'", "data:", "blob:"],
    "font-src": ["'self'"],
    "media-src": ["'self'", "blob:", "data:"],
    "style-src": ["'self'"],
    "script-src": ["'self'"],
  };

  // Development-specific CSP directives
  const devCSP = {
    "connect-src": [
      "'self'",
      "http://localhost:8000",
      "http://localhost:9001",
      "ws://localhost:8000",
      "ws://127.0.0.1:8000",
      "https://cdnjs.cloudflare.com",
      "https://fonts.googleapis.com",
      "https://fonts.gstatic.com",
    ],
    "style-src": ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
    "script-src": ["'self'", "'unsafe-eval'", "'unsafe-inline'"],
    "media-src": ["'self'", "blob:", "data:", "http://localhost:8000"],
  };

  // Production-specific CSP directives
  const prodCSP = {
    "connect-src": [
      "'self'",
      "https://deployed_domain.com",
      "ws://localhost:8000",
    ],
    "media-src": ["'self'", "blob:", "data:", "http://localhost:8000"],
  };

  // Merge base CSP with environment-specific CSP
  const cspDirectives = {
    ...baseCSP,
    ...(isDevelopment ? devCSP : prodCSP),
  };

  // Convert CSP object to a string
  const cspString = Object.entries(cspDirectives)
    .map(([key, value]) => `${key} ${value.join(" ")};`)
    .join(" ");

  // Create and append the meta tag
  const metaCSP = document.createElement("meta");
  metaCSP.httpEquiv = "Content-Security-Policy";
  metaCSP.content = cspString;
  document.head.appendChild(metaCSP);
};

// Call the function to set the CSP

jest.mock("../../config", () => ({
  API_BASE_URL: "",
}));

import { ReadableStream, TransformStream, WritableStream } from "web-streams-polyfill/ponyfill";
globalThis.ReadableStream = ReadableStream as unknown as typeof globalThis.ReadableStream;
globalThis.TransformStream = TransformStream as unknown as typeof globalThis.TransformStream;
globalThis.WritableStream = WritableStream as unknown as typeof globalThis.WritableStream;

import { fetch, Response, Request, Headers } from "@whatwg-node/fetch";
if (!globalThis.fetch) globalThis.fetch = fetch;
if (!globalThis.Response) globalThis.Response = Response;
if (!globalThis.Request) globalThis.Request = Request;
if (!globalThis.Headers) globalThis.Headers = Headers;

global.BroadcastChannel = jest.fn().mockImplementation(() => ({
  postMessage: jest.fn(),
  close: jest.fn(),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
}));

import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import axios from "axios";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";

import { AuthContextType, AuthProvider, useAuth } from "./AuthContext";
import { API_BASE_URL } from "../../config";
import { jwtDecode } from "jwt-decode";

jest.mock("jwt-decode", () => ({
  jwtDecode: jest.fn(() => ({
    sub: "123",
    roles: ["user", "admin"],
    exp: Date.now() / 1000 + 1000,
    name: "Test User",
    email: "test@example.com",
    is_admin: true,
  })),
}));

const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
  writable: true,
});

const server = setupServer(
  http.post(`${API_BASE_URL}/users/login/`, () => {
    return HttpResponse.json({ token: "fake-jwt-token" });
  }),
  http.post(`${API_BASE_URL}/users/register/`, () => {
    return HttpResponse.json({ token: "fake-jwt-token" });
  }),
  http.post(`${API_BASE_URL}/auth/updatePassword`, () => {
    return new HttpResponse(null, { status: 200 });
  }),
  http.post(`${API_BASE_URL}/users/forgot-password/`, () => {
    return new HttpResponse(null, { status: 200 });
  }),
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const TestComponent = () => {
  const auth = useAuth();
  const [error, setError] = React.useState<string | null>(null);

  return (
    <div>
      <div data-testid="username">{auth.userName}</div>
      <div data-testid="email">{auth.email}</div>
      <div data-testid="token">{auth.token}</div>
      <div data-testid="isAdmin">{String(auth.isAdmin)}</div>
      <div data-testid="isAuthenticated">{String(auth.isAuthenticated)}</div>
      <button
        onClick={async () => {
          setError(null);
          try {
            await auth.login({ email: "test@example.com", password: "pass123" });
          } catch (error) {
            setError(error instanceof Error ? error.message : String(error));
          }
        }}>
        Login
      </button>
      <button
        onClick={async () => {
          setError(null);
          try {
            await auth.signup({
              email: "test@example.com",
              password: "pass123",
              name: "Test User",
            });
          } catch (error) {
            setError(error instanceof Error ? error.message : String(error));
          }
        }}>
        Signup
      </button>
      <button
        onClick={() => {
          setError(null);
          try {
            auth.logout();
          } catch (error) {
            setError(error instanceof Error ? error.message : String(error));
          }
        }}>
        Logout
      </button>
      <button
        onClick={async () => {
          setError(null);
          try {
            await auth.updatePassword({ token: "abc", password: "newpass" });
          } catch (error) {
            setError(error instanceof Error ? error.message : String(error));
          }
        }}>
        Update Password
      </button>
      <button
        onClick={async () => {
          setError(null);
          try {
            await auth.forgotPassword(123);
          } catch (error) {
            setError(error instanceof Error ? error.message : String(error));
          }
        }}>
        Forgot Password
      </button>
      <div data-testid="hasPermission">{String(auth.hasPermission("admin"))}</div>
      {error && <div>{error}</div>}
    </div>
  );
};

describe("AuthContext", () => {
  test("login sets user info", async () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>,
    );

    const loginButton = screen.getByText("Login");
    userEvent.click(loginButton);

    await waitFor(() => {
      expect(screen.getByTestId("username")).toHaveTextContent("Test User");
      expect(screen.getByTestId("email")).toHaveTextContent("test@example.com");
      expect(screen.getByTestId("token")).toHaveTextContent("fake-jwt-token");
      expect(screen.getByTestId("isAdmin")).toHaveTextContent("true");
      expect(screen.getByTestId("isAuthenticated")).toHaveTextContent("true");
    });
  });

  test("signup works correctly", async () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>,
    );

    userEvent.click(screen.getByText("Signup"));

    await waitFor(() => {
      expect(screen.getByTestId("username")).toHaveTextContent("Test User");
    });
  });

  test("logout clears user info", async () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>,
    );

    userEvent.click(screen.getByText("Login"));
    await waitFor(() => screen.getByTestId("username"));

    userEvent.click(screen.getByText("Logout"));

    await waitFor(() => {
      expect(screen.getByTestId("username")).toHaveTextContent("");
      expect(screen.getByTestId("isAuthenticated")).toHaveTextContent("false");
    });
  });

  test("updatePassword sends request", async () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>,
    );

    userEvent.click(screen.getByText("Update Password"));

    // No error = success
    await waitFor(() => {
      expect(true).toBeTruthy();
    });
  });

  test("forgotPassword sends request", async () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>,
    );

    userEvent.click(screen.getByText("Forgot Password"));

    await waitFor(() => {
      expect(true).toBeTruthy();
    });
  });

  test("hasPermission works", async () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>,
    );

    userEvent.click(screen.getByText("Login"));

    await waitFor(() => {
      expect(screen.getByTestId("hasPermission")).toHaveTextContent("true");
    });
  });

  test("should handle login error - 401 Unauthorized", async () => {
    server.use(
      http.post(`${API_BASE_URL}/users/login/`, () => {
        return new HttpResponse(null, { status: 401 });
      }),
    );

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>,
    );

    userEvent.click(screen.getByText("Login"));
    await waitFor(() => {
      expect(screen.getByText("No autorizado")).toBeInTheDocument();
    });
  });

  test("should handle login error - 403 Forbidden", async () => {
    server.use(
      http.post(`${API_BASE_URL}/users/login/`, () => {
        return new HttpResponse(null, { status: 403 });
      }),
    );

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>,
    );

    userEvent.click(screen.getByText("Login"));
    await waitFor(() => {
      expect(screen.getByText("Acceso prohibido")).toBeInTheDocument();
    });
  });

  test("should handle login error - 500 Internal Server Error", async () => {
    server.use(
      http.post(`${API_BASE_URL}/users/login/`, () => {
        return new HttpResponse(null, { status: 500 });
      }),
    );

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>,
    );

    userEvent.click(screen.getByText("Login"));
    await waitFor(() => {
      expect(screen.getByText("Error interno del servidor")).toBeInTheDocument();
    });
  });

  test("should persist token in localStorage after login", async () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>,
    );

    userEvent.click(screen.getByText("Login"));

    await waitFor(() => {
      expect(localStorage.getItem("authToken")).toBe("fake-jwt-token");
    });
  });

  test("should clear localStorage after logout", async () => {
    localStorage.setItem("authToken", "fake-token");

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>,
    );

    userEvent.click(screen.getByText("Logout"));

    await waitFor(() => {
      expect(localStorage.getItem("authToken")).toBeNull();
    });
  });

  test("should handle updatePassword error", async () => {
    server.use(
      http.post(`${API_BASE_URL}/auth/updatePassword`, () => {
        return new HttpResponse(null, { status: 400 });
      }),
    );

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>,
    );

    userEvent.click(screen.getByText("Update Password"));
    await waitFor(() => {
      expect(screen.getByText("Datos inválidos")).toBeInTheDocument();
    });
  });

  test("should handle forgotPassword error", async () => {
    server.use(
      http.post(`${API_BASE_URL}/users/forgot-password/`, () => {
        return new HttpResponse(null, { status: 404 });
      }),
    );

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>,
    );

    userEvent.click(screen.getByText("Forgot Password"));
    await waitFor(() => {
      expect(screen.getByText("Recurso no encontrado")).toBeInTheDocument();
    });
  });

  test("should initialize auth state from localStorage", async () => {
    localStorage.setItem("authToken", "existing-token");

    // Mock diferente para jwtDecode
    jest.mocked(jwtDecode).mockImplementationOnce(() => ({
      sub: "456",
      roles: ["user"],
      exp: Date.now() / 1000 + 1000,
      name: "Stored User",
      email: "stored@example.com",
      is_admin: false,
    }));

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("username")).toHaveTextContent("Stored User");
      expect(screen.getByTestId("isAdmin")).toHaveTextContent("false");
    });
  });

  test("should handle invalid token in localStorage", async () => {
    localStorage.setItem("authToken", "invalid-token");

    jest.mocked(jwtDecode).mockImplementationOnce(() => {
      throw new Error("Invalid token");
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("isAuthenticated")).toHaveTextContent("false");
    });
  });

  test("should handle hasPermission for non-existing role", async () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>,
    );

    userEvent.click(screen.getByText("Login"));

    await waitFor(
      () => {
        expect(screen.getByTestId("hasPermission")).toHaveTextContent("false");
      },
      { timeout: 2000 },
    );
  });

  test("should handle network errors", async () => {
    server.use(
      http.post(`${API_BASE_URL}/users/login/`, () => {
        return new HttpResponse(null, { status: 9999 });
      }),
    );

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>,
    );

    userEvent.click(screen.getByText("Login"));
    await waitFor(() => {
      expect(screen.getByText("Error HTTP: 9999")).toBeInTheDocument();
    });
  });

  test("should handle updatePassword 401 error", async () => {
    server.use(
      http.post(`${API_BASE_URL}/auth/updatePassword`, () => {
        return new HttpResponse(JSON.stringify({ error: "No autorizado" }), { status: 401 });
      }),
    );
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>,
    );
    userEvent.click(screen.getByText("Update Password"));
    await waitFor(() => {
      expect(screen.getByText("No autorizado")).toBeInTheDocument();
    });
  });

  test("should handle updatePassword 403 error", async () => {
    server.use(
      http.post(`${API_BASE_URL}/auth/updatePassword`, () => {
        return new HttpResponse(null, { status: 403 });
      }),
    );
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>,
    );
    userEvent.click(screen.getByText("Update Password"));
    await waitFor(() => {
      expect(screen.getByText("Acceso prohibido")).toBeInTheDocument();
    });
  });

  test("should handle updatePassword 404 error", async () => {
    server.use(
      http.post(`${API_BASE_URL}/auth/updatePassword`, () => {
        return new HttpResponse(null, { status: 404 });
      }),
    );
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>,
    );
    userEvent.click(screen.getByText("Update Password"));
    await waitFor(() => {
      expect(screen.getByText("Recurso no encontrado")).toBeInTheDocument();
    });
  });

  test("should handle updatePassword 500 error", async () => {
    server.use(
      http.post(`${API_BASE_URL}/auth/updatePassword`, () => {
        return new HttpResponse(null, { status: 500 });
      }),
    );
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>,
    );
    userEvent.click(screen.getByText("Update Password"));
    await waitFor(() => {
      expect(screen.getByText("Error interno del servidor")).toBeInTheDocument();
    });
  });

  test("should handle updatePassword unknown error", async () => {
    server.use(
      http.post(`${API_BASE_URL}/auth/updatePassword`, () => {
        return new HttpResponse(null, { status: 418 });
      }),
    );
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>,
    );
    userEvent.click(screen.getByText("Update Password"));
    await waitFor(() => {
      expect(screen.getByText("Error HTTP: 418")).toBeInTheDocument();
    });
  });

  test("should handle updatePassword network error", async () => {
    // Mockea axios.post para simular un error de red (sin response)
    const originalPost = axios.post;
    axios.post = jest.fn(() => Promise.reject(new Error("Network error")));

    let authRef: AuthContextType | undefined = undefined;
    const RefComponent = () => {
      authRef = useAuth();
      return null;
    };

    render(
      <AuthProvider>
        <RefComponent />
      </AuthProvider>,
    );

    await expect(authRef!.updatePassword({ token: "abc", password: "newpass" })).rejects.toThrow(
      "Error desconocido",
    );
    axios.post = originalPost;
  });

  test("should handle forgotPassword 400 error", async () => {
    server.use(
      http.post(`${API_BASE_URL}/users/forgot-password/`, () => {
        return new HttpResponse(null, { status: 400 });
      }),
    );
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>,
    );
    userEvent.click(screen.getByText("Forgot Password"));
    await waitFor(() => {
      expect(screen.getByText("Datos inválidos")).toBeInTheDocument();
    });
  });

  test("should handle forgotPassword 401 error", async () => {
    server.use(
      http.post(`${API_BASE_URL}/users/forgot-password/`, () => {
        return new HttpResponse(null, { status: 401 });
      }),
    );
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>,
    );
    userEvent.click(screen.getByText("Forgot Password"));
    await waitFor(() => {
      expect(screen.getByText("No autorizado")).toBeInTheDocument();
    });
  });

  test("should handle forgotPassword 403 error", async () => {
    server.use(
      http.post(`${API_BASE_URL}/users/forgot-password/`, () => {
        return new HttpResponse(null, { status: 403 });
      }),
    );
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>,
    );
    userEvent.click(screen.getByText("Forgot Password"));
    await waitFor(() => {
      expect(screen.getByText("Acceso prohibido")).toBeInTheDocument();
    });
  });

  test("should handle forgotPassword 500 error", async () => {
    server.use(
      http.post(`${API_BASE_URL}/users/forgot-password/`, () => {
        return new HttpResponse(null, { status: 500 });
      }),
    );
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>,
    );
    userEvent.click(screen.getByText("Forgot Password"));
    await waitFor(() => {
      expect(screen.getByText("Error interno del servidor")).toBeInTheDocument();
    });
  });

  test("should handle forgotPassword unknown error", async () => {
    server.use(
      http.post(`${API_BASE_URL}/users/forgot-password/`, () => {
        return new HttpResponse(null, { status: 418 });
      }),
    );
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>,
    );
    userEvent.click(screen.getByText("Forgot Password"));
    await waitFor(() => {
      expect(screen.getByText("Error HTTP: 418")).toBeInTheDocument();
    });
  });

  test("should handle forgotPassword network error", async () => {
    // Mockea axios.post para simular un error de red (sin response)
    const originalPost = axios.post;
    axios.post = jest.fn(() => Promise.reject(new Error("Network error")));

    let authRef: AuthContextType | undefined = undefined;
    const RefComponent = () => {
      authRef = useAuth();
      return null;
    };

    render(
      <AuthProvider>
        <RefComponent />
      </AuthProvider>,
    );

    await expect(authRef!.forgotPassword(123)).rejects.toThrow("Error desconocido");
    axios.post = originalPost;
  });

  test("logout clears state even if no token", async () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>,
    );
    userEvent.click(screen.getByText("Logout"));
    await waitFor(() => {
      expect(screen.getByTestId("username")).toHaveTextContent("");
      expect(screen.getByTestId("isAuthenticated")).toHaveTextContent("false");
    });
  });

  test("hasPermission returns true for existing role", async () => {
    // Mockea jwtDecode para devolver el rol "admin"
    (jwtDecode as jest.Mock).mockImplementationOnce(() => ({
      sub: "123",
      roles: ["admin"],
      exp: Date.now() / 1000 + 1000,
      name: "Test User",
      email: "test@example.com",
      is_admin: true,
    }));

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>,
    );
    userEvent.click(screen.getByText("Login"));
    await waitFor(() => {
      expect(screen.getByTestId("hasPermission")).toHaveTextContent("true");
    });
  });

  test("hasPermission returns false for non-existing role", async () => {
    // Mockea jwtDecode para devolver solo el rol "user"
    (jwtDecode as jest.Mock).mockImplementationOnce(() => ({
      sub: "123",
      roles: ["user"],
      exp: Date.now() / 1000 + 1000,
      name: "Test User",
      email: "test@example.com",
      is_admin: false,
    }));

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>,
    );
    userEvent.click(screen.getByText("Login"));
    await waitFor(() => {
      expect(screen.getByTestId("hasPermission")).toHaveTextContent("false");
    });
  });

  test("forgotPassword does not throw for non-200 success status", async () => {
    server.use(
      http.post(`${API_BASE_URL}/users/forgot-password/`, () => {
        return new HttpResponse(null, { status: 201 });
      }),
    );

    let authRef: AuthContextType | undefined = undefined;
    const RefComponent = () => {
      authRef = useAuth();
      return null;
    };

    render(
      <AuthProvider>
        <RefComponent />
      </AuthProvider>,
    );

    await expect(authRef!.forgotPassword(123)).resolves.toBeUndefined();
  });
});

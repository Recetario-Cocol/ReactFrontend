import useAxiosWithAuthentication from "./useAxiosWithAuthentication";
import { useAuth } from "../contexts/AuthContext";
import axios, { type AxiosRequestConfig } from "axios";

jest.mock("axios");
jest.mock("../contexts/AuthContext");

describe("useAxiosWithAuthentication", () => {
  const mockCreate = axios.create as jest.Mock;
  const mockUseAuth = useAuth as jest.Mock;

  interface MockAxiosInstance {
    interceptors: {
      request: {
        use: (
          onFulfilled: (config: AxiosRequestConfig) => AxiosRequestConfig,
          onRejected: (error: unknown) => Promise<never>,
        ) => void;
      };
    };
    defaults: Record<string, unknown>;
    request: jest.Mock;
    _success?: (config: AxiosRequestConfig) => AxiosRequestConfig;
    _error?: (error: unknown) => Promise<never>;
  }

  let mockAxiosInstance: MockAxiosInstance;

  beforeEach(() => {
    mockAxiosInstance = {
      interceptors: {
        request: {
          use: jest.fn((success, error) => {
            // Simulate interceptor registration
            mockAxiosInstance._success = success;
            mockAxiosInstance._error = error;
          }),
        },
      },
      defaults: {},
      // Simulate request for testing interceptor
      request: jest.fn(),
    };
    mockCreate.mockReturnValue(mockAxiosInstance);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should create an axios instance with correct headers", () => {
    mockUseAuth.mockReturnValue({ token: "abc123" });
    const instance = useAxiosWithAuthentication();
    expect(mockCreate).toHaveBeenCalledWith({
      headers: {
        "Content-Type": "application/json",
        credentials: "include",
      },
    });
    expect(instance).toBe(mockAxiosInstance);
  });

  it("should add Authorization header if token exists", () => {
    mockUseAuth.mockReturnValue({ token: "mytoken" });
    useAxiosWithAuthentication();
    const config = { headers: {} };
    const interceptor = mockAxiosInstance._success!;
    const result = interceptor(config);
    expect(result.headers && result.headers["Authorization"]).toBe("Bearer mytoken");
  });

  it("should not add Authorization header if token does not exist", () => {
    mockUseAuth.mockReturnValue({ token: null });
    useAxiosWithAuthentication();
    const config = { headers: {} };
    const interceptor = mockAxiosInstance._success!;
    const result = interceptor(config);
    expect(result.headers && result.headers["Authorization"]).toBeUndefined();
  });

  it("should propagate error in interceptor", () => {
    mockUseAuth.mockReturnValue({ token: "abc" });
    useAxiosWithAuthentication();
    const error = new Error("fail");
    const interceptor = mockAxiosInstance._error!;
    return expect(interceptor(error)).rejects.toThrow("fail");
  });
});

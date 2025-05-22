import { useDashboardService } from "./useDashboardService";
import useAxiosWithAuthentication from "../core/useAxiosWithAuthentication";

jest.mock("../core/useAxiosWithAuthentication");

const mockGet = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
  (useAxiosWithAuthentication as jest.Mock).mockReturnValue({
    get: mockGet,
  });
});

describe("useDashboardService", () => {
  it("should call getTotales and return dashboard data", async () => {
    const mockData = { unidades: 1, productos: 2, recetas: 3 };
    mockGet.mockResolvedValueOnce({ data: mockData });

    const service = useDashboardService();
    const result = await service.getTotales();

    expect(useAxiosWithAuthentication).toHaveBeenCalled();
    expect(mockGet).toHaveBeenCalledWith(expect.stringContaining("/recetario/dashboard/totales/"));
    expect(result).toEqual(mockData);
  });

  it("should propagate errors from getTotales", async () => {
    const error = new Error("Network error");
    mockGet.mockRejectedValueOnce(error);

    const service = useDashboardService();
    await expect(service.getTotales()).rejects.toThrow("Network error");
  });
});

interface PaymentInitRequest {
  total_amount: number;
  currency: string;
  tran_id: string;
  success_url: string;
  fail_url: string;
  cancel_url: string;
  cus_name: string;
  cus_phone: string;
  cus_email: string;
  cus_add1: string;
  cus_city: string;
  cus_country: string;
  product_name: string;
  product_category: string;
  product_profile: string;
}

interface PaymentInitResponse {
  status: string;
  GatewayPageURL?: string;
  failedreason?: string;
  sessionkey?: string;
}

interface ValidationResponse {
  status: string;
  validated: boolean;
  error?: string;
}

export class SslcommerzService {
  private storeId: string;
  private storePassword: string;
  private isLive: boolean;

  constructor(storeId?: string, storePassword?: string, isLive?: boolean) {
    this.storeId = storeId || process.env.SSLCOMMERZ_STORE_ID || "";
    this.storePassword = storePassword || process.env.SSLCOMMERZ_STORE_PASSWORD || "";
    this.isLive = isLive !== undefined ? isLive : String(process.env.SSLCOMMERZ_IS_LIVE) === "true";
  }

  static async fromDB(env: { DB: D1Database }): Promise<SslcommerzService> {
    const { queryFirst } = await import("@/lib/db/queries");

    const getSetting = async (key: string): Promise<string> => {
      const row = await queryFirst<{ setting_value: string }>(
        env, "SELECT setting_value FROM company_settings WHERE setting_key = ?", [key]
      );
      return row?.setting_value || "";
    };

    const [testId, testPass, liveId, livePass, mode] = await Promise.all([
      getSetting("sslcommerz_test_store_id"),
      getSetting("sslcommerz_test_store_password"),
      getSetting("sslcommerz_live_store_id"),
      getSetting("sslcommerz_live_store_password"),
      getSetting("sslcommerz_mode"),
    ]);

    const isLive = mode === "live";
    const storeId = isLive ? liveId : testId;
    const storePassword = isLive ? livePass : testPass;

    return new SslcommerzService(storeId || undefined, storePassword || undefined, isLive);
  }

  private getBaseUrl(): string {
    return this.isLive
      ? "https://secure.sslcommerz.com"
      : "https://sandbox.sslcommerz.com";
  }

  private getApiUrl(): string {
    return `${this.getBaseUrl()}/gwprocess/v4/api.php`;
  }

  private getValidationUrl(valId: string): string {
    return `${this.getBaseUrl()}/validator/api/validationserverAPI.php?val_id=${valId}&store_id=${this.storeId}&store_passwd=${this.storePassword}&v=1&format=json`;
  }

  async initPayment(request: PaymentInitRequest): Promise<string> {
    const formData = new URLSearchParams();
    formData.append("store_id", this.storeId);
    formData.append("store_passwd", this.storePassword);
    formData.append("total_amount", request.total_amount.toString());
    formData.append("currency", request.currency);
    formData.append("tran_id", request.tran_id);
    formData.append("success_url", request.success_url);
    formData.append("fail_url", request.fail_url);
    formData.append("cancel_url", request.cancel_url);
    formData.append("cus_name", request.cus_name);
    formData.append("cus_phone", request.cus_phone);
    formData.append("cus_email", request.cus_email);
    formData.append("cus_add1", request.cus_add1);
    formData.append("cus_city", request.cus_city);
    formData.append("cus_country", request.cus_country);
    formData.append("product_name", request.product_name);
    formData.append("product_category", request.product_category);
    formData.append("product_profile", request.product_profile);

    const response = await fetch(this.getApiUrl(), {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: formData.toString(),
    });

    const data = await response.json() as PaymentInitResponse;

    if (data.status === "SUCCESS" && data.GatewayPageURL) {
      return data.GatewayPageURL;
    }
    throw new Error(data.failedreason || "Payment initialization failed");
  }

  async validatePayment(valId: string): Promise<ValidationResponse> {
    const response = await fetch(this.getValidationUrl(valId));
    const data = await response.json() as { status: string; error?: string };

    return {
      status: data.status,
      validated: data.status === "VALID" || data.status === "VALIDATED",
      error: data.error,
    };
  }

  validateIPNResponse(data: Record<string, string>): boolean {
    const isValidStatus = data.status === "VALID";
    const hasVerifyHash = !!data.verify_hash;
    const hasVerifySign = !!data.verify_sign;
    return isValidStatus && (hasVerifyHash || hasVerifySign);
  }

  generateTransactionId(): string {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `SSLCZ${timestamp}${random}`;
  }
}

export async function initPayment(
  request: PaymentInitRequest,
  storeId: string,
  storePasswd: string,
  isSandbox = true
): Promise<string> {
  const service = new SslcommerzService(storeId, storePasswd, !isSandbox);
  return service.initPayment(request);
}

export function validateIPN(
  data: Record<string, string>,
  _storePasswd: string
): boolean {
  const service = new SslcommerzService();
  return service.validateIPNResponse(data);
}

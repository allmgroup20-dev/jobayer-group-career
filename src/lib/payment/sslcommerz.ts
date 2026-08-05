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
  amount?: number;
  currency?: string;
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
    const data = await response.json() as { status: string; amount?: string | number; currency?: string; error?: string };

    const amount = typeof data.amount === "number" ? data.amount : data.amount !== undefined ? Number(data.amount) : undefined;

    return {
      status: data.status,
      validated: data.status === "VALID" || data.status === "VALIDATED",
      amount: Number.isFinite(amount) ? amount : undefined,
      currency: data.currency,
      error: data.error,
    };
  }

  /**
   * C1: Cryptographically verify the IPN `verify_sign` (SHA-512) using the
   * gateway's algorithm: SHA512(store_password | value1 | value2 | ...) where
   * the values are the POST fields named in `verify_key`, in order.
   */
  async verifyIPNSignature(data: Record<string, string>): Promise<boolean> {
    const verifyKey = data.verify_key;
    const verifySign = (data.verify_sign || data.verify_hash || "").toLowerCase();
    if (!verifyKey || !verifySign) return false;
    if (!this.storePassword) return false;

    const keys = verifyKey.split(",").map((k) => k.trim()).filter(Boolean);
    if (keys.length === 0) return false;

    const verifyString = [this.storePassword, ...keys.map((k) => data[k] || "")].join("|");
    const encoder = new TextEncoder();
    const digest = await crypto.subtle.digest("SHA-512", encoder.encode(verifyString));
    const calculated = Array.from(new Uint8Array(digest))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    return calculated === verifySign;
  }

  /**
   * C2: Mandatory gateway validation. Requires `val_id` and verifies the
   * transaction server-side with the SSLCommerz validation API, including
   * amount reconciliation when the gateway reports it.
   */
  async verifyWithGateway(data: Record<string, string>): Promise<boolean> {
    const valId = data.val_id;
    if (!valId) return false;
    const validation = await this.validatePayment(valId);
    if (!validation.validated) return false;

    const amount = Number(data.amount);
    if (Number.isFinite(amount) && validation.amount !== undefined && Math.abs(validation.amount - amount) > 0.01) {
      return false;
    }
    return true;
  }

  /**
   * C1: Full IPN gate — signature MUST verify AND gateway validation MUST pass.
   */
  async validateIPNResponse(data: Record<string, string>): Promise<boolean> {
    if (data.status !== "VALID") return false;
    if (!data.val_id || !data.tran_id) return false;
    const signatureOk = await this.verifyIPNSignature(data);
    if (!signatureOk) return false;
    return this.verifyWithGateway(data);
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

export async function validateIPN(
  data: Record<string, string>,
  storePasswd: string
): Promise<boolean> {
  const service = new SslcommerzService(undefined, storePasswd);
  return service.validateIPNResponse(data);
}

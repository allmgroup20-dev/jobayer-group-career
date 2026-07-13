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

export async function initPayment(request: PaymentInitRequest, storeId: string, storePasswd: string, isSandbox = true): Promise<string> {
  const baseUrl = isSandbox
    ? "https://sandbox.sslcommerz.com/gwprocess/v4/api.php"
    : "https://secure.sslcommerz.com/gwprocess/v4/api.php";

  const formData = new URLSearchParams();
  formData.append("store_id", storeId);
  formData.append("store_passwd", storePasswd);
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

  try {
    const response = await fetch(baseUrl, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: formData.toString(),
    });

    const data = await response.json() as { status: string; GatewayPageURL?: string; failedreason?: string };

    if (data.status === "SUCCESS" && data.GatewayPageURL) {
      return data.GatewayPageURL;
    }
    throw new Error(data.failedreason || "Payment initialization failed");
  } catch (error) {
    throw new Error(`SSLCommerz error: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}

export function validateIPN(data: Record<string, string>, storePasswd: string): boolean {
  const isValidSSL = data.status === "VALID";
  const verifyHash = data.verify_hash;
  return isValidSSL && !!verifyHash;
}

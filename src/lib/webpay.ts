import { IntegrationApiKeys, IntegrationCommerceCodes, WebpayPlus } from 'transbank-sdk';

const WEBPAY_COMMERCE_CODE =
  process.env.TRANSBANK_WEBPAY_COMMERCE_CODE ?? IntegrationCommerceCodes.WEBPAY_PLUS;

const WEBPAY_API_KEY =
  process.env.TRANSBANK_WEBPAY_API_KEY ?? IntegrationApiKeys.WEBPAY;

export interface WebpayCreateResult {
  token: string;
  url: string;
}

export interface WebpayCommitResult {
  status: string;
  response_code: number;
  buy_order: string;
  session_id: string;
  authorization_code?: string;
  amount?: number;
}

export function getWebpayBuyOrder(reservationId: string): string {
  return `TS${reservationId.replace(/-/g, '').slice(0, 24)}`;
}

function getWebpayTransaction() {
  return WebpayPlus.Transaction.buildForIntegration(WEBPAY_COMMERCE_CODE, WEBPAY_API_KEY);
}

export async function createWebpayTransaction(
  buyOrder: string,
  sessionId: string,
  amount: number,
  returnUrl: string
): Promise<WebpayCreateResult> {
  const response = await getWebpayTransaction().create(buyOrder, sessionId, amount, returnUrl);

  return {
    token: response.token,
    url: response.url,
  };
}

export async function commitWebpayTransaction(token: string): Promise<WebpayCommitResult> {
  const response = await getWebpayTransaction().commit(token);

  return {
    status: response.status,
    response_code: response.response_code,
    buy_order: response.buy_order,
    session_id: response.session_id,
    authorization_code: response.authorization_code,
    amount: response.amount,
  };
}

export interface PayphoneConfig {
  token: string;
  storeId: string;
  responseUrl: string;
  cancellationUrl: string;
}

let _config: PayphoneConfig | null = null;

export function getPayphoneConfig(): PayphoneConfig {
  if (_config) return _config;

  const token = process.env.PAYPHONE_TOKEN;
  if (!token) throw new Error("[payphone] PAYPHONE_TOKEN no está configurado.");

  const storeId = process.env.PAYPHONE_STORE_ID;
  if (!storeId) throw new Error("[payphone] PAYPHONE_STORE_ID no está configurado.");

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://rglestudio.com";

  _config = {
    token,
    storeId,
    responseUrl: `${siteUrl}/pago-respuesta`,
    cancellationUrl: `${siteUrl}/checkout`,
  };

  return _config;
}

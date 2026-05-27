import { IKushki, init } from "@kushki/js-sdk";
import { ICard, initCardToken } from "@kushki/js-sdk/Card";

/**
 * Tokenizacion de tarjetas con KushkiJS (lado cliente).
 *
 * Compartido por el checkout (`card-form`) y la actualizacion del
 * metodo de pago (`update-card-form`). La tokenizacion ocurre en el
 * navegador mediante campos alojados en iframes: el numero de tarjeta
 * nunca toca nuestro DOM (requisito PCI).
 *
 * IMPORTANTE: este modulo solo debe importarse desde Client Components.
 * Solo puede haber UN formulario de tarjeta montado a la vez (la
 * instancia del SDK es de modulo).
 */

let kushkiInstance: IKushki | null = null;
let cardInstance: ICard | null = null;

/**
 * Inicializa el SDK y monta los campos de tarjeta (iframes) en los
 * contenedores con id `kushki-card-name` / `-number` / `-expiry` / `-cvv`.
 *
 * @param amount Monto de referencia para la tokenizacion.
 * @param isSubscription `true` para generar un token de suscripcion.
 */
export async function initKushkiCardFields(
  amount: number,
  isSubscription: boolean,
): Promise<void> {
  const merchantId = process.env.NEXT_PUBLIC_KUSHKI_PUBLIC_MERCHANT_ID;
  if (!merchantId) {
    throw new Error("Missing NEXT_PUBLIC_KUSHKI_PUBLIC_MERCHANT_ID");
  }

  kushkiInstance = await init({
    inTest: process.env.NEXT_PUBLIC_KUSHKI_ENV !== "production",
    publicCredentialId: merchantId,
  });

  cardInstance = await initCardToken(kushkiInstance, {
    currency: "USD",
    amount: {
      subtotalIva: 0,
      subtotalIva0: amount,
      iva: 0,
    },
    isSubscription,
    fields: {
      cardholderName: {
        selector: "kushki-card-name",
        placeholder: "Ej: Juan Perez",
      },
      cardNumber: {
        selector: "kushki-card-number",
        placeholder: "0000 0000 0000 0000",
      },
      expirationDate: {
        selector: "kushki-card-expiry",
        placeholder: "MM/YY",
      },
      cvv: {
        selector: "kushki-card-cvv",
        placeholder: "123",
      },
    },
    styles: {
      container: {
        height: "100%",
        display: "flex",
        alignItems: "center",
      },
      input: {
        width: "100%",
        border: "none",
        outline: "none",
        background: "transparent",
        fontFamily: "inherit",
        fontSize: "14px",
        color: "inherit",
      },
    },
  });
}

/**
 * Solicita el token de la tarjeta ingresada.
 * @throws si el SDK no fue inicializado o no se obtuvo token.
 */
export async function requestCardToken(): Promise<string> {
  if (!cardInstance) {
    throw new Error("Card SDK no ha sido inicializado");
  }

  const response = await cardInstance.requestToken();
  if (!response || !response.token) {
    throw new Error("No se pudo obtener el token de la tarjeta");
  }

  return response.token;
}

/** Libera las instancias del SDK. Llamar al desmontar el formulario. */
export function resetKushkiCardFields(): void {
  kushkiInstance = null;
  cardInstance = null;
}

/**
 * Utilities for Pix EMV QRCPS (BR Code) Payload Generation
 * Standard defined by Banco Central do Brasil (BCB)
 */

/**
 * Calculates CRC16 CCITT-FALSE (Polynomial 0x1021, Init 0xFFFF)
 * Required by Banco Central do Brasil for Pix BR Code validation.
 */
export function calculatePixCRC16(payload: string): string {
  let crc = 0xffff;
  for (let i = 0; i < payload.length; i++) {
    crc ^= payload.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      if ((crc & 0x8000) !== 0) {
        crc = ((crc << 1) ^ 0x1021) & 0xffff;
      } else {
        crc = (crc << 1) & 0xffff;
      }
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, "0");
}

function formatEMV(id: string, value: string): string {
  const len = value.length.toString().padStart(2, "0");
  return `${id}${len}${value}`;
}

export interface PixPayloadOptions {
  key: string; // Chave Pix (CNPJ, CPF, E-mail, Telefone ou Chave Aleatória)
  name?: string; // Nome do recebedor (Max 25 caracteres, sem acentos)
  city?: string; // Cidade do recebedor (Max 15 caracteres, sem acentos)
  amount?: number; // Valor em R$
  txid?: string; // ID da transação (Padrão: ***)
}

/**
 * Generates a valid static EMV BR Code payload compliant with BACEN specifications.
 */
export function generatePixPayload(options: PixPayloadOptions): string {
  const cleanKey = options.key.trim();
  const cleanName = (options.name || "APERTA START")
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .substring(0, 25)
    .toUpperCase();

  const cleanCity = (options.city || "SAO PAULO")
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .substring(0, 15)
    .toUpperCase();

  const rawTxid = (options.txid || "***").replace(/[^a-zA-Z0-9]/g, "").substring(0, 25) || "***";

  // ID 26: Merchant Account Information (Pix)
  const gui = formatEMV("00", "br.gov.bcb.pix");
  const keyField = formatEMV("01", cleanKey);
  const merchantAccountInfo = formatEMV("26", `${gui}${keyField}`);

  // ID 52: Merchant Category Code (0000)
  const mcc = formatEMV("52", "0000");

  // ID 53: Transaction Currency (986 = BRL)
  const currency = formatEMV("53", "986");

  // ID 54: Transaction Amount (opcional)
  const amountStr = options.amount && options.amount > 0 ? formatEMV("54", options.amount.toFixed(2)) : "";

  // ID 58: Country Code (BR)
  const country = formatEMV("58", "BR");

  // ID 59: Merchant Name
  const merchantName = formatEMV("59", cleanName);

  // ID 60: Merchant City
  const merchantCity = formatEMV("60", cleanCity);

  // ID 62: Additional Data Field Template
  const txidField = formatEMV("05", rawTxid);
  const additionalData = formatEMV("62", txidField);

  // Assembles payload string before CRC calculation
  const basePayload = `000201${merchantAccountInfo}${mcc}${currency}${amountStr}${country}${merchantName}${merchantCity}${additionalData}6304`;

  // Calculates CRC16 CCITT-FALSE
  const checksum = calculatePixCRC16(basePayload);
  return `${basePayload}${checksum}`;
}

/**
 * Intel HEX decoder for ATmega328P Flash memory.
 */

export interface HexRecord {
  byteCount: number;
  address: number;
  recordType: number;
  data: Uint8Array;
  checksum: number;
}

/**
 * Parses an Intel HEX formatted string into a flat Uint8Array program memory buffer.
 * Supports Record Types 00 (Data), 01 (EOF), 02 (Extended Segment), 04 (Extended Linear Address).
 *
 * @param hexString Intel HEX string content
 * @param flashSize Total Flash memory size (default 32768 bytes for ATmega328P)
 */
export function parseIntelHex(hexString: string, flashSize: number = 32768): Uint8Array {
  const buffer = new Uint8Array(flashSize);
  let upperAddress = 0;

  const lines = hexString.split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed.startsWith(':')) continue;

    // Minimum line length: :CCAAAATTCC (11 chars)
    if (trimmed.length < 11) {
      continue;
    }

    const byteCount = parseInt(trimmed.substring(1, 3), 16);
    const address = parseInt(trimmed.substring(3, 7), 16);
    const recordType = parseInt(trimmed.substring(7, 9), 16);

    // Verify line length matches declared byte count
    if (trimmed.length < 11 + byteCount * 2) {
      continue;
    }

    // Verify record checksum
    let sum = byteCount + (address >> 8) + (address & 0xff) + recordType;
    for (let i = 0; i < byteCount; i++) {
      const byte = parseInt(trimmed.substring(9 + i * 2, 11 + i * 2), 16);
      sum += byte;
    }
    const expectedChecksum = parseInt(trimmed.substring(9 + byteCount * 2, 11 + byteCount * 2), 16);
    if ((sum + expectedChecksum) & 0xff) {
      // Checksum mismatch, skip corrupted record
      continue;
    }

    if (recordType === 0x00) {
      // Data Record
      const fullAddress = upperAddress + address;
      for (let i = 0; i < byteCount; i++) {
        const byte = parseInt(trimmed.substring(9 + i * 2, 11 + i * 2), 16);
        if (fullAddress + i < buffer.length) {
          buffer[fullAddress + i] = byte;
        }
      }
    } else if (recordType === 0x01) {
      // End of File Record
      break;
    } else if (recordType === 0x02) {
      // Extended Segment Address Record
      upperAddress = parseInt(trimmed.substring(9, 13), 16) << 4;
    } else if (recordType === 0x04) {
      // Extended Linear Address Record
      upperAddress = parseInt(trimmed.substring(9, 13), 16) << 16;
    }
  }

  return buffer;
}

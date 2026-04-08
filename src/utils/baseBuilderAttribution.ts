import { encodePacked, toHex, type Hex } from 'viem';

/**
 * Appends Base Builder attribution to transaction data
 * Format: {txData}{schemaData}{schemaId}{ercSuffix}
 * 
 * @param txData - Original transaction data
 * @param builderCode - Base Builder code (e.g., "bc_qau7xvtg")
 * @returns Transaction data with attribution appended
 */
export function appendBaseBuilderAttribution(
  txData: Hex,
  builderCode: string
): Hex {
  // Schema ID for canonical registry
  const schemaId = 7;
  
  // ERC-7739 compliance byte
  const ercSuffix = 0;
  
  // Attribution contract address (Base canonical registry)
  // Using the standard Base attribution address
  const attributionAddress = '0x0000000000000000000000000000000000000000' as const;
  
  // Encode the builder code as bytes (with comma prefix and suffix)
  const schemaData = toHex(',' + builderCode + ',');
  
  // Pack everything together: txData + schemaData + schemaId + ercSuffix + attributionAddress
  const dataWithAttribution = encodePacked(
    ['bytes', 'bytes', 'uint8', 'uint8', 'address'],
    [txData, schemaData, schemaId, ercSuffix, attributionAddress]
  );
  
  return dataWithAttribution;
}

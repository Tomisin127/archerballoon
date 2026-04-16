import { Attribution } from 'ox/erc8021';
import type { Hex } from 'viem';

/**
 * Builder code registered on base.dev
 */
export const BASE_BUILDER_CODE = 'bc_fmi9q4ud';

/**
 * ERC-8021 attribution suffix generated using the ox library.
 * Append this to any transaction's calldata to attribute it to this app.
 */
export const ERC8021_SUFFIX = Attribution.toDataSuffix({
  codes: [BASE_BUILDER_CODE],
}) as Hex;

/**
 * Appends the ERC-8021 Base Builder attribution suffix to transaction calldata.
 *
 * @param txData - Original transaction calldata
 * @returns Transaction calldata with attribution suffix appended
 */
export function appendBaseBuilderAttribution(txData: Hex): Hex {
  return (txData + ERC8021_SUFFIX.slice(2)) as Hex;
}

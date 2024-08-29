import * as zlib from 'zlib';
import { promisify } from 'util';

const inflate = promisify(zlib.unzip);

export const decompressData = async (compressedData: Buffer): Promise<string> => {
  try {
    return (await inflate(compressedData)).toString('utf-8');
  } catch (error) {
    throw new Error(`Decompression failed: ${error instanceof Error ? error.message : 'Unknown Error'}`);
  }
};

export const isValidData = (data: string): boolean => typeof data === 'string' && data.trim().length > 0;

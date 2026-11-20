import { decodeText } from '../decode';
import type { FormatReader } from '../types';

export const readText: FormatReader = async (input) => ({
  text: decodeText(input.bytes, input.contentType),
});

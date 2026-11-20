import type { NewDocument } from '@/lib/documents';

/** Why an import did not produce a text. The UI turns these into messages. */
export type ImportFailure =
  | 'unsupported' // not a format we read
  | 'too-large'
  | 'unreadable' // damaged, or not what its name claims
  | 'empty' // read fine, but there are no words in it
  | 'no-text' // a PDF of page images, with no text layer
  | 'protected' // DRM or a password
  | 'bad-address' // not a web address we can fetch
  | 'refused' // the site answered, but not with the page
  | 'fetch-failed'; // the site, or our way to it, could not be reached

export class ImportError extends Error {
  readonly reason: ImportFailure;

  constructor(reason: ImportFailure, options?: ErrorOptions) {
    super(`Import failed: ${reason}`, options);
    this.name = 'ImportError';
    this.reason = reason;
  }
}

/** Raw material for a format reader, whether it came from a file or a URL. */
export interface ImportInput {
  /** File name, or the last part of the URL. Used to detect the format and as a fallback title. */
  name: string;
  bytes: Uint8Array;
  /** MIME type reported by the browser or server, possibly with a charset; may be empty. */
  contentType: string;
}

/** What a format reader returns. */
export interface ImportedText {
  /** Title found inside the content, if any. */
  title?: string;
  /** Plain text with paragraphs separated by blank lines. */
  text: string;
}

export type FormatReader = (input: ImportInput) => Promise<ImportedText>;

/** Turns files and web pages into documents ready for the library. Failures are ImportErrors. */
export interface TextImporter {
  /** Value for a file input's `accept` attribute. */
  readonly accept: string;
  importFile(file: File): Promise<NewDocument>;
  /** Present only when the app has an endpoint to fetch pages through (see server/). */
  importUrl?: (address: string) => Promise<NewDocument>;
}

/** Where a text came from. Later stages add file and URL imports here. */
export type DocumentSource = { kind: 'paste' } | { kind: 'sample' };

export interface ReadingProgress {
  /**
   * Character offset of the next word to read. An offset, not a word index, so
   * a saved position stays valid if the way text is split into words changes.
   */
  offset: number;
  /** How far through the text, from 0 to 1 (1 means finished). */
  fraction: number;
}

/** Everything about a document except its text; cheap to list. */
export interface DocumentMeta {
  id: string;
  title: string;
  source: DocumentSource;
  wordCount: number;
  createdAt: number;
  /** Last time it was opened or read; lists are ordered by this. */
  lastReadAt: number;
  progress: ReadingProgress;
}

export interface ReadingDocument extends DocumentMeta {
  text: string;
}

export interface NewDocument {
  text: string;
  source: DocumentSource;
  /** Derived from the first line of the text when omitted. */
  title?: string;
}

export interface DocumentRepository {
  /** Most recently read first. */
  list(): Promise<DocumentMeta[]>;
  get(id: string): Promise<ReadingDocument | undefined>;
  create(input: NewDocument): Promise<DocumentMeta>;
  /** Does nothing if the document no longer exists. */
  saveProgress(id: string, progress: ReadingProgress): Promise<void>;
  remove(id: string): Promise<void>;
}

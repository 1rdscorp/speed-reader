/**
 * URL builders: the contract between features. A feature links to another by
 * calling one of these, never by importing from it.
 */
export const paths = {
  home: () => '/',
  /** The reader: a given document, or whatever was read last. */
  read: (documentId?: string) => (documentId ? `/read/${documentId}` : '/read'),
  library: () => '/library',
  settings: () => '/settings',
};

/**
 * URL builders: the contract between features. A feature links to another by
 * calling one of these, never by importing from it.
 */
export const paths = {
  home: () => '/',
  library: () => '/library',
  read: (documentId: string) => `/read/${documentId}`,
};

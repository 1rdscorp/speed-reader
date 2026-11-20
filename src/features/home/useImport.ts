import { useState } from 'react';
import { useNavigate } from 'react-router';
import type { DocumentMeta, NewDocument } from '@/lib/documents';
import { paths } from '@/lib/paths';
import { useServices } from '@/lib/services';
import { describeFailure } from './describeFailure';

interface Source {
  kind: 'file' | 'link';
  name: string;
  load: () => Promise<NewDocument>;
}

export interface ImportState {
  /** Name of what is being read right now, if anything. */
  reading: string | null;
  /** One message per source that could not be added. */
  problems: string[];
  /** How many were added in a run that also had problems. */
  added: number;
}

/**
 * Add texts from files or a link. One clean import opens straight in the
 * reader; several go to the library; anything that fails is explained and
 * the rest is still kept.
 */
export function useImport(onLibraryChange: () => void) {
  const { documents, importer } = useServices();
  const navigate = useNavigate();
  const [state, setState] = useState<ImportState>({ reading: null, problems: [], added: 0 });

  async function run(sources: Source[]) {
    const created: DocumentMeta[] = [];
    const problems: string[] = [];
    for (const source of sources) {
      setState({ reading: source.name, problems: [], added: 0 });
      try {
        created.push(await documents.create(await source.load()));
      } catch (error) {
        problems.push(describeFailure(source.kind, source.name, error));
      }
    }
    setState({ reading: null, problems, added: problems.length > 0 ? created.length : 0 });

    const [only] = created;
    if (problems.length > 0) onLibraryChange();
    else if (only && created.length === 1) await navigate(paths.read(only.id));
    else if (created.length > 1) await navigate(paths.library());
  }

  const { importUrl } = importer;
  return {
    state,
    accept: importer.accept,
    importFiles: (files: File[]) =>
      run(
        files.map((file) => ({
          kind: 'file',
          name: file.name,
          load: () => importer.importFile(file),
        })),
      ),
    /** Undefined when link import is not available in this deployment. */
    importLink:
      importUrl &&
      ((address: string) =>
        run([{ kind: 'link', name: address.trim(), load: () => importUrl(address) }])),
  };
}

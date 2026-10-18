import { useEffect } from 'react';
import { installUnloadGuard } from '../../lib/unload-guard';
export function useUnsavedChanges(dirty: boolean) {
  useEffect(() => dirty ? installUnloadGuard(window) : undefined, [dirty]);
}

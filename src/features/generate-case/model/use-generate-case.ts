import { useCallback, useEffect, useRef, useState } from 'react';
import type { DetectiveCase } from '@/entities/case';
import type { CaseGenerationRequest } from '@/shared/api';
import { requestCase } from '../api/request-case';
import { describeCaseError } from '../lib/describe-case-error';

export type GenerateCaseStatus = 'idle' | 'generating' | 'done' | 'error';

export function useGenerateCase(onGenerated: (detectiveCase: DetectiveCase) => void) {
  const [status, setStatus] = useState<GenerateCaseStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const controllerRef = useRef<AbortController | null>(null);

  useEffect(() => () => controllerRef.current?.abort(), []);

  const generate = useCallback(
    (request: CaseGenerationRequest) => {
      controllerRef.current?.abort();
      const controller = new AbortController();
      controllerRef.current = controller;

      setStatus('generating');
      setError(null);

      requestCase(request, controller.signal)
        .then((detectiveCase) => {
          if (controller.signal.aborted) return;
          onGenerated(detectiveCase);
          setStatus('done');
        })
        .catch((reason: unknown) => {
          if (controller.signal.aborted) return;
          setError(describeCaseError(reason));
          setStatus('error');
        });
    },
    [onGenerated],
  );

  const cancel = useCallback(() => {
    controllerRef.current?.abort();
    controllerRef.current = null;
    setStatus('idle');
  }, []);

  return { status, error, generate, cancel } as const;
}

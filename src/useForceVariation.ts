import * as React from 'react';
import { GrowthBook } from '.';

const SESSION_STORAGE_KEY = 'gb_forced_variations';

export function useForceVariation(
  growthbook: GrowthBook
): {
  forceVariation: (key: string, variation: number) => void;
  renderCount: number;
} {
  const [init, setInit] = React.useState(false);
  const [renderCount, setRenderCount] = React.useState(1);

  React.useEffect(() => {
    if (init) return;
    setInit(true);
    if (process.env.NODE_ENV === 'production') {
      return;
    }
    try {
      let forced = window.sessionStorage.getItem(SESSION_STORAGE_KEY);
      if (forced) {
        let json = JSON.parse(forced);
        const f = (growthbook.context.forcedVariations =
          growthbook.context.forcedVariations || {});
        Object.keys(json).forEach((key) => {
          f[key] = json[key];
        });
        setRenderCount((i) => i + 1);
      }
    } catch (e) {
      // Ignore sessionStorage errors
    }
  }, [growthbook, init]);

  const forceVariation = /*#__PURE__*/ React.useCallback(
    (key: string, variation: number) => {
      growthbook.context.forcedVariations =
        growthbook.context.forcedVariations || {};
      growthbook.context.forcedVariations[key] = variation;
      setRenderCount((i) => i + 1);
      try {
        let forced = window.sessionStorage.getItem(SESSION_STORAGE_KEY) || '{}';
        let json = JSON.parse(forced);
        json[key] = variation;
        window.sessionStorage.setItem(
          SESSION_STORAGE_KEY,
          JSON.stringify(json)
        );
      } catch (e) {
        // Ignore sessionStorage errors
      }
    },
    [growthbook]
  );

  return {
    renderCount,
    forceVariation,
  };
}

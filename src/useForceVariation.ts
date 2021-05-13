import * as React from 'react';
import { GrowthBookUser } from '.';

const SESSION_STORAGE_KEY = 'gb_forced_variations';

export function useForceVariation(
  user: GrowthBookUser<any> | null
): {
  forceVariation: (key: string, variation: number) => void;
  renderCount: number;
} {
  const [init, setInit] = React.useState(false);
  const [renderCount, setRenderCount] = React.useState(1);

  React.useEffect(() => {
    if (!user || init) return;
    setInit(true);
    if (process.env.NODE_ENV === 'production') {
      return;
    }
    try {
      let forced = window.sessionStorage.getItem(SESSION_STORAGE_KEY);
      if (forced) {
        let json = JSON.parse(forced);
        Object.keys(json).forEach((key) => {
          user?.client.forcedVariations.set(key, json[key]);
        });
        setRenderCount((i) => i + 1);
      }
    } catch (e) {
      // Ignore sessionStorage errors
    }
  }, [user, init]);

  const forceVariation = /*#__PURE__*/ React.useCallback(
    (key: string, variation: number) => {
      if (!user) return;
      user.client.forcedVariations.set(key, variation);
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
    [user]
  );

  return {
    renderCount,
    forceVariation,
  };
}

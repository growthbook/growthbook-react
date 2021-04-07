import * as React from 'react';
import type {
  Experiment,
  ExperimentResults,
} from '@growthbook/growthbook/dist/types';
import type GrowthBookUser from '@growthbook/growthbook/dist/user';
import VariationSwitcher from './dev/VariationSwitcher';

export { default as GrowthBookClient } from '@growthbook/growthbook';
export type { default as GrowthBookUser } from '@growthbook/growthbook/dist/user';
export type {
  Experiment,
  ExperimentResults,
  ExperimentOverride,
  TrackExperimentFunctionProps,
  ClientConfigInterface,
} from '@growthbook/growthbook/dist/types';

const SESSION_STORAGE_KEY = 'gb_forced_variations';

export const GrowthBookContext = React.createContext<{
  user: GrowthBookUser | null;
}>({ user: null });

function runExperiment<T>(
  user: GrowthBookUser | null,
  exp: Experiment<T>
): ExperimentResults<T> {
  if (user) {
    return user.experiment(exp);
  }

  return {
    experiment: exp,
    variationId: 0,
    inExperiment: false,
    index: 0,
    value: exp.variations[0],
  };
}

export function useExperiment<T>(exp: Experiment<T>): ExperimentResults<T> {
  const { user } = React.useContext(GrowthBookContext);
  return runExperiment(user, exp);
}

export interface WithRunExperimentProps {
  runExperiment: <T>(exp: Experiment<T>) => ExperimentResults<T>;
}

export const withRunExperiment = <P extends WithRunExperimentProps>(
  Component: React.ComponentType<P>
): React.ComponentType<Omit<P, keyof WithRunExperimentProps>> => (
  props
): JSX.Element => (
  <GrowthBookContext.Consumer>
    {({ user }): JSX.Element => {
      return (
        <Component
          {...(props as P)}
          runExperiment={(exp) => runExperiment(user, exp)}
        />
      );
    }}
  </GrowthBookContext.Consumer>
);

function useForceVariation(
  user: GrowthBookUser | null
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

export const GrowthBookProvider: React.FC<{
  user?: GrowthBookUser | null;
  disableDevMode?: boolean;
}> = ({ children, user = null, disableDevMode = false }) => {
  // Mark this as pure since there are no side-effects
  // In production, these variables are never used so they will be removed from the output
  const { renderCount, forceVariation } = /*#__PURE__*/ useForceVariation(user);

  let devMode: React.ReactNode = null;
  if (process.env.NODE_ENV !== 'production') {
    if (user && !disableDevMode) {
      devMode = (
        <VariationSwitcher
          user={user}
          renderCount={renderCount}
          forceVariation={forceVariation}
        />
      );
    }
  }

  return (
    <GrowthBookContext.Provider
      value={{
        user,
      }}
    >
      {children}
      {devMode}
    </GrowthBookContext.Provider>
  );
};

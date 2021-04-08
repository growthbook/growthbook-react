import * as React from 'react';
import type {
  Experiment,
  ExperimentResults,
} from '@growthbook/growthbook/dist/types';
import type GrowthBookUser from '@growthbook/growthbook/dist/user';
import VariationSwitcher from './dev/VariationSwitcher';
import { useForceVariation } from './useForceVariation';
import { runExperiment } from './runExperiment';

export { default as GrowthBookClient } from '@growthbook/growthbook';
export type { default as GrowthBookUser } from '@growthbook/growthbook/dist/user';
export type {
  Experiment,
  ExperimentResults,
  ExperimentOverride,
  TrackExperimentFunctionProps,
  ClientConfigInterface,
} from '@growthbook/growthbook/dist/types';

export type GrowthBookContextValue = {
  user: GrowthBookUser | null;
};
export interface WithRunExperimentProps {
  runExperiment: <T>(exp: Experiment<T>) => ExperimentResults<T>;
}

export const GrowthBookContext = React.createContext<GrowthBookContextValue>({
  user: null,
});

export function useExperiment<T>(exp: Experiment<T>): ExperimentResults<T> {
  const { user } = React.useContext(GrowthBookContext);
  return runExperiment(user, exp);
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

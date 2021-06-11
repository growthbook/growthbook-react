import * as React from 'react';
import type { Experiment, Result } from '@growthbook/growthbook';
import { default as GrowthBook } from '@growthbook/growthbook';

import VariationSwitcher from './dev/VariationSwitcher';
import { useForceVariation } from './useForceVariation';

export {
  default as GrowthBook,
  Context,
  Experiment,
  Result,
  ExperimentOverride,
} from '@growthbook/growthbook';

export type GrowthBookContextValue = {
  growthbook: GrowthBook;
};
export interface WithRunExperimentProps {
  runExperiment: <T>(exp: Experiment<T>) => Result<T>;
}

export const GrowthBookContext = React.createContext<GrowthBookContextValue>({
  growthbook: new GrowthBook({}),
});

export function useExperiment<T>(exp: Experiment<T>): Result<T> {
  const { growthbook } = React.useContext(GrowthBookContext);
  return growthbook.run(exp);
}

export const withRunExperiment = <P extends WithRunExperimentProps>(
  Component: React.ComponentType<P>
): React.ComponentType<Omit<P, keyof WithRunExperimentProps>> => (
  props
): JSX.Element => (
  <GrowthBookContext.Consumer>
    {({ growthbook }): JSX.Element => {
      return (
        <Component
          {...(props as P)}
          runExperiment={(exp) => growthbook.run(exp)}
        />
      );
    }}
  </GrowthBookContext.Consumer>
);

export const GrowthBookProvider: React.FC<{
  growthbook: GrowthBook;
  disableDevMode?: boolean;
}> = ({ children, growthbook, disableDevMode = false }) => {
  // Mark this as pure since there are no side-effects
  // In production, these variables are never used so they will be removed from the output
  const { renderCount, forceVariation } = /*#__PURE__*/ useForceVariation(
    growthbook
  );

  let devMode: React.ReactNode = null;
  if (process.env.NODE_ENV !== 'production') {
    if (!disableDevMode) {
      devMode = (
        <VariationSwitcher
          growthbook={growthbook}
          renderCount={renderCount}
          forceVariation={forceVariation}
        />
      );
    }
  }

  return (
    <GrowthBookContext.Provider
      value={{
        growthbook,
      }}
    >
      {children}
      {devMode}
    </GrowthBookContext.Provider>
  );
};

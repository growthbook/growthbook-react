import type {
  Experiment,
  ExperimentResults,
} from '@growthbook/growthbook/dist/types';
import type { GrowthBookUser } from '.';

export function runExperiment<T>(
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

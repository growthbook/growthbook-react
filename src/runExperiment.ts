import type {
  Experiment,
  ExperimentResults,
} from '@growthbook/growthbook/dist/types';
import type { GrowthBookUser } from '.';

export function runExperiment<T>(
  user: GrowthBookUser<any> | null,
  exp: Experiment<T, any>
): ExperimentResults<T, any> {
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

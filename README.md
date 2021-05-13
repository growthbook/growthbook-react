<p align="center"><img src="https://www.growthbook.io/logos/growthbook-logo@2x.png" width="400px" /></p>

# Growth Book - React

Powerful A/B testing for React. [View Demo](https://growthbook.github.io/growthbook-react/)

![Build Status](https://github.com/growthbook/growthbook-react/workflows/Build/badge.svg)

-  **No external dependencies**
-  **Lightweight and fast** (1.9Kb gzipped)
-  **No HTTP requests** everything is defined and evaluated locally
-  Works for both **client and server-side** rendering
-  **Dev Mode** for testing variations and taking screenshots
-  **No flickering or blocking calls**
-  Written in **Typescript** with an extensive test suite
-  Flexible experiment **targeting**
-  **Use your existing event tracking** (GA, Segment, Mixpanel, custom)
-  **Adjust variation weights and targeting** without deploying new code

## Community

Join [our Growth Book Users Slack community](https://join.slack.com/t/growthbookusers/shared_invite/zt-oiq9s1qd-dHHvw4xjpnoRV1QQrq6vUg) if you need help, want to chat, or are thinking of a new feature. We're here to help - and to make Growth Book even better.


## Installation

`yarn add @growthbook/growthbook-react` 

or 

`npm install --save @growthbook/growthbook-react`

## Quick Start

### Step 1: Configure your app 
```tsx
import {
  GrowthBookClient, GrowthBookProvider
} from '@growthbook/growthbook-react'

// Create a client instance and setup tracking
const client = new GrowthBookClient({
  onExperimentViewed: ({experimentId, variationId}) => {
    // Mixpanel, Segment, GA, or custom tracking
    mixpanel.track("Experiment Viewed", {experimentId, variationId})
  }
});

// Specify the user id you want to experiment on
const user = client.user({ id: mixpanel.get_distinct_id() })

export default function App() {
  return (
    <GrowthBookProvider user={user}>
      <OtherComponent/>
    </GrowthBookProvider>
  )
}
```

### Step 2: Run an experiment

```tsx
import { useExperiment } from '@growthbook/growthbook-react'

export default function OtherComponent() {
  const { value } = useExperiment({
    key: "new-headline",
    variations: ["Hello", "Hi", "Good Day"],
  })

  return <h1>{ value }</h1>
}
```

Use class components? We support that too!  [See Example](#react-class-components)

### Step 3: Analyze results

Query your raw data, calculate significance, decide on a winner, and document your findings.

Typically, this is done with one of the following:

*  Online A/B testing calculators
*  Built-in A/B test analysis in Mixpanel/Amplitude
*  Python or R libraries and a Jupyter Notebook

These are all pretty tedious to set up and maintain, which is why created the [Growth Book App](https://www.growthbook.io) 
that automates all the messy and annoying bits and lets you focus on building your product.

## Dev Mode

If `process.env.NODE_ENV !== "production"` AND you are in a browser environment, dev mode is enabled by default. You can override this behavior by explicitly passing in the `disableDevMode` prop to `GrowthBookProvider`.

Dev Mode adds a variation switcher UI that floats on the bottom left of pages.  Use this to easily test out all the experiment combinations. It also includes a screenshot tool to download images of all your variations.

[View Live Demo](https://growthbook.github.io/growthbook-react/)

![Dev Mode Variation Switcher](variation-switcher.png)

## Experiments

The simplest experiment you can define has just 2 fields: `key` and `variations`.

There are a lot more configuration options you can specify.  Here is the full typescript definition:

-  **key** (`string`) - The globally unique tracking key for the experiment
-  **variations** (`any[]`) - The different variations to choose between
-  **weights** (`number[]`) - How to weight traffic between variations. Must add to 1.
-  **status** (`string`) - "running" is the default and always active. "draft" is only active during QA and development.  "stopped" is only active when forcing a winning variation to 100% of users.
-  **coverage** (`number`) - What percent of users should be included in the experiment (between 0 and 1, inclusive)
-  **url** (`string`) - Users can only be included in this experiment if the current URL matches this regex
-  **include** (`() => boolean`) - A callback that returns true if the user should be part of the experiment and false if they should not be
-  **groups** (`string[]`) - Limits the experiment to specific user groups
-  **force** (`number`) - All users included in the experiment will be forced into the specific variation index
-  **randomizationUnit** - What user attribute you want to use to assign variations (defaults to `id`)

## Running Experiments

The useExperiment hook returns an object with a few useful properties

```ts
const {inExperiment, variationId, value} = useExperiment({
    key: "my-experiment",
    variations: ["A", "B"]
});

// If user is part of the experiment
console.log(inExperiment); // true or false

// The index of the assigned variation
console.log(variationId); // 0 or 1

// The value of the assigned variation
console.log(value); // "A" or "B"
```

The `inExperiment` flag can be false if the experiment defines any sort of targeting rules which the user does not pass.  In this case, the user is always assigned index `0`.

### Example Experiments

3-way experiment with uneven variation weights:
```ts
useExperiment({
  key: "3-way-uneven",
  variations: ["A","B","C"],
  weights: [0.5, 0.25, 0.25]
})
```

Slow rollout (10% of users who opted into "beta" features):
```ts
// User is in the "qa" and "beta" groups
const user = client.user({id: "123"}, {
  qa: isQATester(),
  beta: betaFeaturesEnabled()
});

// Later in a component
useExperiment({
  key: "slow-rollout",
  variations: ["A", "B"],
  coverage: 0.1,
  groups: ["beta"]
})
```

Complex variations and custom targeting
```ts
const {value} = useExperiment({
  key: "complex-variations",
  variations: [
    {color: "blue", size: "large"},
    {color: "green", size: "small"}
  ],
  include: () => isPremium || creditsRemaining > 50
});
console.log(value.color, value.size); // blue,large OR green,small
```

Assign variations based on something other than user id
```ts
const user = client.user({
  id: "123",
  companyId: "abc"
});

// Later in a component
useExperiment({
  key: "by-company-id",
  variations: ["A", "B"],
  randomizationUnit: "companyId"
})
// Users in the same company will now always get the same variation
```

### Overriding Experiment Configuration

It's common practice to adjust experiment settings after a test is live.  For example, slowly ramping up traffic, stopping a test automatically if guardrail metrics go down, or rolling out a winning variation.

For example, to roll out a winning variation to 100% of users:
```ts
client.overrides.set("experiment-key", {
    status: 'stopped',
    force: 1
});

// Later in a component
const {value} = useExperiment({
  key: "experiment-key",
  variations: ["A", "B"]
});

console.log(value); // Always "B"
```

The full list of experiment properties you can override is:
*  status
*  force
*  weights
*  coverage
*  groups
*  url

This data structure can be easily seralized and stored in a database or returned from an API.  There is a small helper function if you have all of your overrides in a single JSON object:

```ts
const JSONFromDatabase = {
  "experiment-key-1": {
    "weights": [0.1, 0.9]
  },
  "experiment-key-2": {
    "groups": ["everyone"],
    "coverage": 1
  }
};

client.importOverrides(JSONFromDatabase)
```

If you use the Growth Book App (https://github.com/growthbook/growthbook) to manage experiments, there's a built-in API endpoint you can hit that returns overrides in this exact format.  It's a great way to make sure your experiments are always up-to-date.

## Event Tracking and Analyzing Results

This library only handles assigning variations to users.  The 2 other parts required for an A/B testing platform are Tracking and Analysis.

It's likely you already have some event tracking on your site with the metrics you want to optimize (Google Analytics, Segment, Mixpanel, etc.).

For A/B tests, you just need to track one additional event - when someone views a variation.  

```ts
// Specify a tracking callback when instantiating the client
const client = new GrowthBookClient({
    onExperimentViewed: ({experimentId, variationId}) => {
      // ...
    }
});
```

The object passed to your callback has the following properties:
-  experimentId (the key of the experiment)
-  variationId (the array index of the assigned variation)
-  value (the value of the assigned variation)
-  experiment (the full experiment object)
-  user (the full user object)
-  randomizationUnit (which user attribute was used to assign a variation)

Below are examples for a few popular event tracking tools:

### Google Analytics
```ts
ga('send', 'event', 'experiment', experimentId, variationId, {
  // Custom dimension for easier analysis
  'dimension1': `${experimentId}::${variationId}`
});
```

### Segment
```ts
analytics.track("Experiment Viewed", {
  experimentId,
  variationId
});
```

### Mixpanel
```ts
mixpanel.track("$experiment_started", {
  'Experiment name': experimentId,
  'Variant name': variationId
});
```

### Analysis

For analysis, there are a few options:

*  Online A/B testing calculators
*  Built-in A/B test analysis in Mixpanel/Amplitude
*  Python or R libraries and a Jupyter Notebook
*  The Growth Book App (https://github.com/growthbook/growthbook)

### The Growth Book App

Managing experiments and analyzing results at scale can be complicated, which is why we built the [Growth Book App](https://github.com/growthbook/growthbook).

- Query multiple data sources (Snowflake, Redshift, BigQuery, Mixpanel, Postgres, Athena, and Google Analytics)
- Bayesian statistics engine with support for binomial, count, duration, and revenue metrics
- Drill down into A/B test results (e.g. by browser, country, etc.)
- Lightweight idea board and prioritization framework
- Document everything! (upload screenshots, add markdown comments, and more)
- Automated email alerts when tests become significant

Integration is super easy:

1.  Create a Growth Book API key
2.  Periodically fetch the latest experiment overrides from the API and cache in Redis, Mongo, etc.
3.  At the start of your app, run `client.importOverrides(listFromCache)`

Now you can start/stop tests, adjust coverage and variation weights, and apply a winning variation to 100% of traffic, all within the Growth Book App without deploying code changes to your site.

## React Class Components

If you aren't using functional components, we offer a `withRunExperiment` Higher Order Component instead.

**Note:** This library uses hooks internally, so still requires React 16.8 or above.

```tsx
import {withRunExperiment} from '@growthbook/growthbook-react';

class MyComponent extends Component {
  render() {
    // The `runExperiment` prop is identical to the `useExperiment` hook
    const {value} = this.props.runExperiment({
      key: "headline-test",
      variations: ["Hello World", "Hola Mundo"]
    });
    return <h1>{value}</h1>
  }
}
// Wrap your component in `withRunExperiment`
export default withRunExperiment(MyComponent);
```
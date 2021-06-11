# Growth Book React

Powerful A/B testing for React. [View Demo](https://growthbook.github.io/growthbook-react/)

![Build Status](https://github.com/growthbook/growthbook-js/workflows/Build/badge.svg) ![GZIP Size](https://img.shields.io/badge/gzip%20size-1.45KB-informational) ![NPM Version](https://img.shields.io/npm/v/@growthbook/growthbook-react)

-  **No external dependencies**
-  **Lightweight and fast**
-  **No HTTP requests** everything is defined and evaluated locally
-  Works for both **client and server-side** rendering
-  **Dev Mode** for testing variations and taking screenshots
-  **No flickering or blocking calls**
-  Written in **Typescript** with an extensive test suite
-  Flexible experiment **targeting**
-  **Use your existing event tracking** (GA, Segment, Mixpanel, custom)
-  **Adjust variation weights and targeting** without deploying new code

**Note**: This library is just for running A/B tests in React. To analyze results, use the Growth Book App (https://github.com/growthbook/growthbook).

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
  GrowthBook, GrowthBookProvider
} from '@growthbook/growthbook-react'

// Create a GrowthBook instance
const growthbook = new GrowthBook({
  // The attributes you want to use to assign variations
  user: {
    id: "123"
  },
  // Called every time the user is put into an experiment
  trackingCallback: (experiment, result) => {
    // Mixpanel, Segment, GA, or custom tracking
    mixpanel.track("Experiment Viewed", {
      experiment: experiment.key,
      variation: result.variationId
    })
  }
});

export default function App() {
  return (
    <GrowthBookProvider growthbook={growthbook}>
      <OtherComponent/>
    </GrowthBookProvider>
  )
}
```

### Step 2: Run an experiment

#### Hooks (recommended)

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

#### Class Components

**Note:** This library uses hooks internally, so still requires React 16.8 or above.

```tsx
import { withRunExperiment } from '@growthbook/growthbook-react';

class OtherComponent extends Component {
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
export default withRunExperiment(OtherComponent);
```

### Step 3: Analyze results

Query your raw data, calculate significance, decide on a winner, and document your findings.

The easiest way to accomplish this is with the Growth Book App (https://github.com/growthbook/growthbook), but it's not required. You can use an online A/B test calculator or a Jupyter notebook if you prefer.

## Dev Mode

If `process.env.NODE_ENV !== "production"` AND you are in a browser environment, dev mode is enabled by default. You can override this behavior by explicitly passing in the `disableDevMode` prop to `GrowthBookProvider`.

Dev Mode adds a variation switcher UI that floats on the bottom left of pages.  Use this to easily test out all the experiment combinations. It also includes a screenshot tool to download images of all your variations.

[View Live Demo](https://growthbook.github.io/growthbook-react/)

![Dev Mode Variation Switcher](variation-switcher.png)

## Configuration and Usage

This package is a small React wrapper around the Growth Book javascript library.

Refer to the [@growthbook/growthbook-js](https://github.com/growthbook/growthbook-js) package for full documentation on how to configure the GrowthBook instance and define Experiments.``
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { GrowthBookProvider, GrowthBook } from '../dist';
import Pricing from './Pricing';

const growthbook = new GrowthBook({
  user: {
    id: "1"
  }
});

const App = () => {
  return (
    <GrowthBookProvider 
      growthbook={growthbook}
    >
      <Pricing />
    </GrowthBookProvider>
  );
};

ReactDOM.render(<App />, document.getElementById('root'));

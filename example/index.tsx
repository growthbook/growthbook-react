import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { GrowthBookProvider, GrowthBookClient } from '../dist';
import Pricing from './Pricing';

const client = new GrowthBookClient();
const user = client.user({ id: "1" });

const App = () => {
  return (
    <GrowthBookProvider 
      user={user}
    >
      <Pricing />
    </GrowthBookProvider>
  );
};

ReactDOM.render(<App />, document.getElementById('root'));

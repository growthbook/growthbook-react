import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { GrowthBookClient, GrowthBookProvider, useExperiment } from '../src';
import { act } from '@testing-library/react';

const TestedComponent = () => {
  const { value } = useExperiment({
    key: 'my-test',
    variations: [0, 1],
  });
  return <h1>{value}</h1>;
};

describe('GrowthBookProvider', () => {
  it("renders without crashing and doesn't add additional html", () => {
    const client = new GrowthBookClient();
    const user = client.user({ id: '1' });
    const div = document.createElement('div');
    ReactDOM.render(
      <GrowthBookProvider user={user}>
        <h1>Hello World</h1>
      </GrowthBookProvider>,
      div
    );
    expect(div.innerHTML).toEqual('<h1>Hello World</h1>');
    ReactDOM.unmountComponentAtNode(div);
  });

  it('runs an experiment with the useExperiment hook', () => {
    const client = new GrowthBookClient();
    const user = client.user({ id: '1' });
    const div = document.createElement('div');

    ReactDOM.render(
      <GrowthBookProvider user={user}>
        <TestedComponent />
      </GrowthBookProvider>,
      div
    );
    expect(div.innerHTML).toEqual('<h1>1</h1>');
    ReactDOM.unmountComponentAtNode(div);
  });

  it('returns the control when there is no user', () => {
    const div = document.createElement('div');

    ReactDOM.render(
      <GrowthBookProvider>
        <TestedComponent />
      </GrowthBookProvider>,
      div
    );
    expect(div.innerHTML).toEqual('<h1>0</h1>');
    ReactDOM.unmountComponentAtNode(div);
  });

  it('renders the variation switcher in dev mode', async () => {
    const client = new GrowthBookClient();
    const user = client.user({ id: '1' });
    const div = document.createElement('div');

    ReactDOM.render(
      <GrowthBookProvider user={user} dev={true}>
        <TestedComponent />
      </GrowthBookProvider>,
      div
    );
    await new Promise((resolve) => setTimeout(resolve, 100));
    const switcher = div.querySelector('.growthbook_dev');
    expect(switcher).toBeTruthy();
    ReactDOM.unmountComponentAtNode(div);
  });

  it('re-renders when switching variations', async () => {
    const client = new GrowthBookClient();
    const user = client.user({ id: '1' });
    const div = document.createElement('div');

    ReactDOM.render(
      <GrowthBookProvider user={user} dev={true}>
        <TestedComponent />
      </GrowthBookProvider>,
      div
    );
    await new Promise((resolve) => setTimeout(resolve, 100));

    expect(div.querySelector('h1')?.innerHTML).toEqual('1');

    await act(async () => {
      // Click to switch to the first variation
      (div.querySelector(
        '.growthbook_dev tr:first-child'
      ) as HTMLElement)?.click();
      await new Promise((resolve) => requestAnimationFrame(resolve));
    });

    expect(div.querySelector('h1')?.innerHTML).toEqual('0');

    ReactDOM.unmountComponentAtNode(div);
  });

  it('starts variation switcher collapsed and expands when clicked', async () => {
    await act(async () => {
      const client = new GrowthBookClient();
      const user = client.user({ id: '1' });
      const div = document.createElement('div');

      ReactDOM.render(
        <GrowthBookProvider user={user} dev={true}>
          <TestedComponent />
        </GrowthBookProvider>,
        div
      );
      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(div.querySelector('.growthbook_dev')?.className).not.toMatch(
        /open/
      );

      // Click to expand the variation switcher
      await act(async () => {
        (div.querySelector('.growthbook_dev .toggle') as HTMLElement)?.click();
      });

      expect(div.querySelector('.growthbook_dev')?.className).toMatch(/open/);

      ReactDOM.unmountComponentAtNode(div);
    });
  });

  it('does not render variation switcher until the useExperiment hook is used', () => {
    const client = new GrowthBookClient();
    const user = client.user({ id: '1' });
    const div = document.createElement('div');

    ReactDOM.render(
      <GrowthBookProvider user={user} dev={true}>
        <h1>foo</h1>
      </GrowthBookProvider>,
      div
    );
    expect(div.innerHTML).toEqual('<h1>foo</h1>');
    ReactDOM.unmountComponentAtNode(div);
  });
});

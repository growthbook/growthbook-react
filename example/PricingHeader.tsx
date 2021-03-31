import * as React from 'react';
import {useExperiment} from '../dist/.';

export default function PricingHeader() {
  const {value} = useExperiment({
    key: "pricing-header",
    variations: ["Our Plans", "Pricing", "Join Today"]
  });

  return (
    <div className="pricing-header px-3 py-3 pt-md-5 pb-md-4 mx-auto text-center">
      <h1 className="display-4">{value}</h1>
      <p className="lead">Quickly build an effective pricing table for your potential customers with this Bootstrap example. It's built with default Bootstrap components and utilities with little customization.</p>
    </div>
  )
}
import * as React from 'react';
import TopNav from './TopNav';
import PricingHeader from './PricingHeader';
import PlanBox from './PlanBox';
import Footer from './Footer';
import { useExperiment } from '../dist/';

export default function Pricing() {
  const { value: showCallout } = useExperiment({
    key: "sale-callout",
    variations: [false, true]
  });

  return (
    <div>
      <TopNav />
      <PricingHeader />
      {showCallout && (
        <div className="container">
          <div className="alert alert-info text-center">
            <strong>Special Sale!</strong> For a limited time, get 10% off all of our plans. Discount applied at checkout.
        </div>
        </div>
      )}
      <div className="container">
        <div className="card-deck mb-3 text-center">
          <PlanBox
            cta="Sign up for free"
            ctaColor="btn-outline-primary"
            name="Free"
            price={0}
            storage={2}
            support="Email support"
            users={10}
          />
          <PlanBox
            cta="Get Started"
            ctaColor="btn-primary"
            name="Pro"
            price={15}
            storage={10}
            support="Priority email support"
            users={20}
          />
          <PlanBox
            cta="Contact us"
            ctaColor="btn-primary"
            name="Enterprise"
            price={29}
            storage={15}
            support="Phone and email support"
            users={30}
          />
        </div>
        <Footer />
      </div>
    </div>
  )
}

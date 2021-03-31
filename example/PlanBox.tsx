import * as React from 'react';

export default function PlanBox({ name, price, users, storage, support, cta, ctaColor }: {
  name: string;
  price: number;
  users: number;
  storage: number;
  support: string;
  cta: string;
  ctaColor: string;
}) {
  return (
    <div className="card mb-4 box-shadow">
      <div className="card-header">
        <h4 className="my-0 font-weight-normal">{name}</h4>
      </div>
      <div className="card-body">
        <h1 className="card-title pricing-card-title">${price} <small className="text-muted">/ mo</small></h1>
        <ul className="list-unstyled mt-3 mb-4">
          <li>{users} users included</li>
          <li>{storage} GB of storage</li>
          <li>{support}</li>
          <li>Help center access</li>
        </ul>
        <button type="button" className={`btn btn-lg btn-block ${ctaColor}`}>{cta}</button>
      </div>
    </div>
  )
}
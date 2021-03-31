import * as React from 'react';
import { useExperiment } from '../dist';

export default function TopNav() {
  const { value } = useExperiment({
    key: "topnav-color",
    variations: [
      "light",
      "dark"
    ]
  });

  return (
    <div className={"d-flex flex-column flex-md-row align-items-center p-3 px-md-4 mb-3 border-bottom box-shadow"+(value==="dark" ? " bg-dark text-light":"bg-white")}>
      <h5 className="my-0 mr-md-auto font-weight-normal">Company name</h5>
      <nav className="my-2 my-md-0 mr-md-3">
        <a className={`p-2 ${value==="dark" ? "text-light" : "text-dark"}`} href="#">Features</a>
        <a className={`p-2 ${value==="dark" ? "text-light" : "text-dark"}`} href="#">Enterprise</a>
        <a className={`p-2 ${value==="dark" ? "text-light" : "text-dark"}`} href="#">Support</a>
        <a className={`p-2 ${value==="dark" ? "text-light" : "text-dark"}`} href="#">Pricing</a>
      </nav>
      <a className={`btn btn-primary`} href="#">Sign up</a>
    </div>
  )
}
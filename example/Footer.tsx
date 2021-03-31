import * as React from 'react';

export default function Footer() {
  return (
    <footer className="pt-4 my-md-5 pt-md-5 border-top">
      <div className="row">
        <div className="col-12 col-md">
          <img className="mb-2" src="https://getbootstrap.com/docs/4.0/assets/brand/bootstrap-solid.svg" alt="" width="24" height="24" />
          <small className="d-block mb-3 text-muted">&copy; 2017-2018</small>
        </div>
        <div className="col-6 col-md">
          <h5>Features</h5>
          <ul className="list-unstyled text-small">
            <li><a className="text-muted" href="#">Cool stuff</a></li>
            <li><a className="text-muted" href="#">Random feature</a></li>
            <li><a className="text-muted" href="#">Team feature</a></li>
            <li><a className="text-muted" href="#">Stuff for developers</a></li>
            <li><a className="text-muted" href="#">Another one</a></li>
            <li><a className="text-muted" href="#">Last time</a></li>
          </ul>
        </div>
        <div className="col-6 col-md">
          <h5>Resources</h5>
          <ul className="list-unstyled text-small">
            <li><a className="text-muted" href="#">Resource</a></li>
            <li><a className="text-muted" href="#">Resource name</a></li>
            <li><a className="text-muted" href="#">Another resource</a></li>
            <li><a className="text-muted" href="#">Final resource</a></li>
          </ul>
        </div>
        <div className="col-6 col-md">
          <h5>About</h5>
          <ul className="list-unstyled text-small">
            <li><a className="text-muted" href="#">Team</a></li>
            <li><a className="text-muted" href="#">Locations</a></li>
            <li><a className="text-muted" href="#">Privacy</a></li>
            <li><a className="text-muted" href="#">Terms</a></li>
          </ul>
        </div>
      </div>
    </footer>
  )
}
import React from 'react';
import { Link } from 'react-router-dom';
import './index.scss';

const NotFound: React.FC = () => {
  return (
    <div className="notfound">
      <div className="notfound__card">
        <p className="notfound__eyebrow">404</p>
        <h1 className="notfound__title">We can’t find that page.</h1>
        <p className="notfound__message">
          The link may be broken, or the page may have moved. Either way, we’ll
          help you get back on track.
        </p>

        <div className="notfound__actions">
          <Link className="notfound__primary" to="/">
            Go home
          </Link>
          <Link className="notfound__secondary" to="/admin/login">
            Admin login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;

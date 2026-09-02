import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => (
  <div className="max-w-md mx-auto px-5 py-24 text-center">
    <h1 className="font-display text-5xl text-ink mb-3">404</h1>
    <p className="text-muted mb-8">This page doesn't exist — maybe the story moved, or was never written.</p>
    <Link to="/" className="btn-primary">Back home</Link>
  </div>
);

export default NotFound;

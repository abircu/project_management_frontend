import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="bg-white rounded-lg shadow p-8 text-center">
      <h1 className="text-5xl font-bold text-gray-900 mb-3">404</h1>
      <p className="text-gray-600 mb-4">Page not found.</p>
      <Link to="/" className="text-blue-600 hover:underline">Go Home page</Link>
    </div>
  );
}

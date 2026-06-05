import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Artists from './pages/Artists';
import Concerts from './pages/Concerts';
import ConcertDetail from './pages/ConcertDetail';
import Venues from './pages/Venues';
import Tickets from './pages/Tickets';
// import Staff from './pages/Staff';
import Analytics from './pages/Analytics';
import './index.css';

export default function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" toastOptions={{ style: { background: '#13131a', color: '#fff', border: '1px solid #1e1e2e' } }} />
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="artists" element={<Artists />} />
          <Route path="concerts" element={<Concerts />} />
          <Route path="concerts/:id" element={<ConcertDetail />} />
          <Route path="venues" element={<Venues />} />
          <Route path="tickets" element={<Tickets />} />
          {/* <Route path="staff" element={<Staff />} /> */}
          <Route path="analytics" element={<Analytics />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

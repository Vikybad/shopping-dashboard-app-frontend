import { lazy, Suspense } from 'react';
import { Box, CircularProgress } from '@mui/material';
import { Navigate, Route, Routes } from 'react-router-dom';
import AppShell from './components/AppShell';
import ProtectedRoute from './components/ProtectedRoute';

const Dashboard = lazy(() => import('./components/Dashboard'));
const OrderList = lazy(() => import('./components/OrderList'));
const InventoryPage = lazy(() => import('./components/InventoryPage'));
const AddOrderForm = lazy(() => import('./components/AddOrderForm'));
const TaskBoard = lazy(() => import('./components/TaskBoard'));
const DataAccountPage = lazy(() => import('./components/DataAccountPage'));
const Login = lazy(() => import('./pages/Login'));
const Signup = lazy(() => import('./pages/Signup'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));

const PrivatePage = ({ children }) => (
  <ProtectedRoute><AppShell>{children}</AppShell></ProtectedRoute>
);

function App() {
  return (
    <Suspense fallback={<Box minHeight="100vh" display="grid" sx={{ placeItems: 'center' }}><CircularProgress /></Box>}>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/home" element={<PrivatePage><Dashboard /></PrivatePage>} />
        <Route path="/orders" element={<PrivatePage><OrderList /></PrivatePage>} />
        <Route path="/orders/new" element={<PrivatePage><AddOrderForm /></PrivatePage>} />
        <Route path="/inventory" element={<PrivatePage><InventoryPage /></PrivatePage>} />
        <Route path="/tasks" element={<PrivatePage><TaskBoard /></PrivatePage>} />
        <Route path="/data" element={<PrivatePage><DataAccountPage /></PrivatePage>} />
        <Route path="/add-order" element={<Navigate to="/orders/new" replace />} />
        <Route path="/wallet" element={<Navigate to="/home" replace />} />
        <Route path="/" element={<Navigate to="/home" replace />} />
        <Route path="*" element={<Navigate to="/home" replace />} />
      </Routes>
    </Suspense>
  );
}

export default App;

import { render, screen } from '@testing-library/react';
import { ThemeProvider } from '@mui/material/styles';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import SummaryCard from './components/SummaryCard';
import DataAccountPage from './components/DataAccountPage';
import ProtectedRoute from './components/ProtectedRoute';
import ForgotPassword from './pages/ForgotPassword';
import { AuthContext } from './contexts/AuthContext';
import theme from './theme';
import { formatCurrency, titleCase } from './utils/format';

test('formats dashboard values for the configured store currency', () => {
  expect(formatCurrency(12500, 'INR')).toContain('12,500');
  expect(titleCase('IN_PROGRESS')).toBe('In Progress');
});

test('renders a KPI with its comparison context', () => {
  render(<ThemeProvider theme={theme}><SummaryCard title="Total orders" value="42" change={12.5} /></ThemeProvider>);
  expect(screen.getByText('Total orders')).toBeInTheDocument();
  expect(screen.getByText('42')).toBeInTheDocument();
  expect(screen.getByText('12.5%')).toBeInTheDocument();
  expect(screen.getByText(/previous 30 days/i)).toBeInTheDocument();
});

test('redirects an anonymous visitor away from protected pages', () => {
  render(
    <AuthContext.Provider value={{ authenticated: false, loading: false }}>
      <MemoryRouter initialEntries={['/home']}>
        <Routes>
          <Route path="/home" element={<ProtectedRoute><div>Private dashboard</div></ProtectedRoute>} />
          <Route path="/login" element={<div>Public sign in</div>} />
        </Routes>
      </MemoryRouter>
    </AuthContext.Provider>,
  );
  expect(screen.getByText('Public sign in')).toBeInTheDocument();
  expect(screen.queryByText('Private dashboard')).not.toBeInTheDocument();
});

test('renders the email OTP recovery entry point', () => {
  render(<ThemeProvider theme={theme}><MemoryRouter><ForgotPassword /></MemoryRouter></ThemeProvider>);
  expect(screen.getByRole('heading', { name: 'Reset password' })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Send reset code' })).toBeInTheDocument();
});

test('exposes imports, paused reports, and explicit danger-zone actions', () => {
  render(
    <AuthContext.Provider value={{ clearSession: vi.fn(), user: { storeName: 'Test Store' } }}>
      <ThemeProvider theme={theme}><MemoryRouter><DataAccountPage /></MemoryRouter></ThemeProvider>
    </AuthContext.Provider>,
  );
  expect(screen.getByRole('heading', { name: 'CSV imports' })).toBeInTheDocument();
  expect(screen.getByText('Paused')).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Reset all store data' })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Delete account' })).toBeInTheDocument();
});

import { render, screen } from '@testing-library/react';
import { ThemeProvider } from '@mui/material/styles';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import SummaryCard from './components/SummaryCard';
import ProtectedRoute from './components/ProtectedRoute';
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

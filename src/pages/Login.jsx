import { useContext, useState } from 'react';
import { Alert, Button, Stack, TextField, Typography } from '@mui/material';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import api, { getErrorMessage } from '../api/client';
import AuthLayout from '../components/AuthLayout';
import { AuthContext } from '../contexts/AuthContext';

const Login = () => {
  const { authenticated, login } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ login: '', password: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (authenticated) return <Navigate to="/home" replace />;

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const { data } = await api.post('/users/login', form);
      login(data.token, data.user);
      navigate(location.state?.from?.pathname || '/home', { replace: true });
    } catch (requestError) {
      setError(getErrorMessage(requestError, 'Sign in failed.'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout eyebrow="Welcome back" title="Sign in" subtitle="Use your store administrator account to continue.">
      <Stack component="form" spacing={2.2} onSubmit={submit}>
        {error && <Alert severity="error">{error}</Alert>}
        <TextField label="Email or username" name="login" autoComplete="username" value={form.login} onChange={(event) => setForm({ ...form, login: event.target.value })} required fullWidth />
        <TextField label="Password" name="password" type="password" autoComplete="current-password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} required fullWidth />
        <Button type="submit" variant="contained" size="large" disabled={submitting}>{submitting ? 'Signing in…' : 'Sign in'}</Button>
        <Typography align="center" color="text.secondary" fontSize={14}>New to Shopboard? <Link to="/signup">Create an account</Link></Typography>
      </Stack>
    </AuthLayout>
  );
};

export default Login;

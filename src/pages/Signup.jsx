import { useContext, useState } from 'react';
import { Alert, Box, Button, CircularProgress, Grid, Stack, TextField, Typography } from '@mui/material';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import api, { getErrorMessage } from '../api/client';
import AuthLayout from '../components/AuthLayout';
import { AuthContext } from '../contexts/AuthContext';

const Signup = () => {
  const { authenticated, loading, login } = useContext(AuthContext);
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', storeName: '', email: '', mobileNumber: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (loading) return <Box minHeight="100vh" display="grid" sx={{ placeItems: 'center' }}><CircularProgress /></Box>;
  if (authenticated) return <Navigate to="/home" replace />;
  const change = (event) => setForm({ ...form, [event.target.name]: event.target.value });

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    if (form.password !== form.confirmPassword) return setError('Passwords do not match.');
    setSubmitting(true);
    try {
      const { confirmPassword, ...payload } = form;
      const { data } = await api.post('/users/register', payload);
      login(data.accessToken || data.token, data.user);
      navigate('/home', { replace: true });
    } catch (requestError) {
      setError(getErrorMessage(requestError, 'Account creation failed.'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout eyebrow="Get started" title="Create your store" subtitle="Set up the admin workspace. You can add products next.">
      <Stack component="form" spacing={2} onSubmit={submit}>
        {error && <Alert severity="error">{error}</Alert>}
        <Grid container spacing={1.5}>
          <Grid item xs={12} sm={6}><TextField label="Your name" name="username" value={form.username} onChange={change} required fullWidth /></Grid>
          <Grid item xs={12} sm={6}><TextField label="Store name" name="storeName" value={form.storeName} onChange={change} required fullWidth /></Grid>
          <Grid item xs={12}><TextField label="Email" name="email" type="email" autoComplete="email" value={form.email} onChange={change} required fullWidth /></Grid>
          <Grid item xs={12}><TextField label="Mobile (optional)" name="mobileNumber" value={form.mobileNumber} onChange={change} fullWidth /></Grid>
          <Grid item xs={12} sm={6}><TextField label="Password" name="password" type="password" autoComplete="new-password" helperText="10+ characters with uppercase, lowercase, and a number" inputProps={{ minLength: 10 }} value={form.password} onChange={change} required fullWidth /></Grid>
          <Grid item xs={12} sm={6}><TextField label="Confirm password" name="confirmPassword" type="password" autoComplete="new-password" value={form.confirmPassword} onChange={change} required fullWidth /></Grid>
        </Grid>
        <Button type="submit" variant="contained" size="large" disabled={submitting}>{submitting ? 'Creating account…' : 'Create account'}</Button>
        <Typography align="center" color="text.secondary" fontSize={14}>Already have an account? <Link to="/login">Sign in</Link></Typography>
      </Stack>
    </AuthLayout>
  );
};

export default Signup;

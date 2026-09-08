import { useState } from 'react';
import { Alert, Button, Stack, TextField, Typography } from '@mui/material';
import { Link } from 'react-router-dom';
import api, { getErrorMessage } from '../api/client';
import AuthLayout from '../components/AuthLayout';

const ForgotPassword = () => {
  const [step, setStep] = useState('request');
  const [form, setForm] = useState({ email: '', otp: '', password: '', confirmPassword: '' });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const change = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }));

  const requestCode = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const { data } = await api.post('/users/password-reset/request', { email: form.email });
      setMessage(data.message);
      setStep('confirm');
    } catch (requestError) {
      setError(getErrorMessage(requestError, 'Unable to request a reset code.'));
    } finally {
      setSubmitting(false);
    }
  };

  const resetPassword = async (event) => {
    event.preventDefault();
    setError('');
    if (form.password !== form.confirmPassword) return setError('Passwords do not match.');
    setSubmitting(true);
    try {
      const { data } = await api.post('/users/password-reset/confirm', {
        email: form.email,
        otp: form.otp,
        password: form.password,
      });
      setMessage(data.message);
      setStep('complete');
    } catch (requestError) {
      setError(getErrorMessage(requestError, 'Unable to reset the password.'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout eyebrow="Account recovery" title="Reset password" subtitle="We will send a six-digit code to your account email.">
      {step === 'request' && (
        <Stack component="form" spacing={2.2} onSubmit={requestCode}>
          {error && <Alert severity="error">{error}</Alert>}
          <TextField label="Account email" name="email" type="email" autoComplete="email" value={form.email} onChange={change} required fullWidth autoFocus />
          <Button type="submit" variant="contained" size="large" disabled={submitting}>{submitting ? 'Sending…' : 'Send reset code'}</Button>
          <Typography align="center" color="text.secondary" fontSize={14}><Link to="/login">Back to sign in</Link></Typography>
        </Stack>
      )}

      {step === 'confirm' && (
        <Stack component="form" spacing={2} onSubmit={resetPassword}>
          {message && <Alert severity="info">{message}</Alert>}
          {error && <Alert severity="error">{error}</Alert>}
          <TextField label="Six-digit reset code" name="otp" value={form.otp} onChange={change} inputProps={{ inputMode: 'numeric', pattern: '[0-9]{6}', maxLength: 6 }} required fullWidth autoFocus />
          <TextField label="New password" name="password" type="password" autoComplete="new-password" value={form.password} onChange={change} helperText="10+ characters with uppercase, lowercase, and a number" inputProps={{ minLength: 10 }} required fullWidth />
          <TextField label="Confirm new password" name="confirmPassword" type="password" autoComplete="new-password" value={form.confirmPassword} onChange={change} required fullWidth />
          <Button type="submit" variant="contained" size="large" disabled={submitting}>{submitting ? 'Resetting…' : 'Reset password'}</Button>
          <Button onClick={() => { setStep('request'); setMessage(''); setError(''); }}>Request another code</Button>
        </Stack>
      )}

      {step === 'complete' && (
        <Stack spacing={2.2}>
          <Alert severity="success">{message}</Alert>
          <Button component={Link} to="/login" variant="contained" size="large">Sign in</Button>
        </Stack>
      )}
    </AuthLayout>
  );
};

export default ForgotPassword;

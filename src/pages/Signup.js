import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TextField, Button, Typography, Box } from '@mui/material';
import axios from 'axios';


const Signup = ({ showSnackbar }) => {
    const BASEURL = "https://shopping-dashboard-backend-production.up.railway.app/"
    const navigate = useNavigate();
    const [signupData, setSignupData] = useState({
        username: '',
        email: '',
        mobileNumber: '',
        password: '',
        image: '',
    });


    const handleChange = (e) => {
        const { name, value } = e.target;
        // Limit mobile number to 10 digits and ensure it's numeric
        if (name === 'mobileNumber') {
            // Allow only numeric values and limit length
            if (/^\d*$/.test(value) && value.length <= 10) {
                setSignupData({ ...signupData, [name]: value });
            }
        } else {
            setSignupData({ ...signupData, [name]: value });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post(BASEURL + 'api/users/register', signupData);
            if (response?.data?.msg) throw new Error(response.data.msg);
            if (!response?.data?.token) throw new Error(`Some error occured`);

            showSnackbar({
                message: 'Signup successful! Redirecting to login...',
                severity: 'success',
                autoHideDuration: 1000,
                redirectToPath: '/login'
            });
        } catch (error) {
            console.error(`Error in signup: ${error.message}`);
            showSnackbar({
                message: `Signup failed: ${error.message}`,
                severity: 'error',
                autoHideDuration: 6000
            });
        }
    };

    const handleSignInRedirect = () => {
        navigate('/login');
    }

    return (
        <Box component="form" onSubmit={handleSubmit} sx={{ maxWidth: 300, margin: 'auto', mt: 7 }}>
            <Typography variant="h4" gutterBottom>
                Signup
            </Typography>
            <TextField
                required
                fullWidth
                margin="normal"
                name="username"
                label="Username"
                value={signupData.username}
                onChange={handleChange}
            />
            <TextField
                required
                fullWidth
                margin="normal"
                name="email"
                label="Email"
                type="email"
                value={signupData.email}
                onChange={handleChange}
            />
            <TextField
                required
                fullWidth
                margin="normal"
                name="mobileNumber"
                label="Mobile Number"
                value={signupData.mobileNumber}
                onChange={handleChange}
                inputProps={{
                    maxLength: 10,
                    pattern: "[0-9]*", // Allow only numbers
                    inputMode: "numeric" // Numeric keyboard on mobile
                }}
                helperText="Enter up to 10 digits"
            />
            <TextField
                required
                fullWidth
                margin="normal"
                name="password"
                label="Password"
                type="password"
                value={signupData.password}
                onChange={handleChange}
            />
            {/* TODO: Add Confirm password */}
            {/* <TextField
                fullWidth
                margin="normal"
                name="image"
                label="Profile Image URL"
                value={signupData.image}
                onChange={handleChange}
            /> */}
            <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 2 }}>
                Sign up
            </Button>

            <Button
                variant="outlined"
                color="primary"
                fullWidth
                sx={{ mt: 2 }}
                onClick={handleSignInRedirect}
            >
                Log IN
            </Button>

        </Box>
    );
};

export default Signup;

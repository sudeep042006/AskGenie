import supabase from '../config/supabaseClient.js';

// 1. REGISTER USER
export async function registerUser(req, res) {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
    }

    try {
        // Create user in Supabase Auth
        const { data, error } = await supabase.auth.signUp({
            email: email,
            password: password,
        });

        if (error) throw error;

        // Successful Registration
        res.status(201).json({
            message: 'User registered successfully! Please check email to verify (if enabled) or login.',
            user: data.user
        });

    } catch (error) {
        console.error("Registration Error:", error.message);
        res.status(400).json({ error: error.message });
    }
}

// 2. LOGIN USER
export async function loginUser(req, res) {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
    }

    try {
        // Verify credentials with Supabase
        const { data, error } = await supabase.auth.signInWithPassword({
            email: email,
            password: password,
        });

        if (error) throw error;

        // Successful Login - RETURN THE IMPORTANT "userId"
        res.status(200).json({
            message: 'Login successful!',
            token: data.session.access_token, // JWT Token
            userId: data.user.id,             // <--- THIS IS YOUR KEY ID
            email: data.user.email
        });

    } catch (error) {
        console.error("Login Error:", error.message);
        res.status(401).json({ error: 'Invalid email or password' });
    }
}
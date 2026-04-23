const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
    origin: ['http://localhost:5173', 'https://attendance-system-sandy-iota.vercel.app'],
    methods: ['GET', 'POST'],
    credentials: true
}));
app.use(express.json());

// Supabase Setup
const SUPABASE_URL = 'https://tmrsdvtdtbuqjhedtmqp.supabase.co';
const SUPABASE_KEY = 'sb_publishable_304VG6Qmgh5cUvz3RTjSEg_DUSBVb3a'; // In production, use service_role key in .env
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Routes
app.get('/', (req, res) => {
    res.send('Attendance System API is running...');
});

// Get all attendance
app.get('/api/attendance', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('attendance')
            .select('*')
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Mark attendance
app.post('/api/attendance', async (req, res) => {
    const { student_name, status } = req.body;
    try {
        const { data, error } = await supabase
            .from('attendance')
            .insert([{ student_name, status }])
            .select();
        
        if (error) throw error;
        res.status(201).json(data[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

app.use('/auth', require('./routes/authRoutes'));
app.use('/incident', require('./routes/incidentRoutes'));
app.use('/contacts', require('./routes/contactRoutes'));
app.use('/sos', require('./routes/sosRoutes'));
app.use('/report', require('./routes/reportRoutes'));

module.exports = app;
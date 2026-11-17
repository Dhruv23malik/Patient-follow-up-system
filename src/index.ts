import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

import patientRoutes from './routes/patientRoutes';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Patient Follow-up System API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  });
});

// API Routes
app.use('/api/patients', patientRoutes);

// 404 handler
app.use(notFoundHandler);

// Error handler
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`
╔══════════════════════════════════════════════════════════════╗
║  Patient Follow-up System - EPIA Technical Assessment       ║
║  Server running on http://localhost:${PORT}                    ║
║  Environment: ${process.env.NODE_ENV || 'development'}                                      ║
╚══════════════════════════════════════════════════════════════╝
  `);
});

export default app;
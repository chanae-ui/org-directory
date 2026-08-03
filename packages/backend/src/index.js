import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { contactsRouter } from './routes/contacts.js';
import { startScheduledSync } from './sync/scheduler.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/contacts', contactsRouter);

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

const port = process.env.PORT || 3001;
app.listen(port, () => {
  console.log(`שרת ה-Backend רץ על פורט ${port}`);
  startScheduledSync();
});

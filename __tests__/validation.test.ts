import express from 'express';
import request from 'supertest';
import { z } from 'zod';
import { validate } from '../src/middleware/validation';
import { errorHandler } from '../src/middleware/errorHandler';
import { ErrorCodes } from '../src/constants/errorCodes';

const querySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

const bodySchema = z.object({
  title: z.string().min(1),
  status: z.string().optional(),
});

describe('validate middleware (Express 5 regression)', () => {
  let app: express.Express;

  beforeEach(() => {
    app = express();
    app.use(express.json());

    app.get('/items', validate(querySchema, 'query'), (req, res) => {
      res.json({ page: req.query.page, pageSize: req.query.pageSize });
    });
    app.get('/coerce', validate(querySchema, 'query'), (req, res) => {
      res.json({ typeof: typeof req.query.page });
    });
    app.post('/items', validate(bodySchema), (req, res) => {
      res.json({ title: req.body.title });
    });

    app.use(errorHandler);
  });

  it('applies defaults when query is empty and rewritten values are readable', async () => {
    const res = await request(app).get('/items');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ page: 1, pageSize: 20 });
  });

  it('coerces query strings into numbers readable by the controller', async () => {
    const res = await request(app).get('/items?page=3&pageSize=50');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ page: 3, pageSize: 50 });
  });

  it('rejects invalid query values with VALIDATION_ERROR', async () => {
    const res = await request(app).get('/items?page=0&pageSize=1000');
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe(ErrorCodes.VALIDATION_ERROR);
    expect(res.body.error.details).toHaveProperty('page');
  });

  it('rejects an invalid body with VALIDATION_ERROR', async () => {
    const res = await request(app).post('/items').send({});
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe(ErrorCodes.VALIDATION_ERROR);
    expect(res.body.error.details).toHaveProperty('title');
  });

  it('accepts a valid body', async () => {
    const res = await request(app).post('/items').send({ title: 'hello' });
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ title: 'hello' });
  });

  it('sets typed values (not strings) on req.query after coercion', async () => {
    const res = await request(app).get('/coerce?page=2');
    expect(res.status).toBe(200);
    expect(res.body.typeof).toBe('number');
  });
});

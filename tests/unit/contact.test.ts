import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { onRequest, onRequestPost, validate } from '../../functions/api/contact';

const valid = {
  nombre: 'Ana López',
  email: 'ana@example.com',
  telefono: '+52 444 123 4567',
  mensaje: 'Me gustaría agendar una cita.',
};

type Handler = typeof onRequest;

function call(handler: Handler, request: Request) {
  // Only `request` is read by the handlers; the rest of the Pages context is unused.
  return handler({ request } as unknown as Parameters<Handler>[0]);
}

function jsonRequest(body: unknown, method = 'POST') {
  return new Request('https://itzaestrada.com/api/contact', {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: typeof body === 'string' ? body : JSON.stringify(body),
  });
}

function formRequest(fields: Record<string, string>) {
  const form = new FormData();
  for (const [key, value] of Object.entries(fields)) form.append(key, value);
  return new Request('https://itzaestrada.com/api/contact', { method: 'POST', body: form });
}

function fields(errors: { field: string }[]) {
  return errors.map((e) => e.field);
}

describe('validate', () => {
  test('accepts a complete submission', () => {
    expect(validate(valid)).toEqual([]);
  });

  test('accepts a submission without phone', () => {
    expect(validate({ ...valid, telefono: undefined })).toEqual([]);
  });

  test('reports every missing required field', () => {
    expect(fields(validate({ nombre: '', email: '', mensaje: '' }))).toEqual([
      'nombre',
      'email',
      'mensaje',
    ]);
  });

  test('treats whitespace-only values as missing', () => {
    const errors = validate({ nombre: '   ', email: ' ', mensaje: '\n\t' });
    expect(fields(errors)).toEqual(['nombre', 'email', 'mensaje']);
    expect(errors[0].message).toBe('El nombre es obligatorio.');
  });

  test.each([
    ['nombre', 100],
    ['email', 200],
    ['telefono', 20],
    ['mensaje', 1000],
  ] as const)('%s allows %i characters and rejects one more', (field, max) => {
    const at = field === 'email' ? `${'a'.repeat(max - 12)}@example.com` : 'a'.repeat(max);
    const over = field === 'email' ? `${'a'.repeat(max - 11)}@example.com` : 'a'.repeat(max + 1);

    expect(validate({ ...valid, [field]: at })).toEqual([]);
    expect(fields(validate({ ...valid, [field]: over }))).toEqual([field]);
  });

  test('measures length after trimming', () => {
    expect(validate({ ...valid, nombre: `  ${'a'.repeat(100)}  ` })).toEqual([]);
  });

  test.each(['ana', 'ana@', '@example.com', 'ana@example', 'ana @example.com', 'ana@exa mple.com'])(
    'rejects malformed email %j',
    (email) => {
      const errors = validate({ ...valid, email });
      expect(errors).toEqual([
        { field: 'email', message: 'El formato del correo electronico no es valido.' },
      ]);
    },
  );

  test('accepts email surrounded by whitespace', () => {
    expect(validate({ ...valid, email: '  ana@example.com  ' })).toEqual([]);
  });
});

describe('onRequestPost', () => {
  beforeEach(() => {
    vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test('accepts a valid JSON submission', async () => {
    const res = await call(onRequestPost, jsonRequest(valid));

    expect(res.status).toBe(200);
    expect(res.headers.get('Content-Type')).toBe('application/json');
    const body = await res.json();
    expect(body).toMatchObject({
      success: true,
      message: 'Gracias por tu mensaje. Te contactaremos pronto.',
    });
    expect(new Date(body.timestamp).toString()).not.toBe('Invalid Date');
  });

  test('accepts a valid form-data submission (native form POST)', async () => {
    const res = await call(onRequestPost, formRequest(valid));

    expect(res.status).toBe(200);
    expect(await res.json()).toMatchObject({ success: true });
  });

  test('logs the submission', async () => {
    await call(onRequestPost, jsonRequest(valid));

    expect(console.log).toHaveBeenCalledOnce();
    expect(vi.mocked(console.log).mock.calls[0][0]).toContain('Ana López <ana@example.com>');
  });

  test('returns 400 with field errors for an invalid submission', async () => {
    const res = await call(onRequestPost, jsonRequest({ nombre: 'Ana' }));

    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.success).toBe(false);
    expect(fields(body.errors)).toEqual(['email', 'mensaje']);
    expect(console.log).not.toHaveBeenCalled();
  });

  test('returns 400 for a malformed JSON body', async () => {
    const res = await call(onRequestPost, jsonRequest('{not json'));

    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({
      success: false,
      errors: [{ field: 'body', message: 'Cuerpo de solicitud invalido.' }],
    });
  });

  test('silently accepts honeypot submissions without processing them', async () => {
    const res = await call(onRequestPost, jsonRequest({ website: 'http://spam.example' }));

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.timestamp).toBeUndefined();
    expect(console.log).not.toHaveBeenCalled();
  });

  test('ignores a whitespace-only honeypot', async () => {
    const res = await call(onRequestPost, jsonRequest({ ...valid, website: '  ' }));

    expect(res.status).toBe(200);
    expect(console.log).toHaveBeenCalledOnce();
  });
});

describe('onRequest', () => {
  beforeEach(() => {
    vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test.each(['GET', 'PUT', 'DELETE'])('rejects %s with 405', async (method) => {
    const res = await call(
      onRequest,
      new Request('https://itzaestrada.com/api/contact', { method }),
    );

    expect(res.status).toBe(405);
    expect(await res.json()).toEqual({
      success: false,
      errors: [{ field: 'method', message: 'Metodo no permitido.' }],
    });
  });

  test('delegates POST to onRequestPost', async () => {
    const res = await call(onRequest, jsonRequest(valid));

    expect(res.status).toBe(200);
    expect(await res.json()).toMatchObject({ success: true });
  });
});

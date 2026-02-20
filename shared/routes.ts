import { z } from 'zod';
import { resumes } from './schema';

export const errorSchemas = {
  validation: z.object({ message: z.string(), field: z.string().optional() }),
  notFound: z.object({ message: z.string() }),
  unauthorized: z.object({ message: z.string() }),
};

export const api = {
  resumes: {
    list: {
      method: 'GET' as const,
      path: '/api/resumes' as const,
      responses: {
        200: z.array(z.custom<typeof resumes.$inferSelect>()),
        401: errorSchemas.unauthorized,
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/resumes/:id' as const,
      responses: {
        200: z.custom<typeof resumes.$inferSelect>(),
        404: errorSchemas.notFound,
        401: errorSchemas.unauthorized,
      },
    },
    upload: {
      method: 'POST' as const,
      path: '/api/resumes' as const,
      input: z.object({ filename: z.string(), text: z.string() }),
      responses: {
        201: z.custom<typeof resumes.$inferSelect>(),
        400: errorSchemas.validation,
        401: errorSchemas.unauthorized,
      },
    },
    analyze: {
      method: 'POST' as const,
      path: '/api/resumes/:id/analyze' as const,
      responses: {
        200: z.custom<typeof resumes.$inferSelect>(),
        404: errorSchemas.notFound,
        401: errorSchemas.unauthorized,
      },
    }
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}

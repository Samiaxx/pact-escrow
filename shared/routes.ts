import { z } from 'zod';
import { insertEscrowSchema } from './schema';

export const api = {
  // These are placeholders since we are "no backend" logic
  // But required for structure
  escrow: {
    list: {
      method: 'GET' as const,
      path: '/api/escrows',
      responses: {
        200: z.array(insertEscrowSchema),
      },
    },
  },
};

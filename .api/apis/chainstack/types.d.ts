import type { FromSchema } from 'json-schema-to-ts';
import * as schemas from './schemas';
export type GetTokenAccountBalanceBodyParam = FromSchema<typeof schemas.GetTokenAccountBalance.body>;
export type GetTokenAccountBalanceResponse200 = FromSchema<typeof schemas.GetTokenAccountBalance.response['200']>;

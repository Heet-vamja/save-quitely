import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';

/**
 * Marks a route as public - skips JWT auth.
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

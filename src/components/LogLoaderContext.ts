import { makeLogLoader } from '../atoms/log';
import { createContextNoNullCheck } from '../utils/react';

export const [useLogLoaderContext, LogLoaderContext] =
  createContextNoNullCheck<ReturnType<typeof makeLogLoader>>();

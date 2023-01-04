import { defineConfig } from 'rollup';
import { rollupIndexConfig, rollupIndexTypesConfig, rollupWorkerConfig } from '@modyqyw/utils';

export default defineConfig([rollupIndexConfig(), rollupIndexTypesConfig(), rollupWorkerConfig()]);

import { setupWorker } from 'msw/browser';
import { handlers } from './handlers';

// Setup the MSW worker for browser-based testing
export const worker = setupWorker(...handlers);

import { config } from '@vue/test-utils';
import { createPinia } from 'pinia';
import { vi } from 'vitest';

// Mock socket.io-client
vi.mock('socket.io-client', () => ({
  default: vi.fn(() => ({
    on: vi.fn(),
    emit: vi.fn(),
    connect: vi.fn(),
    disconnect: vi.fn()
  }))
}));

// Setup Vue Test Utils global config
config.global.plugins = [createPinia()];

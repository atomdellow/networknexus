import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { useSocketStore } from '../../../src/stores/socket';

describe('Socket Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('should initialize with default values', () => {
    const store = useSocketStore();
    expect(store.connected).toBe(false);
    expect(store.socket).toBeNull();
    expect(store.screenStream).toBeNull();
  });

  it('should connect to server', async () => {
    const store = useSocketStore();
    await store.connect('192.168.1.100');
    expect(store.serverIP).toBe('192.168.1.100');
    expect(localStorage.getItem('serverIP')).toBe('192.168.1.100');
  });

  it('should handle connection errors', () => {
    const store = useSocketStore();
    const consoleSpy = vi.spyOn(console, 'error');
    store.socket?.emit('connect_error', new Error('Test error'));
    expect(consoleSpy).toHaveBeenCalled();
  });
});

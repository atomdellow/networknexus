import { mount } from '@vue/test-utils';
import { describe, it, expect, beforeEach } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import ScreenSettings from '../../../src/components/ScreenSettings.vue';

describe('ScreenSettings.vue', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('should render quality options', () => {
    const wrapper = mount(ScreenSettings);
    expect(wrapper.find('select').exists()).toBe(true);
    expect(wrapper.find('option[value="low"]').exists()).toBe(true);
    expect(wrapper.find('option[value="medium"]').exists()).toBe(true);
    expect(wrapper.find('option[value="high"]').exists()).toBe(true);
  });

  it('should update settings when changed', async () => {
    const wrapper = mount(ScreenSettings);
    const select = wrapper.find('select');
    await select.setValue('high');
    expect(wrapper.emitted('update:quality')).toBeTruthy();
  });

  it('should show current values', () => {
    const wrapper = mount(ScreenSettings, {
      props: {
        frameRate: 30,
        compression: 70,
        scaleRatio: 1.0
      }
    });
    
    expect(wrapper.text()).toContain('30fps');
    expect(wrapper.text()).toContain('70%');
    expect(wrapper.text()).toContain('100%');
  });
});

import { describe, it, expect } from 'vitest';
import { i18n, t } from './index';

describe('packages/i18n', () => {
  it('translates navigation keys accurately', () => {
    expect(t('nav.home')).toBe('Home');
    expect(t('nav.learn')).toBe('Learn');
    expect(t('settings.theme')).toBe('Theme');
  });

  it('interpolates parameters when supplied', () => {
    const interpolated = i18n.t('hello {name}', { name: 'Ada' });
    expect(interpolated).toBe('hello Ada');
  });

  it('falls back gracefully to key string on missing keys', () => {
    expect(t('nonexistent.nested.key')).toBe('nonexistent.nested.key');
  });

  it('allows setting and reading the active locale', () => {
    i18n.setLocale('en');
    expect(i18n.getLocale()).toBe('en');
  });
});

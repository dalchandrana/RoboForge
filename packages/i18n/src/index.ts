import { en } from './locales/en';

export type Locale = 'en';

type NestedKeyOf<ObjectType extends object> = {
  [Key in keyof ObjectType & (string | number)]: ObjectType[Key] extends object
    ? `${Key}.${NestedKeyOf<ObjectType[Key]>}`
    : `${Key}`;
}[keyof ObjectType & (string | number)];

export type TranslationKeyPath = NestedKeyOf<typeof en>;

export class I18nService {
  private currentLocale: Locale = 'en';
  private dictionaries: Record<Locale, typeof en> = { en };

  public setLocale(locale: Locale) {
    this.currentLocale = locale;
  }

  public getLocale(): Locale {
    return this.currentLocale;
  }

  public t(key: string, params?: Record<string, string | number>): string {
    const dict = this.dictionaries[this.currentLocale] || this.dictionaries.en;
    const parts = key.split('.');
    let current: unknown = dict;

    let found = true;
    for (const part of parts) {
      if (current && typeof current === 'object' && part in current) {
        current = (current as Record<string, unknown>)[part];
      } else {
        found = false;
        break;
      }
    }

    let result = found && typeof current === 'string' ? current : key;
    if (params) {
      for (const [paramKey, value] of Object.entries(params)) {
        result = result.replace(new RegExp(`{${paramKey}}`, 'g'), String(value));
      }
    }

    return result;
  }
}

export const i18n = new I18nService();
export const t = (key: string, params?: Record<string, string | number>) => i18n.t(key, params);

export * from './locales/en';

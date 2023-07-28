import { createI18n } from 'vue-i18n';
import messages from './locale';

export const i18n = createI18n({
    locale: 'zh-CN',
    fallbackLocale: 'en',
    messages,
    legacy: false
});

export const $t = i18n.global.t;

import i18next from 'i18next';
import BrowserLanguageDetector from 'i18next-browser-languagedetector';
import { useMemo } from 'react';
import { initReactI18next, useTranslation } from 'react-i18next';

export const resources = {
  en: {
    translation: {
      done: 'Done',
      confirm: 'Confirm',
      cancel: 'Cancel',
      update: 'Update',
      edit: 'Edit',
      archive: 'Archive',
      delete: 'Delete',

      next: 'Next',
      prev: 'Prev',

      createTab: 'Create',
      logTab: 'History',
      statsTab: 'Stats',

      template: {
        defaultName: 'New Template',
      },

      createTemplateButton: 'Create Template',

      slotType: {
        text: 'Text',
        select: 'Select',
        'text-input': 'Text Input',
        number: 'Number',
      },

      filter: {
        ago: 'ago',
        ahead: 'ahead',
        contain: 'Contain',
        without: 'Without',
        selectDate: 'Select Date',
        clearDate: 'Clear',
      },

      createSlot: 'Create Slot',
      slot: {
        name: 'Name',
        defaultNameForText: 'Text',
        defaultNameForTextInput: 'Text Input',
        defaultNameForSelect: 'Select',
        defaultNameForNumber: 'Number',
        textPlaceholder: 'Some Text',
        option: 'Option',
        selectDefaultOption: 'Option',
        addSelectOption: 'Add Option',
      },

      editTemplateColorTab: 'Color',
      editTemplateIconTab: 'Icon',

      textInputHistoryLabel: 'History',
    },
  },
  zh: {
    translation: {
      done: '完成',
      confirm: '确认',
      cancel: '取消',
      update: '更新',
      edit: '编辑',
      archive: '归档',
      delete: '删除',

      next: '下一个',
      prev: '上一个',

      createTab: '记一条',
      logTab: '历史',
      statsTab: '统计',

      template: {
        defaultName: '新类型',
      },

      createTemplateButton: '新增类型',

      slotType: {
        text: '文本',
        select: '单选',
        'text-input': '输入文本',
        number: '输入数字',
      },

      filter: {
        ago: '之前',
        ahead: '之后',
        contain: '包含',
        without: '不包含',
        selectDate: '选择日期',
        clearDate: '清除',
      },

      createSlot: '新增槽',
      slot: {
        name: '名称',
        defaultNameForText: '文本',
        defaultNameForTextInput: '输入文本',
        defaultNameForSelect: '单选',
        defaultNameForNumber: '输入数字',
        textPlaceholder: '固定文本',
        option: '选项',
        selectDefaultOption: '选项',
        addSelectOption: '新增选项',
      },

      editLogTypeColorTab: '颜色',
      editLogTypeIconTab: '图形',

      textInputHistoryLabel: '历史',
    },
  },
};

// eslint-disable-next-line import/no-named-as-default-member
i18next
  .use(BrowserLanguageDetector)
  .use(initReactI18next)
  .init({
    compatibilityJSON: 'v3',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false, // not needed for react as it escapes by default
    },
    debug: import.meta.env.DEV,
    resources,
  });

export const i18n = i18next;

export function useDateFormat() {
  const { i18n } = useTranslation();
  const dateFormat = useMemo(
    () =>
      Intl.DateTimeFormat(i18n.language, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      }),
    [i18n],
  );

  return dateFormat;
}

export function useDateTimeFormat() {
  const { i18n } = useTranslation();
  const dateTimeFormat = useMemo(
    () =>
      Intl.DateTimeFormat(i18n.language, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric',
        hour12: Intl.DateTimeFormat(i18n.language, {
          hour: 'numeric',
        }).resolvedOptions().hour12,
      }),
    [i18n],
  );

  return dateTimeFormat;
}

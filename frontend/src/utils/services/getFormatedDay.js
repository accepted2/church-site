export const getFormatedDay = (date, locale = 'ru-RU') =>
  new Date(date).toLocaleDateString(locale, {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
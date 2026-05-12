export const getWeekday = (date, locale = 'ru-RU') => {
  const weekday = new Date(date).toLocaleDateString(locale, {
    weekday: 'long',
  })

  return weekday.charAt(0).toUpperCase() + weekday.slice(1)
}
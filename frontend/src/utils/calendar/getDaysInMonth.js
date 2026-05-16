export const getDaysInMonth = (year, month) => {
  const firstDayOfMonth = new Date(year, month, 1)

  let startWeekDay = firstDayOfMonth.getDay()
  startWeekDay = startWeekDay === 0 ? 6 : startWeekDay - 1

  const daysCount = new Date(year, month + 1, 0).getDate()
  const prevMonthDays = startWeekDay

  const totalCells =
    Math.ceil((prevMonthDays + daysCount) / 7) * 7

  const days = []

  const prevMonthDate = new Date(year, month, 0)
  const prevMonthDaysCount = prevMonthDate.getDate()

  for (
    let i = prevMonthDaysCount - prevMonthDays + 1;
    i <= prevMonthDaysCount;
    i++
  ) {
    days.push({
      date: new Date(year, month - 1, i),
      isCurrentMonth: false,
      dayNumber: i,
    })
  }

  for (let i = 1; i <= daysCount; i++) {
    days.push({
      date: new Date(year, month, i),
      isCurrentMonth: true,
      dayNumber: i,
    })
  }

  const remainingCells = totalCells - days.length

  for (let i = 1; i <= remainingCells; i++) {
    days.push({
      date: new Date(year, month + 1, i),
      isCurrentMonth: false,
      dayNumber: i,
    })
  }

  return days
}
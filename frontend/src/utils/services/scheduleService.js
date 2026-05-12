const API_URL = "http://localhost:8000/api/schedule/"

export const getSchedule = async () => {
  const res = await fetch(API_URL)
  if (!res.ok) {
    throw new Error("Ошибка загрузки расписания")
  }
  return res.json()
}
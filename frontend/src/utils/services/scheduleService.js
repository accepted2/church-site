const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';


export const getSchedule = async () => {
  const res = await fetch(`${API_URL}/api/schedule/`);
  if (!res.ok) {
    throw new Error("Ошибка загрузки расписания")
  }
  return res.json()
}
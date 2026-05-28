const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const TREBY_API = `${API_BASE_URL}/api/treby`

export const getTrebaTypes = async () => {
  const response = await fetch(`${TREBY_API}/types/`)

  if (!response.ok) {
    throw new Error("Ошибка загрузки типов записок")

  }
  return response.json()
}

export const createTrebaOrder = async (orderData) => {
  const response = await fetch(`${TREBY_API}/orders/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(orderData)
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || 'Ошибка создания заказа')
  }

  return response.json()
}

export const getTrebaOrderById = async (id) => {
  const response = await fetch(`${TREBY_API}/orders/${id}/`)

  if (!response.ok) {
    throw new Error('Заказ не найден')
  }

  return response.json()
}

export const getTrebaOrderByUuid = async (uuid) => {
  const response = await fetch(`${TREBY_API}/orders/${uuid}/`)

  if (!response.ok) {

    throw response.json()
  }
}

export const checkOrderStatus = async (identifier, type = 'id') => {
  if (type === 'uuid') {
    return getTrebaOrderByUuid(identifier)
  }
  return getTrebaOrderById(identifier)
}
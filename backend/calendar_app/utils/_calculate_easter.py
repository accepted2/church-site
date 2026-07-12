from datetime import date, timedelta


def calculate_easter(year):
    """Вычисляет дату Православной Пасхи для данного года"""
    a = year % 19
    b = year % 4
    c = year % 7
    d = (19 * a + 15) % 30
    e = (2 * b + 4 * c + 6 * d + 6) % 7
    day = d + e + 4
    if day > 30:
        return date(year, 5, day - 30)
    else:
        return date(year, 4, day)


def gregorian_from_julian(month, day, year):
    """Преобразует дату из старого стиля в новый для фиксированных праздников"""
    # Для XX-XXI веков добавляем 13 дней
    julian = date(2000, month, day)
    gregorian = julian + timedelta(days=13)
    return gregorian

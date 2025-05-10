export const areEqual = (prev: any, next: any) => {
  try {
    return JSON.stringify(prev) === JSON.stringify(next);
  } catch (error) {
    console.error("Error comparing objects:", error);
    return false;
  }
};

/**
 * Format a date string to a localized format
 * @param dateString - Date string to format
 * @param locale - Locale for formatting (default: 'vi-VN')
 * @param options - Intl.DateTimeFormatOptions to customize formatting
 * @returns Formatted date string
 */
export const formatDate = (
  dateString: string,
  locale: string = 'vi-VN',
  options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  }
): string => {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString(locale, options);
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Invalid date';
  }
};
import moment from "moment";

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
  dateString: string | number,
  locale: string = "vi-VN",
  options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }
): string => {
  try {
    if (typeof dateString === "number") {
      dateString = moment.unix(dateString).format("YYYY-MM-DD HH:mm:ss");
    }
    const date = new Date(dateString);
    return date.toLocaleDateString(locale, options);
  } catch (error) {
    console.error("Error formatting date:", error);
    return "Invalid date";
  }
};

/**
 * Format a number with specified options
 * @param value - Number to format
 * @param options - Options for formatting
 * @returns Formatted number string
 */
export const formatNumber = (
  value: number | string,
  options: {
    decimals?: number;
    thousandsSeparator?: string;
    decimalSeparator?: string;
    prefix?: string;
    suffix?: string;
    compact?: boolean;
  } = {}
): string => {
  try {
    // Set default options
    const {
      decimals = 2,
      thousandsSeparator = ".",
      decimalSeparator = ",",
      prefix = "",
      suffix = "",
      compact = false,
    } = options;

    // Convert to number if string
    const num = typeof value === "string" ? parseFloat(value) : value;

    // Check if valid number
    if (isNaN(num)) {
      return "N/A";
    }

    // Handle compact notation (K, M, B, T)
    if (compact) {
      if (Math.abs(num) >= 1e12) {
        return `${prefix}${(num / 1e12).toFixed(decimals)}${
          decimalSeparator === "," ? "" : "."
        }T${suffix}`;
      }
      if (Math.abs(num) >= 1e9) {
        return `${prefix}${(num / 1e9).toFixed(decimals)}${
          decimalSeparator === "," ? "" : "."
        }B${suffix}`;
      }
      if (Math.abs(num) >= 1e6) {
        return `${prefix}${(num / 1e6).toFixed(decimals)}${
          decimalSeparator === "," ? "" : "."
        }M${suffix}`;
      }
      if (Math.abs(num) >= 1e3) {
        return `${prefix}${(num / 1e3).toFixed(decimals)}${
          decimalSeparator === "," ? "" : "."
        }K${suffix}`;
      }
    }

    // Format the number with proper separators
    const parts = num.toFixed(decimals).split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, thousandsSeparator);

    // Handle case when decimal part might be "00" and we don't want to show it
    if (decimals === 0 || (parts[1] && parseInt(parts[1]) === 0)) {
      return `${prefix}${parts[0]}${suffix}`;
    }

    return `${prefix}${parts.join(decimalSeparator)}${suffix}`;
  } catch (error) {
    console.error("Error formatting number:", error);
    return String(value);
  }
};

/**
 * Download data as a JSON file
 * @param data - The data to be downloaded as JSON
 * @param filename - Name for the downloaded file (without extension)
 * @param options - Additional options for the download
 * @returns void
 */
export const downloadJson = (
  data: any,
  filename: string = "download",
  options: {
    indent?: number;
    includeTimestamp?: boolean;
  } = {}
): void => {
  try {
    const { indent = 2, includeTimestamp = true } = options;

    // Prepare the JSON data
    const jsonString = JSON.stringify(data, null, indent);
    const blob = new Blob([jsonString], { type: "application/json" });

    // Create a download URL
    const url = URL.createObjectURL(blob);

    // Add timestamp to filename if requested
    const timestampSuffix = includeTimestamp
      ? `-${moment().format("YYYYMMDD-HHmmss")}`
      : "";

    // Create safe filename
    const safeFilename = `${filename}${timestampSuffix}.json`.replace(
      /[^a-zA-Z0-9-_]/g,
      "_"
    ); // Replace invalid chars with underscore

    // Create a temporary anchor element to trigger the download
    const a = document.createElement("a");
    a.href = url;
    a.download = safeFilename;

    // Append to body, click, and clean up
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    // Release the URL object
    setTimeout(() => URL.revokeObjectURL(url), 100);

  } catch (error) {
    console.error("Error downloading JSON file:", error);
  }
};



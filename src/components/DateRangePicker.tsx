import React, { useState, useCallback, memo } from "react";
import {
  TextField,
  Popover,
  Box,
  Typography,
  Button,
  IconButton,
  Divider,
} from "@mui/material";
import {
  ChevronLeft,
  ChevronRight,
  Today,
  CalendarToday,
} from "@mui/icons-material";
import { areEqual } from "@/utils/common";

interface DateRangePickerProps {
  startDate?: string;
  endDate?: string;
  onChange: (startDate: string, endDate: string) => void;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  error?: boolean;
  helperText?: string;
  fullWidth?: boolean;
}

const DateRangePicker: React.FC<DateRangePickerProps> = ({
  startDate = "",
  endDate = "",
  onChange,
  label = "Chọn khoảng thời gian",
  placeholder = "Chọn ngày bắt đầu - ngày kết thúc",
  disabled = false,
  error = false,
  helperText = "",
  fullWidth = true,
}) => {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectingStart, setSelectingStart] = useState(true);
  const [tempStartDate, setTempStartDate] = useState(startDate);
  const [tempEndDate, setTempEndDate] = useState(endDate);

  const open = Boolean(anchorEl);

  const handleClick = useCallback((event: React.MouseEvent<HTMLElement>) => {
    if (!disabled) {
      setAnchorEl(event.currentTarget);
      setTempStartDate(startDate);
      setTempEndDate(endDate);
      setSelectingStart(!startDate);
    }
  }, [disabled, startDate, endDate]);

  const handleClose = useCallback(() => {
    setAnchorEl(null);
  }, []);

  const formatDisplayValue = useCallback(() => {
    if (!startDate && !endDate) return "";
    if (startDate && !endDate) {
      return `${formatDate(startDate)} - Chọn ngày kết thúc`;
    }
    if (startDate && endDate) {
      return `${formatDate(startDate)} - ${formatDate(endDate)}`;
    }
    return "";
  }, [startDate, endDate]);

  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN");
  };

  const handleDateClick = useCallback((day: number) => {
    const selectedDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    const selectedDateString = selectedDate.toISOString().split('T')[0];

    if (selectingStart) {
      setTempStartDate(selectedDateString);
      setTempEndDate("");
      setSelectingStart(false);
    } else {
      if (tempStartDate && selectedDateString < tempStartDate) {
        // Nếu ngày kết thúc được chọn trước ngày bắt đầu, đổi chỗ
        setTempStartDate(selectedDateString);
        setTempEndDate(tempStartDate);
      } else {
        setTempEndDate(selectedDateString);
      }
    }
  }, [currentMonth, selectingStart, tempStartDate]);

  const handleApply = useCallback(() => {
    if (tempStartDate && tempEndDate) {
      onChange(tempStartDate, tempEndDate);
      handleClose();
    }
  }, [tempStartDate, tempEndDate, onChange, handleClose]);

  const handleClear = useCallback(() => {
    setTempStartDate("");
    setTempEndDate("");
    onChange("", "");
    handleClose();
  }, [onChange, handleClose]);

  const navigateMonth = useCallback((direction: 'prev' | 'next') => {
    setCurrentMonth(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + (direction === 'next' ? 1 : -1));
      return newDate;
    });
  }, []);

  const goToToday = useCallback(() => {
    setCurrentMonth(new Date());
  }, []);

  const isDateInRange = (day: number) => {
    if (!tempStartDate || !tempEndDate) return false;
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    const dateString = date.toISOString().split('T')[0];
    return dateString >= tempStartDate && dateString <= tempEndDate;
  };

  const isDateSelected = (day: number) => {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    const dateString = date.toISOString().split('T')[0];
    return dateString === tempStartDate || dateString === tempEndDate;
  };

  const renderCalendar = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const today = new Date();
    const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month;

    const days = [];
    const dayNames = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

    // Header với tên các ngày trong tuần
    dayNames.forEach(dayName => {
      days.push(
        <Box
          key={dayName}
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: 32,
            fontSize: '0.75rem',
            fontWeight: 'bold',
            color: 'text.secondary',
          }}
        >
          {dayName}
        </Box>
      );
    });

    // Ô trống cho các ngày của tháng trước
    for (let i = 0; i < firstDay; i++) {
      days.push(<Box key={`empty-${i}`} sx={{ height: 32 }} />);
    }

    // Các ngày trong tháng
    for (let day = 1; day <= daysInMonth; day++) {
      const isToday = isCurrentMonth && today.getDate() === day;
      const isSelected = isDateSelected(day);
      const isInRange = isDateInRange(day);

      days.push(
        <Button
          key={day}
          onClick={() => handleDateClick(day)}
          sx={{
            minWidth: 32,
            height: 32,
            p: 0,
            borderRadius: 1,
            fontSize: '0.875rem',
            backgroundColor: isSelected ? 'primary.main' : isInRange ? 'primary.light' : 'transparent',
            color: isSelected ? 'primary.contrastText' : isToday ? 'primary.main' : 'text.primary',
            fontWeight: isToday ? 'bold' : 'normal',
            border: isToday ? '1px solid' : 'none',
            borderColor: isToday ? 'primary.main' : 'transparent',
            '&:hover': {
              backgroundColor: isSelected ? 'primary.dark' : 'action.hover',
            },
          }}
        >
          {day}
        </Button>
      );
    }

    return (
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          gap: 0.5,
          width: 280,
        }}
      >
        {days}
      </Box>
    );
  };

  return (
    <>
      <TextField
        fullWidth={fullWidth}
        label={label}
        placeholder={placeholder}
        value={formatDisplayValue()}
        onClick={handleClick}
        disabled={disabled}
        error={error}
        helperText={helperText}
        InputProps={{
          readOnly: true,
          endAdornment: <CalendarToday sx={{ color: 'action.active' }} />,
        }}
        sx={{
          cursor: disabled ? 'default' : 'pointer',
          '& .MuiInputBase-input': {
            cursor: disabled ? 'default' : 'pointer',
          },
        }}
      />

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
      >
        <Box sx={{ p: 2, minWidth: 320 }}>
          {/* Header điều hướng tháng */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <IconButton size="small" onClick={() => navigateMonth('prev')}>
              <ChevronLeft />
            </IconButton>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="h6">
                {currentMonth.toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' })}
              </Typography>
              <IconButton size="small" onClick={goToToday}>
                <Today />
              </IconButton>
            </Box>

            <IconButton size="small" onClick={() => navigateMonth('next')}>
              <ChevronRight />
            </IconButton>
          </Box>

          {/* Lịch */}
          {renderCalendar()}

          {/* Thông tin lựa chọn hiện tại */}
          <Box sx={{ mt: 2, mb: 1 }}>
            <Typography variant="body2" color="text.secondary">
              {selectingStart 
                ? "Chọn ngày bắt đầu" 
                : tempStartDate 
                  ? "Chọn ngày kết thúc" 
                  : "Chọn ngày bắt đầu"
              }
            </Typography>
            {tempStartDate && (
              <Typography variant="body2">
                Từ: {formatDate(tempStartDate)}
                {tempEndDate && ` - Đến: ${formatDate(tempEndDate)}`}
              </Typography>
            )}
          </Box>

          <Divider sx={{ my: 1 }} />

          {/* Actions */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 1 }}>
            <Button variant="outlined" size="small" onClick={handleClear}>
              Xóa
            </Button>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button variant="outlined" size="small" onClick={handleClose}>
                Hủy
              </Button>
              <Button 
                variant="contained" 
                size="small" 
                onClick={handleApply}
                disabled={!tempStartDate || !tempEndDate}
              >
                Áp dụng
              </Button>
            </Box>
          </Box>
        </Box>
      </Popover>
    </>
  );
};

export default memo(DateRangePicker, areEqual);

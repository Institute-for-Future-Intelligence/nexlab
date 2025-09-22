import React from 'react';
import { Box, TextField, TextFieldProps, Paper, Typography, Chip } from '@mui/material';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { styled } from '@mui/material/styles';
import { designSystemTheme, borderRadius } from '../../config/designSystem';
import { Schedule as ScheduleIcon } from '@mui/icons-material';

interface DateTimePickerComponentProps {
  value: Date | null;
  onChange: (date: Date | null) => void;
}

const CustomTextField = styled(TextField)(({ theme }) => ({
  width: '100%',
  '& .MuiOutlinedInput-root': {
    borderRadius: borderRadius.xl,
    backgroundColor: designSystemTheme.palette.background.paper,
    '&:hover .MuiOutlinedInput-notchedOutline': {
      borderColor: designSystemTheme.palette.primary.main,
    },
    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
      borderColor: designSystemTheme.palette.primary.main,
      borderWidth: 2,
    },
  },
  '& .MuiInputLabel-root': {
    color: designSystemTheme.palette.text.secondary,
    '&.Mui-focused': {
      color: designSystemTheme.palette.primary.main,
    },
  },
}));

const CustomInput = React.forwardRef<HTMLInputElement, TextFieldProps>((props, ref) => (
  <CustomTextField {...props} inputRef={ref} fullWidth />
));

CustomInput.displayName = 'CustomInput';

const DateTimePickerComponent: React.FC<DateTimePickerComponentProps> = ({ value, onChange }) => {
  const formatDate = (date: Date | null) => {
    if (!date) return '';
    return date.toLocaleString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Paper
      elevation={2}
      sx={{
        p: 3,
        mb: 3,
        backgroundColor: designSystemTheme.palette.background.paper,
        borderRadius: borderRadius.xl,
        border: `1px solid ${designSystemTheme.palette.divider}`,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <ScheduleIcon sx={{ mr: 1, color: designSystemTheme.palette.primary.main }} />
        <Typography variant="h6" sx={{ fontWeight: 600, color: designSystemTheme.palette.text.primary }}>
          Schedule Publish
        </Typography>
      </Box>
      
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Choose when you want this material to be automatically published.
      </Typography>

      <DatePicker
        selected={value}
        onChange={(date: Date | null) => onChange(date)}
        showTimeSelect
        timeFormat="HH:mm"
        timeIntervals={15}
        dateFormat="MMM d, yyyy h:mm aa"
        minDate={new Date()}
        customInput={<CustomInput label="Select Date & Time" />}
        placeholderText="Click to select date and time"
      />

      {value && (
        <Box sx={{ mt: 2 }}>
          <Chip
            icon={<ScheduleIcon />}
            label={`Scheduled for ${formatDate(value)}`}
            color="primary"
            variant="outlined"
            sx={{
              backgroundColor: designSystemTheme.palette.primary.light,
              color: designSystemTheme.palette.primary.main,
              borderColor: designSystemTheme.palette.primary.main,
            }}
          />
        </Box>
      )}
    </Paper>
  );
};

export default DateTimePickerComponent;
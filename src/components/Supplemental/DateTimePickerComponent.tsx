import React from 'react';
import { Box, TextField, TextFieldProps } from '@mui/material';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { styled } from '@mui/material/styles';

interface DateTimePickerComponentProps {
  value: Date | null;
  onChange: (date: Date | null) => void;
}

const CustomTextField = styled(TextField)({
  width: '100%',
});

const CustomInput = React.forwardRef<HTMLInputElement, TextFieldProps>((props, ref) => (
  <CustomTextField {...props} inputRef={ref} fullWidth />
));

CustomInput.displayName = 'CustomInput';

const DateTimePickerComponent: React.FC<DateTimePickerComponentProps> = ({ value, onChange }) => {
  return (
    <Box sx={{ mb: 2 }}>
      <DatePicker
        selected={value}
        onChange={(date: Date | null) => onChange(date)}
        showTimeSelect
        dateFormat="Pp"
        customInput={<CustomInput label="Schedule Publish Date & Time" />}
      />
    </Box>
  );
};

export default DateTimePickerComponent;
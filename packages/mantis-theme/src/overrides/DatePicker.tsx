// assets
import CalendarOutlined from '@ant-design/icons/CalendarOutlined';

// ==============================|| OVERRIDES - DATE PICKER ||============================== //

export default function DatePicker() {
  return {
    MuiDatePicker: {
      defaultProps: {
        slots: { openPickerIcon: () => <CalendarOutlined /> }
      }
    }
  };
}

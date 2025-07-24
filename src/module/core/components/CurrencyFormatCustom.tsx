import React from 'react';
import { NumericFormat, NumericFormatProps, NumberFormatValues } from 'react-number-format';
import { TextFieldProps } from '@mui/material/TextField';

interface CurrencyFormatCustomProps extends Omit<NumericFormatProps, 'onChange'> {
  onChange: (event: { target: { name: string; value: number } }) => void;
  name: string;
  inputProps?: TextFieldProps['inputProps'];
  defaultValue?: string | number | null | undefined;
}

const CurrencyFormatCustom = React.forwardRef<typeof NumericFormat, CurrencyFormatCustomProps>(
  function CurrencyFormatCustom(props, ref) {
    const { onChange, name, inputProps, defaultValue, ...other } = props;

    const normalizedDefaultValue = Array.isArray(defaultValue)
      ? defaultValue[0]
      : defaultValue;

    return (
      <NumericFormat
        {...other}
        getInputRef={ref}
        thousandSeparator="."
        decimalSeparator=","
        decimalScale={2}
        fixedDecimalScale
        prefix="$ "
        onValueChange={(values: NumberFormatValues) => {
          onChange({
            target: {
              name,
              value: values.floatValue ?? 0,
            },
          });
        }}
        allowNegative={false}
        valueIsNumericString
        defaultValue={normalizedDefaultValue}
        {...inputProps}
      />
    );
  }
);

export default CurrencyFormatCustom;
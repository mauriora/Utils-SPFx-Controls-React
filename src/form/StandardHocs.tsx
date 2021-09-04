import * as React from 'react';
import { FunctionComponent } from 'react';
import { observer } from 'mobx-react-lite';
import { TextField as FluentTextField, Checkbox, Rating, SpinButton, Link } from '@fluentui/react';
import { PropertyFieldProps } from './PropertyField';

export const RatingCountField: FunctionComponent<PropertyFieldProps> = observer(({ info, item, property }) =>
    <FluentTextField
        iconProps={{ iconName: 'FavoriteStar' }}
        label={info.Title}
        required={info.Required}
        value={item[property]}
        readOnly={info.ReadOnlyField}
        placeholder={info.Description}
        onChange={() => console.warn(`PropertyField( ${info.TypeAsString}[${info.FieldTypeKind}] ${property} ).onChange not implemented`)}
    />
);

export const BooleanField: FunctionComponent<PropertyFieldProps> = observer(({ info, item, property }) =>
    <Checkbox
        label={info.Title}
        checked={item[property]}
        disabled={info.ReadOnlyField}
        onChange={(e, checked) => item[property] = checked}
    />
);


export const CurrencyField: FunctionComponent<PropertyFieldProps> = observer(({ info, item, property }) =>
    <FluentTextField
        label={info.Title}
        value={item[property]}
        required={info.Required}
        readOnly={info.ReadOnlyField}
        placeholder={info.Description}
        prefix={'$'}
        onChange={(e, newValue) => item[property] = Number(newValue)}
    />
);

export const NumberField: FunctionComponent<PropertyFieldProps> = observer(({ info, item, property }) =>
    <SpinButton
        label={info.Title}
        value={item[property]}
        disabled={info.ReadOnlyField}
        placeholder={info.Description}
        min={info['MinimumValue'] == Number.MIN_VALUE ? 0 : info['MinimumValue']}
        max={info['MaximumValue'] == Number.MAX_VALUE ? 100 : info['MaximumValue']}
        step={info['MaximumValue'] == Number.MAX_VALUE ? 1 : info['MaximumValue'] / 100}
        incrementButtonAriaLabel={`Increase value by ${info['MaximumValue'] == Number.MAX_VALUE ? 1 : info['MaximumValue'] / 100}`}
        decrementButtonAriaLabel={`Decrease value by ${info['MaximumValue'] == Number.MAX_VALUE ? 1 : info['MaximumValue'] / 100}`}
        onChange={(e, newValue: string) => item[property] = Number(newValue)}
    />
);

export const TextField: FunctionComponent<PropertyFieldProps> = observer(({ info, item, property }) =>
    <FluentTextField
        label={info.Title}
        value={item[property]}
        required={info.Required}
        readOnly={info.ReadOnlyField}
        placeholder={info.Description}
        onChange={(e, newValue) => item[property] = newValue}
    />
);


export const CounterField: FunctionComponent<PropertyFieldProps> = observer(({ info, item, property }) =>
    <FluentTextField
        label={info.Title}
        value={item[property]}
        required={info.Required}
        readOnly={info.ReadOnlyField}
        placeholder={info.Description}
        onChange={(e, newValue) => item[property] = Number(newValue)}
    />
);


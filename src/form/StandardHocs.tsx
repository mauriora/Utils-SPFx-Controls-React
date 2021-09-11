import * as React from 'react';
import { observer } from 'mobx-react-lite';
import { TextField as FluentTextField, Checkbox, Rating, SpinButton, Link } from '@fluentui/react';
import { PropertyFieldFC } from './PropertyField';
import { getMaximumValue, getMinimumValue } from '@mauriora/controller-sharepoint-list';

export const RatingCountField: PropertyFieldFC = observer(({ info, item, property }) => {
    const value = item[property];
    if(typeof value !== 'string') throw new Error(`RatingCountField: Property '${property}' is not a string it's ${typeof value}`);

    return <FluentTextField
        iconProps={{ iconName: 'FavoriteStar' }}
        label={info.Title}
        required={info.Required}
        value={value}
        readOnly={info.ReadOnlyField}
        placeholder={info.Description}
        onChange={() => console.warn(`PropertyField( ${info.TypeAsString}[${info.FieldTypeKind}] ${property} ).onChange not implemented`)}
    />
});

export const BooleanField: PropertyFieldFC = observer(({ info, item, property }) => {
    const value = item[property];
    if(typeof value !== 'boolean') throw new Error(`BooleanField: Property '${property}' is not a boolean it's ${typeof value}`);

    return <Checkbox
        label={info.Title}
        checked={value}
        disabled={info.ReadOnlyField}
        onChange={(e, checked) => item[property] = checked}
    />
});


export const CurrencyField: PropertyFieldFC = observer(({ info, item, property }) => {
    const value = item[property];
    if(typeof value !== 'string') throw new Error(`CurrencyField: Property '${property}' is not a string it's ${typeof value}`);

    return <FluentTextField
        label={info.Title}
        value={value}
        required={info.Required}
        readOnly={info.ReadOnlyField}
        placeholder={info.Description}
        prefix={'$'}
        onChange={(e, newValue) => item[property] = Number(newValue)}
    />
});

export const NumberField: PropertyFieldFC = observer(({ info, item, property }) => {
    const value = item[property];
    if(typeof value !== 'number') throw new Error(`NumberField: Property '${property}' is not a string it's ${typeof value}`);

    return <SpinButton
        label={info.Title}
        value={value as unknown as string}
        disabled={info.ReadOnlyField}
        placeholder={info.Description}
        min={getMinimumValue( info ) == Number.MIN_VALUE ? 0 : getMinimumValue( info )}
        max={getMaximumValue( info ) == Number.MAX_VALUE ? 100 : getMaximumValue( info )}
        step={getMaximumValue( info ) == Number.MAX_VALUE ? 1 : getMaximumValue( info ) / 100}
        incrementButtonAriaLabel={`Increase value by ${getMaximumValue( info ) == Number.MAX_VALUE ? 1 : getMaximumValue( info ) / 100}`}
        decrementButtonAriaLabel={`Decrease value by ${getMaximumValue( info ) == Number.MAX_VALUE ? 1 : getMaximumValue( info ) / 100}`}
        onChange={(e, newValue: string) => item[property] = Number(newValue)}
    />
});

export const TextField: PropertyFieldFC = observer(({ info, item, property }) => {
    const value = item[property];
    if(typeof value !== 'string') throw new Error(`TextField: Property '${property}' is not a string it's ${typeof value}`);

    return <FluentTextField
        label={info.Title}
        value={value}
        required={info.Required}
        readOnly={info.ReadOnlyField}
        placeholder={info.Description}
        onChange={(e, newValue) => item[property] = newValue}
    />
});


export const CounterField: PropertyFieldFC = observer(({ info, item, property }) => {
    const value = item[property];
    if(typeof value !== 'string') throw new Error(`CounterField: Property '${property}' is not a string it's ${typeof value}`);

    return <FluentTextField
        label={info.Title}
        value={value}
        required={info.Required}
        readOnly={info.ReadOnlyField}
        placeholder={info.Description}
        onChange={(e, newValue) => item[property] = Number(newValue)}
    />
});


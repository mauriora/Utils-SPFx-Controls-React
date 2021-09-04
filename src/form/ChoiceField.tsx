import * as React from 'react';
import { FunctionComponent, useCallback, useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { Dropdown, IDropdownOption, ComboBox, IComboBoxOption } from '@fluentui/react';
import { PropertyFieldProps } from './PropertyField';


export const ChoiceField: FunctionComponent<PropertyFieldProps> = observer(({ info, item, property }) => {
    const choicesArray: Array<string> = info['Choices'];

    const [options, setOptions] = useState<Array<{ key: string, text: string }>>();
    const getOptions = useCallback(() =>
        [
            ...choicesArray.map(choiceText => ({ key: choiceText, text: choiceText })),
            ...(item[property] && choicesArray.indexOf(item[property]) < 0 ? [{ key: item[property], text: item[property] }] : [])
        ],
        [choicesArray, item, property]
    );

    const onComboChange = useCallback(
        (e, selection?: IComboBoxOption, index?: number, value?: string) => {
            item[property] = selection?.key ?? value;
            if (value) {
                setOptions([...options, { key: value, text: value }]);
            }
        },
        [item, property, options]
    );

    const updateOptions = useCallback(
        () => {
            const value = item[property];

            if (options && (! options.some(option => option.key === value))) {
                setOptions([...options, { key: value, text: value }]);
            }
        },
        [item[property], item, property]
    );


    useEffect(() => setOptions(getOptions()), [item]);
    useEffect(updateOptions, [item[property]]);

    return true === info['FillInChoice'] ?
        <ComboBox
            allowFreeform
            label={info.Title}
            required={info.Required}
            disabled={info.ReadOnlyField}
            placeholder={info.Description}
            selectedKey={item[property]}
            onChange={onComboChange}
            options={options}
        />
        :
        <Dropdown
            label={info.Title}
            required={info.Required}
            disabled={info.ReadOnlyField}
            placeholder={info.Description}
            selectedKey={item[property]}
            onChange={(e, selection: IDropdownOption) => item[property] = selection.key}
            options={options}
        />;
}
);

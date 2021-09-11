import * as React from 'react';
import { FunctionComponent, useCallback, useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { Dropdown, IDropdownOption, ComboBox, IComboBoxOption } from '@fluentui/react';
import { PropertyFieldFC } from './PropertyField';
import { getChoices, isFillInChoice } from "@mauriora/controller-sharepoint-list";


export const ChoiceField: PropertyFieldFC = observer(({ info, item, property }) => {
    const choicesArray: Array<string> = getChoices(info);
    const value = item[property];

    if(('string' !== typeof value) && ('undefined' !== typeof value) ) throw new TypeError(`ChoiceField(${property}) should be undefined or of type string, but it's of type ${typeof value}: ${String(value)}`);

    const [options, setOptions] = useState<Array<{ key: string, text: string }>>();
    const getOptions = useCallback(() =>
        [
            ...choicesArray.map(choiceText => ({ key: choiceText, text: choiceText })),
            ...(value && (! choicesArray.includes(value)) ? [{ key: value, text: value }] : [])
        ],
        [choicesArray, item, property, value]
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

    return true === isFillInChoice( info ) ?
        <ComboBox
            allowFreeform
            label={info.Title}
            required={info.Required}
            disabled={info.ReadOnlyField}
            placeholder={info.Description}
            selectedKey={item[property] as string}
            onChange={onComboChange}
            options={options}
        />
        :
        <Dropdown
            label={info.Title}
            required={info.Required}
            disabled={info.ReadOnlyField}
            placeholder={info.Description}
            selectedKey={item[property] as string}
            onChange={(e, selection: IDropdownOption) => (item[property] as string | number) = selection.key}
            options={options}
        />;
}
);

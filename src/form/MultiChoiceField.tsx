import { ComboBox, Dropdown } from "@fluentui/react";
import * as React from "react";
import { FunctionComponent, useCallback, useEffect, useState } from "react";
import { PropertyFieldProps } from "./PropertyField";
import { observer } from 'mobx-react-lite';

interface GuiOptionItem {
    key: string | number;
    selected?: boolean;
}

const string2Option = (text: string) => ({ key: text, text: text });

export const MultiChoiceField: FunctionComponent<PropertyFieldProps> = observer(({ info, item, property }) => {
    const choicesArray: Array<string> = info['Choices'];

    const [options, setOptions] = useState<Array<{ key: string, text: string }>>();

    /** Map string options and fillin options to key/text pair */
    const getOptions = useCallback(() =>
        [
            ...choicesArray.map(string2Option),
            ...(item[property] ?? [])
                .filter(fillIn => (!choicesArray.some(choiceKey => choiceKey === fillIn)))
                .map(string2Option)
        ],
        [choicesArray, item, property]
    );

    const onChange = useCallback(
        (e, selection?: GuiOptionItem, index?: number, value?: string) => {

            const chosen = item[property];

            if (undefined !== value) {
                chosen.push(value);
                setOptions([...options, string2Option(value)]);
            } else if (selection.selected) {
                chosen.push(selection.key as string);
            } else {
                const index = chosen.indexOf(String(selection.key));
                chosen.splice(index, 1);
            }
        },
        [item[property], item, property, options]
    );

    const updateOptions = useCallback(
        () => {
            /// Add freeForm values to option

            if (options && item[property] && ((item[property]).some(fillIn => (! options.some( option => option.key === fillIn )) ) ) ) {
                setOptions([...options, ...(item[property] ?? [])
                    .filter(fillIn => (!choicesArray.some(choiceKey => choiceKey === fillIn)))
                    .map(string2Option)]);
            }
        },
        [options, item, property, ...(item[property] ?? [])]
    );

    useEffect(() => setOptions(getOptions()), [item]);
    useEffect(updateOptions, [item[property], ...(item[property] ?? [])]);

    if (options && item[property] && ((item[property]).some(fillIn => (! options.some( option => option.key === fillIn )) ) ) ) {
        setOptions([...options, ...(item[property] ?? [])
            .filter(fillIn => (!choicesArray.some(choiceKey => choiceKey === fillIn)))
            .map(string2Option)]);
    }

    return true === info['FillInChoice'] ?
        <ComboBox
            allowFreeform
            multiSelect
            label={info.Title}
            required={info.Required}
            disabled={info.ReadOnlyField}
            placeholder={info.Description}
            selectedKey={item[property] ? [...item[property]] : []}
            onChange={onChange}
            options={options}
        />
        :
        <Dropdown
            multiSelect
            label={info.Title}
            required={info.Required}
            disabled={info.ReadOnlyField}
            placeholder={info.Description}
            selectedKeys={item[property] ? [...item[property]] : []}
            onChange={onChange}
            options={options}
        />;
});


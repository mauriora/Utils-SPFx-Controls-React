import { ComboBox, Dropdown } from "@fluentui/react";
import * as React from "react";
import { useCallback, useEffect, useState } from "react";
import { PropertyFieldFC } from './PropertyField';
import { observer } from 'mobx-react-lite';
import { getChoices, isFillInChoice } from "@mauriora/controller-sharepoint-list";

interface GuiOptionItem {
    key: string | number;
    selected?: boolean;
}

const string2Option = (text: string) => ({ key: text, text: text });

export const MultiChoiceField: PropertyFieldFC = observer(({ info, item, property }) => {
    const choicesArray: Array<string> | false = getChoices(info);
    const chosen = item[property] ?? [];

    if( ! choicesArray ) throw new TypeError(`ChoiceField(${property}) has no choices`);
    if( ! Array.isArray(chosen) ) throw new TypeError(`MultiChoiceField: Property ${property} must be an array, its of type ${typeof chosen}`);


    const [options, setOptions] = useState<Array<{ key: string, text: string }>>();

    /** Map string options and fillin options to key/text pair */
    const getOptions = useCallback(() => [
                ...choicesArray.map(string2Option),
                ...chosen
                    .filter(fillIn => (!choicesArray.some(choiceKey => choiceKey === fillIn)))
                    .map(string2Option)
            ],
        [choicesArray, chosen]
    );

    const onChange = useCallback(
        (e, selection?: GuiOptionItem, index?: number, value?: string) => {
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
        [chosen, item, property, options]
    );

    const updateOptions = useCallback(
        () => {
            if (options && chosen && (chosen.some(fillIn => (! options.some( option => option.key === fillIn )) ) ) ) {
                setOptions([...options, ... chosen
                    .filter(fillIn => (!choicesArray.some(choiceKey => choiceKey === fillIn)))
                    .map(string2Option)]);
            }
        },
        [options, chosen]
    );

    useEffect(() => setOptions(getOptions()), [item]);
    useEffect(updateOptions, [chosen, chosen.length]);

    if (options && chosen && (chosen.some(fillIn => (! options.some( option => option.key === fillIn )) ) ) ) {
        setOptions([...options, ...chosen
            .filter(fillIn => (!choicesArray.some(choiceKey => choiceKey === fillIn)))
            .map(string2Option)]);
    }

    return true === isFillInChoice( info ) ?
        <ComboBox
            allowFreeform
            multiSelect
            label={info.Title}
            required={info.Required}
            disabled={info.ReadOnlyField}
            placeholder={info.Description}
            selectedKey={[...chosen]}
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
            selectedKeys={[...chosen]}
            onChange={onChange}
            options={options}
        />;
});


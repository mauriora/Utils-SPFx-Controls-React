import * as React from "react";
import { FunctionComponent, useCallback } from "react";
import { PropertyFieldProps } from "./PropertyField";
import { observer } from 'mobx-react-lite';
import { MetaTerm } from "@mauriora/controller-sharepoint-list";
import { EmptyGuid, IPickerTerm, IPickerTerms, TaxonomyPicker } from "@pnp/spfx-controls-react";

export const REPLACE_TAG = '*TAXONOMY-REPLACE-TAG*';
export interface TaxonmyFieldProps extends PropertyFieldProps {
  /**
   * The method is used to get the validation error message and determine whether the input value is valid or not.
   *
   *   When it returns string:
   *   - If valid, it returns empty string.
   *   - If invalid, it returns the error message string and the text field will
   *     show a red border and show an error message below the text field.
   *
   *   When it returns Promise<string>:
   *   - The resolved value is display as error message.
   *   - The rejected, the value is thrown away.
   */
   onGetErrorMessage?: (value: IPickerTerms) => string | Promise<string>;
}

export const TaxonmyField: FunctionComponent<TaxonmyFieldProps> = observer(({ info, item, property, onGetErrorMessage }) => {
    const isKeywordField = true === info['IsKeyword'];
    const onChange = (newValue: IPickerTerms) => {
        const newTerms = newValue.map(term => ({ label: term.name, termGuid: term.key }));
        item[property] = info['AllowMultipleValues'] ?
            newTerms : newTerms[0];
    };

    const terms = item[property] ?
        (info['AllowMultipleValues'] ?
            item[property].map((term: MetaTerm) => ({ name: term.label, key: term.termGuid })) :
            [{ name: item[property].label, key: item[property].termGuid }]
        ) :
        [];

    const onNewKeyWord = useCallback(
        async (value: IPickerTerm): Promise<void> => {

            if(value?.name && EmptyGuid === value.key ){
                const term = new MetaTerm();
                term.label = value.name;
                term.termGuid= value.key;
                term.wssId = -1;

                if(! item[property]) {
                    console.error(`TaxonmyField.onNewKeyWord: ARRAYS SHOULD BE INITIALISED`);
                    item[property] = new Array<MetaTerm>();
                }
                (item[property] as Array<MetaTerm>).push( term );
            } else {
                console.error(`TaxonmyField.onNewKeyWord(${item.id}.${property}) name=${value[0]?.name} TermSetId=${info['TermSetId']}`, { value: value ? {...value} : value, termsNow: item[property] ? [...item[property]] : item[property], item, info });
            }
        },
        [item, property]
    );

    return <TaxonomyPicker
        allowMultipleSelections={info['AllowMultipleValues']}
        label={info.Title}
        required={info.Required}
        initialValues={terms}
        placeholder={info.Description}
        validateInput
        onGetErrorMessage={onGetErrorMessage}
        onNewTerm={isKeywordField ? onNewKeyWord : undefined}
        termsetNameOrID={info['TermSetId']}
        panelTitle="Select Term"
        context={item.controller.context}
        onChange={onChange}
        isTermSetSelectable={false}
    />;
});

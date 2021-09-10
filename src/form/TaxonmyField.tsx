import * as React from "react";
import { FunctionComponent, useCallback, useMemo } from "react";
import { PropertyFieldProps } from "./PropertyField";
import { observer } from 'mobx-react-lite';
import { allowsMultipleValues, MetaTerm, hasTermSetId, getTermSetId, isKeyword } from "@mauriora/controller-sharepoint-list";
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
    const allowMultiple = useMemo(() => allowsMultipleValues(info), [info]);
    const propertyValue = item[property];

    if( allowMultiple && (! Array.isArray(propertyValue) ) ) throw new Error(`TaxonmyField([${item.id}]${property}(${info.InternalName})) allows multiple values but is not an array`);
    if( (!allowMultiple) && (undefined !== propertyValue && (! (propertyValue instanceof MetaTerm)) ) ) throw new Error(`TaxonmyField([${item.id}]${property}(${info.InternalName})) should be undefined or an instance of MetaTerm`);

    const isKeywordField = isKeyword( info );
    const onChange = (newValue: IPickerTerms) => {
        const newTerms = newValue.map(term => ({ label: term.name, termGuid: term.key }));
        (item[property] as unknown) = allowMultiple ?
            newTerms : newTerms[0];
    };

    const terms = new Array();
    
    if(Array.isArray(propertyValue)) {
        terms.push(
            ...propertyValue.map(
                (term: MetaTerm) => ({ name: term.label, key: term.termGuid }))
        );
    } else if(propertyValue instanceof MetaTerm) {
        terms.push({ name: propertyValue.label, key: propertyValue.termGuid });
    }

    const onNewKeyWord = useCallback(
        async (value: IPickerTerm): Promise<void> => {

            if(value?.name && EmptyGuid === value.key ){
                const term = new MetaTerm();
                term.label = value.name;
                term.termGuid= value.key;
                term.wssId = -1;

                if(Array.isArray(propertyValue)) {
                    propertyValue.push( term );
                } else if(propertyValue instanceof MetaTerm) {
                    (item[property] as unknown) = term;
                }
            } else {
                console.error(`TaxonmyField.onNewKeyWord(${item.id}.${property}) allowMultiple=${allowMultiple} TermSetId=${getTermSetId(info)}`, { value: value ? {...value} : value, propertyValueNow: Array.isArray( propertyValue ) ? [...propertyValue] : propertyValue, item, info });
            }
        },
        [item, property]
    );

    return <TaxonomyPicker
        allowMultipleSelections={allowMultiple}
        label={info.Title}
        required={info.Required}
        initialValues={terms}
        placeholder={info.Description}
        validateInput
        onGetErrorMessage={onGetErrorMessage}
        onNewTerm={isKeywordField ? onNewKeyWord : undefined}
        termsetNameOrID={getTermSetId(info)}
        panelTitle="Select Term"
        context={item.controller.context}
        onChange={onChange}
        isTermSetSelectable={false}
    />;
});

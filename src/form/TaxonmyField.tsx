import * as React from "react";
import { FunctionComponent, useCallback, useMemo } from "react";
import { PropertyFieldProps } from "./PropertyField";
import { observer } from 'mobx-react-lite';
import { allowsMultipleValues, MetaTerm, getTermSetId, isKeyword } from "@mauriora/controller-sharepoint-list";
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

const metaEqualsPicker = (a: MetaTerm, b: IPickerTerm) =>
    a.termGuid === b.key && a.label && b.name;

const removeMissing = (removeFrom: Array<MetaTerm>, matches: IPickerTerms) => {
    for (let i = 0; i < removeFrom.length; i++) {
        const removable = removeFrom[i];
        if (undefined == matches.find(prospect => metaEqualsPicker(removable, prospect))) {
            removeFrom.splice(i, 1);
            i--;
        }
    }
}

const addNew = (addTo: Array<MetaTerm>, matches: IPickerTerms) => {
    for (const match of matches) {
        if (undefined === addTo.find(prospect => metaEqualsPicker(prospect, match))) {
            const term = new MetaTerm({
                label: match.name,
                termGuid: match.key,
                wssId: -1
            });
            addTo.push(term);
        }
    }
}



export const TaxonmyField: FunctionComponent<TaxonmyFieldProps> = observer(({ info, item, property, onGetErrorMessage }) => {
    const allowMultiple = useMemo(() => allowsMultipleValues(info), [info]);
    const termSetId = useMemo(() => getTermSetId(info), [info]);

    const propertyValue = item[property];

    if (false === termSetId) throw new Error(`TaxonmyField([${item.id}]${property}(${info.InternalName})) can't get termset id`);
    if (allowMultiple && (!Array.isArray(propertyValue)))
        throw new Error(`TaxonmyField([${item.id}]${property}(${info.InternalName})) allows multiple values but is not an array`);
    if ((!allowMultiple) && (undefined !== propertyValue && null !== propertyValue && (!(propertyValue instanceof MetaTerm))))
        throw new Error(`TaxonmyField([${item.id}]${property}(${info.InternalName})) should be undefined, null or an instance of MetaTerm, but itis of type ${typeof propertyValue}:${String(propertyValue)}`);

    const isKeywordField = useMemo( () => isKeyword(info), [info] );
    const onChange = useCallback(
        (newValue: IPickerTerms) => {
            console.log(`TaxonmyField.onChange(${item.id}.${property}) allowMultiple=${allowMultiple}`, { newValue });

            if (allowMultiple) {
                const termlist = item[property] as Array<MetaTerm>;

                removeMissing(termlist, newValue);
                addNew(termlist, newValue);
            } else if (1 === newValue.length) {
                item[property] = new MetaTerm({
                    label: newValue[0].name,
                    termGuid: newValue[0].key,
                    wssId: -1
                });
            } else {
                item[property] = null;
            }
        },
        [item, property]
    );

    const terms = new Array<IPickerTerm>();

    if (Array.isArray(propertyValue)) {
        terms.push(
            ...propertyValue.map(
                (term: MetaTerm) => ({ name: term.label, key: term.termGuid, termSet: termSetId, path: undefined }))
        );
    } else if (propertyValue instanceof MetaTerm) {
        terms.push({ name: propertyValue.label, key: propertyValue.termGuid, termSet: termSetId, path: undefined });
    }

    const onNewKeyWord = useCallback(
        async (value: IPickerTerm): Promise<void> => {

            if (value?.name && EmptyGuid === value.key) {
                const term = new MetaTerm({
                        label: value.name,
                        termGuid: value.key,
                        wssId: -1
                    });

                if (Array.isArray(propertyValue)) {
                    propertyValue.push(term);
                } else {
                    item[property] = term;
                }
            } else {
                console.error(`TaxonmyField.onNewKeyWord(${item.id}.${property}) allowMultiple=${allowMultiple} TermSetId=${getTermSetId(info)}`, { value: value ? { ...value } : value, propertyValueNow: Array.isArray(propertyValue) ? [...propertyValue] : propertyValue, item, info });
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
        termsetNameOrID={termSetId}
        panelTitle="Select Term"
        context={item.controller.context}
        onChange={onChange}
        isTermSetSelectable={false}
    />;
});

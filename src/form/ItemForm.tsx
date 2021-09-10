import * as React from 'react';
import { FunctionComponent, useCallback, useEffect, useState } from 'react';
import { DefaultButton, IconButton, PrimaryButton, Spinner, Stack } from '@fluentui/react';
import { ListItem, SharePointModel } from '@mauriora/controller-sharepoint-list';
import { PropertyField, PropertyFieldProps } from './PropertyField';
import { clone, assign } from '@microsoft/sp-lodash-subset'
import { useAsyncError } from '../hooks/AsyncError';

export interface ItemFormProps {
    model: SharePointModel<ListItem>;
    item: ListItem;
    saveButtonText: string;
    deleteButtonText: string;
    cancelButtonText: string;
}

export const ItemForm: FunctionComponent<ItemFormProps> = ({ model, item, cancelButtonText, deleteButtonText, saveButtonText }) => {

    const throwError = useAsyncError();
    const [originalItemValues, setOriginalItemValues] = useState(clone(item));
    const [fields, setFields] = useState(new Array<PropertyFieldProps<ListItem>>());

    const loadFields = () => {
        const newFields = new Array<PropertyFieldProps<ListItem>>();
        if (model && item) {
            model.propertyFields.forEach(
                (info, property) => {
                    newFields.push({ info, property, item, model });
                }
            );
        }
        setFields(newFields);
    };

    const resetItem = useCallback(
        () => {
            assign(item, originalItemValues);
        },
        [item, originalItemValues]
    );

    const updateOriginalItemValues = useCallback(
        () => {
            setOriginalItemValues(clone(item));
        },
        [item]
    );

    const submitItem = useCallback(
        async () => {
            try {
                await model.submit(item);
                updateOriginalItemValues();
            } catch (submitError) {
                throwError(submitError);
            }
        },
        [model, item]
    );

    const deleteItem = useCallback( () => item.delete(), [item] );
    
    useEffect(loadFields, [model.propertyFields.size, item]);
    useEffect(updateOriginalItemValues, [item]);

    if (undefined === model || undefined === item) {
        return <Spinner />;
    }

    return <Stack>
        {fields.map(fieldProps =>
            <PropertyField key={fieldProps.property} {...fieldProps} />
        )}
        <Stack horizontal horizontalAlign={'space-between'}>
            <DefaultButton text={cancelButtonText} onClick={resetItem} />
            <IconButton
                disabled={! item.canBeDeleted}
                iconProps={{ iconName: 'Delete' }}
                text={deleteButtonText} 
                onClick={deleteItem} />
            <PrimaryButton text={saveButtonText} onClick={submitItem} />
        </Stack>
    </Stack>;
};
import * as React from 'react';
import { FunctionComponent } from 'react';
import { observer } from 'mobx-react-lite';
import { PropertyFieldProps } from './PropertyField';
import { getById, ListItemBase } from '@mauriora/controller-sharepoint-list';
import { Label, Stack } from '@fluentui/react';
import { ListItemPicker } from '@pnp/spfx-controls-react';

interface LookupKeyName {
    key: string;
    name: string;
}

const listItemBaseToLookupKeyName = (item: ListItemBase): LookupKeyName => (item === undefined ? undefined : { key: item.id === undefined ? undefined : item.id.toFixed(), name: item.title });

export const  LookupField: FunctionComponent<PropertyFieldProps> = observer(({ info, item, property }) => {
    const isMulti = info['AllowMultipleValues'] === true;
    let selectedItems: Array<LookupKeyName> = undefined;

    if (undefined === item[property]) {
        selectedItems = [];
    } else if (isMulti) {
        const lookups = item[property] as Array<ListItemBase>;

        selectedItems = lookups.map(listItemBaseToLookupKeyName);
    } else {
        selectedItems = [listItemBaseToLookupKeyName(item[property])];
    }

    const lookupKeyNameTolistItemBase = async (lookup: LookupKeyName): Promise<ListItemBase> => {
        const listItem = new ListItemBase();
        listItem.id = Number(lookup.key);
        listItem.title = lookup.name;
        const lookUpListId = info['LookupList'];
        const controller = getById(lookUpListId);
        const controllerItem = await controller.addGetPartial(listItem);
        return controllerItem;
    };

    const onSelectedItems = async (items: { key: string; name: string }[]) => {
        const lookUps = new Array<ListItemBase>();
        for( const item of items) {
            lookUps.push(
                await lookupKeyNameTolistItemBase(item)
            );
        }

        if (isMulti) {
            item[property] = lookUps;
        } else {
            item[property] = items.length ? lookUps[0] : undefined;
        }
    };

    return <Stack>
        <Label>{info.Title}</Label>
        <ListItemPicker
            listId={info['LookupList']}

            /** InternalName of column to use as the key for the selection. Must be a column with unique values. Default: Id */
            keyColumnInternalName='Id'

            /** InternalName of column to search and get values. */
            columnInternalName='Title'

            // filter="Title eq 'SPFx'"
            // orderBy={"Id desc"}
            itemLimit={info['AllowMultipleValues'] === true ? 10 : 1}
            onSelectedItem={onSelectedItems}

            defaultSelectedItems={selectedItems}

            /** SPFx web part or extention context */
            context={item.controller.context}

            disabled={info.ReadOnlyField}
            placeholder={info.Description}
        />
    </Stack>;
});

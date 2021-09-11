import * as React from 'react';
import { observer } from 'mobx-react-lite';
import { PropertyFieldFC } from './PropertyField';
import { allowsMultipleValues, getById, getLookupList, ListItemBase } from '@mauriora/controller-sharepoint-list';
import { Label, Stack } from '@fluentui/react';
import { ListItemPicker } from '@pnp/spfx-controls-react';
import { useMemo } from 'react';

interface LookupKeyName {
    key: string;
    name: string;
}

const listItemBaseToLookupKeyName = (item: ListItemBase): LookupKeyName => (item === undefined ? undefined : { key: item.id === undefined ? undefined : item.id.toFixed(), name: item.title });

export const  LookupField: PropertyFieldFC = observer(({ info, item, property }) => {
    const lookUpListId = useMemo(() => getLookupList( info ), [info]);
    if(! lookUpListId ) throw new Error(`LookupComboBoxField.lookupTolistItemBase: can't get lookup list id`);

    const isMulti = allowsMultipleValues(info);
    let selectedItems: Array<LookupKeyName> = undefined;

    if (undefined === item[property]) {
        selectedItems = [];
    } else if (isMulti) {
        const lookups = item[property] as Array<ListItemBase>;

        selectedItems = lookups.map(listItemBaseToLookupKeyName);
    } else {
        selectedItems = [listItemBaseToLookupKeyName(item[property] as ListItemBase)];
    }

    const lookupKeyNameTolistItemBase = async (lookup: LookupKeyName): Promise<ListItemBase> => {
        const listItem = new ListItemBase();
        listItem.id = Number(lookup.key);
        listItem.title = lookup.name;
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
            listId={lookUpListId}

            /** InternalName of column to use as the key for the selection. Must be a column with unique values. Default: Id */
            keyColumnInternalName='Id'

            /** InternalName of column to search and get values. */
            columnInternalName='Title'

            // filter="Title eq 'SPFx'"
            // orderBy={"Id desc"}
            itemLimit={allowsMultipleValues(info) ? 10 : 1}
            onSelectedItem={onSelectedItems}

            defaultSelectedItems={selectedItems}

            /** SPFx web part or extention context */
            context={item.controller.context}

            disabled={info.ReadOnlyField}
            placeholder={info.Description}
        />
    </Stack>;
});

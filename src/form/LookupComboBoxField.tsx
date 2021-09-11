import * as React from 'react';
import { FunctionComponent, useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { PropertyFieldFC } from './PropertyField';
import { allowsMultipleValues, getById, getLookupList, ListItemBase, SharePointContext } from '@mauriora/controller-sharepoint-list';
import { Label, Stack } from '@fluentui/react';
// import { ComboBoxListItemPicker } from '@pnp/spfx-controls-react';
import { ComboBoxListItemPicker } from './SpfxControlsFix/ComboBoxListItemPicker';
import { classToPlain } from 'class-transformer';

interface Lookup {
    ID: number;
    Title: string;
}

export const  LookupComboBoxField: PropertyFieldFC = observer(({ info, item, property }) => {
    const isMulti = allowsMultipleValues(info);
    let selectedItems: Array<Lookup> = undefined;

    if (undefined === item[property]) {
        selectedItems = [];
    } else if (isMulti) {
        const array = item[property];

        if( Array.isArray( array ) ) {
            const lookups = array.map( item => classToPlain(item) as Lookup );
            selectedItems = lookups;
        }
    } else {
        selectedItems = [classToPlain( item[property] ) as Lookup];
    }

    const lookupTolistItemBase = async (lookup: Lookup): Promise<ListItemBase> => {
        const listItem = new ListItemBase().init();
        listItem.id = lookup.ID;
        listItem.title = lookup.Title;
        const lookUpListId = getLookupList( info );
        const controller = getById(lookUpListId);
        const controllerItem = await controller.addGetPartial(listItem);
        return controllerItem;
    };

    const onSelectedItems = async (items: Lookup[]) => {
        const lookUps = new Array<ListItemBase>();
        for( const item of items) {
            lookUps.push(
                await lookupTolistItemBase(item)
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
        <ComboBoxListItemPicker
            listId={getLookupList( info )}
            keyColumnInternalName='ID'
            columnInternalName='Title'
            webUrl={(item.controller.context as SharePointContext).pageContext.web.absoluteUrl}
            spHttpClient={(item.controller.context as SharePointContext).spHttpClient}
            multiSelect={allowsMultipleValues(info)}
            onSelectedItem={onSelectedItems}
            selectedItems={selectedItems}            
            /**
             * @example defaultSelectedItems=[{Id: 2, Title:"Test"}]
             * @example defaultSelectedItems: [2]
             */
            autoComplete={"on"}
            disabled={info.ReadOnlyField}
            // keytipProps={{content: info.Description, keySequences: }}
        />
    </Stack>;
});

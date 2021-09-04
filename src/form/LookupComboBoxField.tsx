import * as React from 'react';
import { FunctionComponent, useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { PropertyFieldProps } from './PropertyField';
import { getById, ListItemBase, SharePointContext } from '@fusion5/controller-sharepoint-list';
import { Label, Stack } from '@fluentui/react';
// import { ComboBoxListItemPicker } from '@pnp/spfx-controls-react';
import { ComboBoxListItemPicker } from './SpfxControlsFix/ComboBoxListItemPicker';
import { classToPlain } from 'class-transformer';

interface Lookup {
    ID: number;
    Title: string;
}

export const  LookupComboBoxField: FunctionComponent<PropertyFieldProps> = observer(({ info, item, property }) => {
    const isMulti = info['AllowMultipleValues'] === true;
    let selectedItems: Array<Lookup> = undefined;

    if (undefined === item[property]) {
        selectedItems = [];
    } else if (isMulti) {
        const lookups = item[property].map(classToPlain);
        selectedItems = lookups;
    } else {
        selectedItems = [classToPlain( item[property] ) as Lookup];
    }

    const lookupTolistItemBase = (lookup: Lookup): ListItemBase => {
        const listItem = new ListItemBase().init();
        listItem.id = lookup.ID;
        listItem.title = lookup.Title;
        const lookUpListId = info['LookupList'];
        const controller = getById(lookUpListId);
        const controllerItem = controller.addGetPartial(listItem);
        return controllerItem;
    };

    const onSelectedItems = (items: Lookup[]) => {
        const lookUps = items.map(lookupTolistItemBase);
        if (isMulti) {
            item[property] = lookUps;
        } else {
            item[property] = items.length ? lookUps[0] : undefined;
        }
    };

    return <Stack>
        <Label>{info.Title}</Label>
        <ComboBoxListItemPicker
            listId={info['LookupList']}
            keyColumnInternalName='ID'
            columnInternalName='Title'
            webUrl={(item.controller.context as SharePointContext).pageContext.web.absoluteUrl}
            spHttpClient={(item.controller.context as SharePointContext).spHttpClient}
            multiSelect={info['AllowMultipleValues'] === true}
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

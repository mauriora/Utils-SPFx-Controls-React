import * as React from 'react';
import { FunctionComponent, useEffect, useState } from 'react';
import { ComboBox, IComboBoxOption } from '@fluentui/react'
import { IComboBoxListItemPickerProps } from '@pnp/spfx-controls-react'
import { ListItemRepository } from '@pnp/spfx-controls-react/lib/common/dal/ListItemRepository';

export const ComboBoxListItemPicker: FunctionComponent<IComboBoxListItemPickerProps & { selectedItems?: Record<string, string | number>[] }> =
    ({ columnInternalName, keyColumnInternalName,
        defaultSelectedItems,
        selectedItems,
        filter, itemLimit,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        keytipProps, noResultsFoundText, suggestionsHeaderText, onInitialized,
        listId,
        onSelectedItem,
        spHttpClient,
        webUrl,
        ...props
    }) => {

        /** Get SPService Factory */
        const [listItemRepo, setListItemRepo] = useState(new ListItemRepository(webUrl, spHttpClient));
        const [listItems, setListItems] = useState<Record<string,string>[]>(undefined);

        const [options, setOptions] = useState<Array<IComboBoxOption>>();
        const [defaultSelectedKey, setDefaultSelectedKey] = useState<(string | number)[] | null>();
        const [selectedKey, setSelectedKey] = useState<(string | number)[] | null>();

        const getSelectedKeys = (items: Record<string,string |number>[] | number[]): string[] | number[] | undefined => {
            const keyColumnName = keyColumnInternalName || "Id";
            let selectedItems: string[] | number[] | undefined = undefined;

            if (undefined !== items && undefined !== options) {
                //if passed only ids
                if (!isNaN(items[0] as number)) {
                    selectedItems = options.filter(opt => (items as number[]).includes(opt.key as number)).map(item => item.key) as (string[] | number[]);
                } else {
                    selectedItems = options.filter(
                        option => items.some( (item: Record<string,string |number> | number) => typeof item === 'object' && item[keyColumnName] === option.key ) 
                    ).map(item => item.key) as (string[] | number[]);
                    // selectedItems = options.filter(
                    //     opt => items.map(selected => selected[keyColumnName]).indexOf(opt.key) >= 0).map(item => item.key) as (string[] | number[]);
                }
            }
            return selectedItems;
        }

        const loadItems = async () => {
            if(undefined !== listItemRepo ) {
                const query = filter || "";
                //query += filter;
                const keyColumnName = keyColumnInternalName || "Id";
                const _listItems = await listItemRepo.getListItemsByFilterClause(
                    query,
                    listId,
                    columnInternalName,
                    keyColumnInternalName,
                    webUrl,
                    itemLimit || 100
                );

                const _options = _listItems.map(option =>
                    ({
                        key: option[keyColumnName],
                        text: option[columnInternalName || "Id"]
                    })
                );

                setOptions(_options);
                setListItems(_listItems);
            }
        };        
   
        const updateInternalSelection = React.useCallback( (option?: IComboBoxOption) => {
            let newSelectedKeys: (string | number)[];

            if (props.multiSelect) {
                if (option && option.selected) {
                    newSelectedKeys = [...selectedKey, option.key];
                } else {
                    newSelectedKeys = selectedKey.filter(o => o !== option.key);
                }
            } else {
                newSelectedKeys = [option.key];
            }
            setSelectedKey(newSelectedKeys);
            return newSelectedKeys;
        },[selectedKey]);

        const updateListItemSelection = (newSelectedKeys: (string | number)[]) => {
            const keyColumnName = keyColumnInternalName || "Id";
            const newListItemSelection = listItems.filter( item => newSelectedKeys.some( key => key === item[keyColumnName] ));

            onSelectedItem(newListItemSelection);
        };

        const onChange = (e: unknown, option?: IComboBoxOption) => {
            const newSelection = updateInternalSelection(option);
            updateListItemSelection(newSelection);
        };

        useEffect( () => { setListItemRepo( new ListItemRepository(webUrl, spHttpClient) ); }, [webUrl, spHttpClient] );
        useEffect( () => { loadItems() }, [listItemRepo]);
        useEffect( () => { setDefaultSelectedKey(getSelectedKeys(defaultSelectedItems)); }, [ options, defaultSelectedItems ]);
        useEffect( () => { setSelectedKey(getSelectedKeys(selectedItems)); }, [ options, selectedItems] );

        return <ComboBox
            options={options}
            allowFreeform={props.allowFreeform}
            autoComplete={props.autoComplete}
            // autofill={props.autofill}
            className={props.className}
            comboBoxOptionStyles={props.comboBoxOptionStyles}
            defaultSelectedKey={defaultSelectedKey as (string[] | number[])}
            selectedKey={selectedKey as (string[] | number[])}
            disabled={props.disabled}
            multiSelect={props.multiSelect}
            onMenuDismiss={props.onMenuDismiss}
            onMenuOpen={props.onMenuOpen}
            text={props.text}
            onChange={onChange}
        />;
    }
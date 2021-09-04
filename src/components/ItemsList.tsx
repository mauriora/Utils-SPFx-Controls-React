import { SelectionMode, Spinner } from '@fluentui/react';
import * as React from 'react';
import { FunctionComponent, useEffect, useState } from 'react';
import * as Controller from '@fusion5/controller-sharepoint-list';
import {
    FieldUrlRenderer,
    FieldTextRenderer,
    IViewField,
    ListView,
    FieldDateRenderer
} from '@pnp/spfx-controls-react';
import { observer } from 'mobx-react-lite';
import { ListItem } from '@fusion5/controller-sharepoint-list';

export interface ListTableProps {
    model: Controller.SharePointModel;
    onSelect: (items: ListItem[]) => void;
}


interface TextFieldRenderProps {
    item: Controller.ListItem;
    property: string;
}

const TextFieldRender = observer(({ item, property }: TextFieldRenderProps) => (<FieldTextRenderer text={item[property]} />));

const stripDeep = ({ controller, pnpItem, delete: fDelete, source, ...rest }: Controller.ListItemBase) => {
    for( const property in rest) {
        if( rest[property] && ('object' === typeof( rest[property] ))) {
            rest[property] = stripDeep( rest[property] )
        }
    }
    return rest;
};

export const ItemsList: FunctionComponent<ListTableProps> = observer(({ model, onSelect }) => {
    const [viewFields, setViewFields] = useState(new Array<IViewField>());
    const items = React.useMemo(() => {
        const strippedItems = model.records.map(stripDeep);
        return strippedItems;
    }, [...model.records, model.records]);
    
    const fillViewFields = () => {
        const newViewFields = new Array<IViewField>();
        model.propertyFields.forEach((fieldInfo, propertyName) => {
            const viewField: IViewField = {
                name: propertyName,
                displayName: fieldInfo.Title,
                isResizable: true,
            };
            switch (fieldInfo.TypeAsString) {
                case 'DateTime':
                    viewField.render = (item) => <FieldDateRenderer text={item[propertyName]} />;
                    break;
                case 'URL':
                    viewField.render = (item) => (<FieldUrlRenderer
                        url={item[propertyName + '.url']}
                        text={item[propertyName + '.description']}
                    />);
                    break;
                case 'MultiChoice':
                    viewField.render = (item) => {
                        const titleFieldRegEx = new RegExp('^' + propertyName + '\.([0-9]+)' + '$');
                        let resultString = '';
                        for (const flatPropertyName in item) {
                            if (titleFieldRegEx.test(flatPropertyName)) {
                                resultString += (resultString.length ? '; ' : '') + item[flatPropertyName];
                            }
                        }
                        return <FieldTextRenderer text={resultString} />;
                    };
                    break;
                case 'User':
                case 'Lookup':
                    viewField.render = (item) => (<FieldTextRenderer text={item[propertyName + '.title']} />);
                    break;
                case 'LookupMulti':
                    viewField.render = (item) => {
                        const titleFieldRegEx = new RegExp('^' + propertyName + '\.([0-9]+)\.' + 'title' + '$');
                        let resultString = '';
                        for (const flatPropertyName in item) {
                            if (titleFieldRegEx.test(flatPropertyName)) {
                                resultString += (resultString.length ? '; ' : '') + item[flatPropertyName];
                            }
                        }
                        return <FieldTextRenderer text={resultString} />;
                    };
                    break;
                case 'TaxonomyFieldType':
                    viewField.render = (item) => (<FieldTextRenderer text={item[propertyName + '.label']} />);
                    break;
                case 'Text':
                    viewField.render = (item, index, column) => <TextFieldRender item={item} property={column.fieldName} />;
                    break;
                default:
                    viewField.sorting = true;
                    break;
            }
            newViewFields.push(viewField);
        });
        setViewFields(newViewFields);
    };

    useEffect(fillViewFields, [model.controller.initialised]);

    if (model.controller.initialised) {
        return <ListView
            viewFields={viewFields}
            items={items}
            compact={false}
            selectionMode={SelectionMode.single}
            selection={onSelect}
            showFilter={true}
            filterPlaceHolder='Search ...'
        />;
    } else {
        return <Spinner />;
    }
});

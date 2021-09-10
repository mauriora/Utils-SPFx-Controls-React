import { Stack } from '@fluentui/react';
import { ListItem, SharePointModel, WritablePart } from '@mauriora/controller-sharepoint-list';
import { FieldTypes, IFieldInfo } from '@pnp/sp/fields';
import { observer } from 'mobx-react-lite';
import * as React from 'react';
import { FunctionComponent } from 'react';
import {
    AttachmentsField, BooleanField,
    ChoiceField, CounterField, CurrencyField,
    DateTimeField, LookupComboBoxField, LookupField, MultiChoiceField, NoteField, NumberField, RatingCountField, RatingField,
    TaxonmyField, TextField, UrlField,
    UserField, LikesCountField
} from '..';



export interface PropertyFieldProps<ItemType extends ListItem = ListItem> {
    info: IFieldInfo;
    model: SharePointModel<ItemType>;
    property: keyof WritablePart<ItemType>;
    item: ItemType;
}

export type PropertyFieldFC<ItemType extends ListItem = ListItem> = FunctionComponent<PropertyFieldProps<ItemType>>;

export const PropertyField: PropertyFieldFC = observer((props) => {
    switch (props.info.FieldTypeKind) {
        case FieldTypes.Invalid:
            switch (props.info.TypeAsString) {
                case 'AverageRating':
                    return <RatingField {...props} />;
                case 'RatingCount':
                    return <RatingCountField {...props} />;
                case 'Likes':
                    return <LikesCountField {...props} />;
                case 'TaxonomyFieldTypeMulti':
                case 'TaxonomyFieldType':
                    return <TaxonmyField {...props} />;
                default:
                    console.error(`PropertyField( ${props.info.TypeAsString}[${props.info.FieldTypeKind}] ${props.property} ) no renderer`, { props });
            }
            break;
        case FieldTypes.URL: return <UrlField {...props} />;
        case FieldTypes.Attachments: return <AttachmentsField {...props} />;
        case FieldTypes.Boolean: return <BooleanField {...props} />;
        case FieldTypes.DateTime: return <DateTimeField {...props} />;
        case FieldTypes.Currency: return <CurrencyField {...props} />;
        case FieldTypes.Number:
        case FieldTypes.Integer: return <NumberField {...props} />;
        case FieldTypes.Counter: return <CounterField {...props} />;
        case FieldTypes.Text: return <TextField {...props} />;
        case FieldTypes.ContentTypeId: return <TextField {...props} />;
        case FieldTypes.Note: return <NoteField {...props} />;
        case FieldTypes.Choice: return <ChoiceField {...props} />;
        case FieldTypes.MultiChoice: return <MultiChoiceField {...props} />;
        case FieldTypes.User: return <UserField {...props} />;
        case FieldTypes.Lookup: return <Stack><LookupComboBoxField {...props} /><LookupField {...props} /></Stack>;
        default:
            console.error(`PropertyField( ${props.info.TypeAsString}[${props.info.FieldTypeKind}] ${props.property} ) no renderer`, { props });
            break;
    }
});

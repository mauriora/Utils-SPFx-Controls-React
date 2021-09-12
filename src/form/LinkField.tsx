import * as React from 'react';
import { FunctionComponent, useCallback } from 'react';
import { observer } from 'mobx-react-lite';
import { Image, Label, Link, Stack, TextField } from '@fluentui/react';
import { getDisplayFormat, IFieldInfo, Link as LinkItem, ListItemBase } from '@mauriora/controller-sharepoint-list';
import { PropertyFieldFC } from './PropertyField';

/**
 * Displays the image of a URL - Picture field
 */
export const PictureField: FunctionComponent<{ item: ListItemBase, property: string }> = observer(({ item, property }) => {
    const link = item[property];
    if (link instanceof LinkItem) {
        return <Image
            src={link.url}
            alt={link.description}
        />;
    }
});

/**
 * Displays the Link of a URL - Hyperlink field
 */
export const LinkField: FunctionComponent<{ info: IFieldInfo, item: ListItemBase, property: string }> = observer(({ info, item, property }) =>{
    const link = item[property];
    if (link instanceof LinkItem) {
        return <Link
            href={link.url}
            placeholder={info.Description}
        >
            {(link.description ?? link.url)}
        </Link>
    }
});

const HTTPS = 'https://';

type KeysMatching<ClassOf, ValueTypeOf> = { [K in keyof ClassOf]-?: ClassOf[K] extends ValueTypeOf ? K : never }[keyof ClassOf];

/**
 * Displays a Url Field as Link or picture with edit fields with for link and description 
 * */
export const UrlField: PropertyFieldFC = observer(({ info, item, property }) => {
    const link = item[property];

    if( undefined !== link && null !== link && (! (link instanceof LinkItem))) throw new TypeError(`UrlField(${property}) is not undefined, null or a Link instance, it's of type ${typeof link}:${String(link)} constructor.name=${link?.constructor?.name}`);

    const onChange = useCallback(
        (linkProperty: 'url' | 'description', newValue: string) => {
            const linkItem = link ?? (newValue ? new LinkItem().init() : link);
            if (linkItem) {
                switch (linkProperty) {
                    case 'url': linkItem[linkProperty] = newValue && (!newValue.startsWith(HTTPS)) ? HTTPS + newValue : newValue;
                        break;
                    case 'description': linkItem[linkProperty] = newValue;
                    break;
                    default:
                        throw new Error(`UrlField[${property}]: '${linkProperty}' must be 'url' or 'description'`);
                }
            }

            if (!link && linkItem) {
                item[property] = linkItem;
            }
        },
        [link]
    );

    return <Stack>
        <Label>{info.Title}</Label>
        {1 === getDisplayFormat(info) ?
            <PictureField item={item} property={property} /> :
            <LinkField info={info} item={item} property={property} />
        }
        <TextField
            label={'link'}
            value={link && link.url && link.url.startsWith(HTTPS) ? link.url.substr(HTTPS.length) : link?.url}
            prefix={HTTPS}
            required={info.Required}
            readOnly={info.ReadOnlyField}
            placeholder={info.Description}
            onChange={(e, newValue) => onChange('url', newValue)}
        />
        <TextField
            label={'description'}
            value={link?.description}
            required={info.Required}
            readOnly={info.ReadOnlyField}
            placeholder={info.Description}
            onChange={(e, newValue) => onChange('description', newValue)}
        />
    </Stack>;
});


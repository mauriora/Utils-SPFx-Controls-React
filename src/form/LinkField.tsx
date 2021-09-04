import * as React from 'react';
import { FunctionComponent, useCallback, useMemo } from 'react';
import { observer } from 'mobx-react-lite';
import { Image, Label, Link, Stack, TextField } from '@fluentui/react';
import { IFieldInfo, Link as LinkItem, ListItemBase } from '@mauriora/controller-sharepoint-list';
import { PropertyFieldProps } from './PropertyField';

/**
 * Displays the image of a URL - Picture field
 */
export const PictureField: FunctionComponent<{ item: ListItemBase, property: string }> = observer(({ item, property }) =>
    item[property] &&
    <Image
        src={(item[property] as LinkItem).url}
        alt={(item[property] as LinkItem).description}
    />
);

/**
 * Displays the Link of a URL - Hyperlink field
 */
export const LinkField: FunctionComponent<{ info: IFieldInfo, item: ListItemBase, property: string }> = observer(({ info, item, property }) =>
    item[property] &&
    <Link
        href={(item[property] as LinkItem).url}
        placeholder={info.Description}
    >
        {((item[property] as LinkItem).description ?? (item[property] as LinkItem).url)}
    </Link>
);

const HTTPS = 'https://';

type KeysMatching<ClassOf, ValueTypeOf> = { [K in keyof ClassOf]-?: ClassOf[K] extends ValueTypeOf ? K : never }[keyof ClassOf];

/**
 * Displays a Url Field as Link or picture with edit fields with for link and description 
 * */
export const UrlField: FunctionComponent<PropertyFieldProps> = observer(({ info, item, property, model }) => {
    const link = useMemo(() => item[property] as LinkItem, [item[property]]);

    const onChange = useCallback(
        (linkProperty: KeysMatching<LinkItem, string>, newValue: string) => {
            const linkItem = link ?? (newValue ? new LinkItem().init() : link);
            if (linkItem) {
                switch (linkProperty) {
                    case 'url': linkItem[linkProperty] = newValue && (! newValue.startsWith(HTTPS)) ? HTTPS + newValue : newValue;
                        break;
                    default:
                        linkItem[linkProperty] = newValue;
                        break;
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
        {1 === info['DisplayFormat'] ?
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


import { Label, Stack, TextField } from "@fluentui/react";
import { RichText } from "@pnp/spfx-controls-react/lib/RichText";
import * as React from "react";
import { PropertyFieldFC } from './PropertyField';
import { observer } from 'mobx-react-lite';
import { isRichtText } from "@mauriora/controller-sharepoint-list";


export const  NoteField: PropertyFieldFC = observer(({ info, item, property }) => true === isRichtText( info ) ?
    <Stack>
        <Label>{info.Title}</Label>
        <RichText
            value={item[property] as string}
            isEditMode={!info.ReadOnlyField}
            placeholder={info.Description}
            onChange={(newValue) => item[property] = newValue}
        />
    </Stack>
    :
    <TextField
        label={info.Title}
        value={item[property] as string}
        required={info.Required}
        readOnly={info.ReadOnlyField}
        placeholder={info.Description}
        multiline autoAdjustHeight
        onChange={(e, newValue) => item[property] = newValue}
    />
);

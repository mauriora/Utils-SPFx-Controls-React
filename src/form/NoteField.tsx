import { Label, Stack, TextField } from "@fluentui/react";
import { RichText } from "@pnp/spfx-controls-react/lib/RichText";
import * as React from "react";
import { FunctionComponent } from "react";
import { PropertyFieldProps } from "./PropertyField";
import { observer } from 'mobx-react-lite';


export const  NoteField: FunctionComponent<PropertyFieldProps> = observer(({ info, item, property }) => true === info['RichText'] ?
    <Stack>
        <Label>{info.Title}</Label>
        <RichText
            value={item[property]}
            isEditMode={!info.ReadOnlyField}
            placeholder={info.Description}
            onChange={(newValue) => item[property] = newValue}
        />
    </Stack>
    :
    <TextField
        label={info.Title}
        value={item[property]}
        required={info.Required}
        readOnly={info.ReadOnlyField}
        placeholder={info.Description}
        multiline autoAdjustHeight
        onChange={(e, newValue) => item[property] = newValue}
    />
);

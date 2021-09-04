import * as React from "react";
import { FunctionComponent } from "react";
import { PropertyFieldProps } from "./PropertyField";
import { observer } from 'mobx-react-lite';
import { DatePicker } from "@fluentui/react";
import { DateTimePicker } from "@pnp/spfx-controls-react";


export const  DateTimeField: FunctionComponent<PropertyFieldProps> = observer(({ info, item, property }) => {
    if (null == info['TimeFormat']) {
        return <DatePicker
            label={info.Title}
            isRequired={info.Required}
            disabled={info.ReadOnlyField}
            placeholder={info.Description}
            value={item[property] ? new Date(item[property]) : undefined}
            onSelectDate={(newDate) => item[property] = newDate.toISOString()}
        />;
    } else {
        return <DateTimePicker
            label={info.Title}
            disabled={info.ReadOnlyField}
            placeholder={info.Description}
            value={item[property] ? new Date(item[property]) : undefined}
            onChange={(newDate) => item[property] = newDate.toISOString()} />;
    }
});

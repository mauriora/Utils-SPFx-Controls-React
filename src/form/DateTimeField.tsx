import * as React from "react";
import { PropertyFieldFC } from './PropertyField';
import { observer } from 'mobx-react-lite';
import { DatePicker } from "@fluentui/react";
import { DateTimePicker } from "@pnp/spfx-controls-react";
import { getTimeFormat } from "@mauriora/controller-sharepoint-list";


export const DateTimeField: PropertyFieldFC = observer(({ info, item, property }) => {
    const value = item[property];
    if (undefined !== value && null !== value && typeof value !== 'string') throw new Error(`Property '${property}' is not a string, undefined or null, but it's of type ${typeof value}: ${String(value)}`);

    if (null == getTimeFormat( info )) {
        return <DatePicker
            label={info.Title}
            isRequired={info.Required}
            disabled={info.ReadOnlyField}
            placeholder={info.Description}
            value={item[property] ? new Date(value) : undefined}
            onSelectDate={(newDate) => item[property] = newDate.toISOString()}
        />;
    } else {
        return <DateTimePicker
            label={info.Title}
            disabled={info.ReadOnlyField}
            placeholder={info.Description}
            value={item[property] ? new Date(value) : undefined}
            onChange={(newDate) => item[property] = newDate.toISOString()} />;
    }
});

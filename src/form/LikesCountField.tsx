import * as React from 'react';
import { FunctionComponent } from 'react';
import { observer } from 'mobx-react-lite';
import { ITextFieldStyles, TextField } from '@fluentui/react';
import { PropertyFieldProps } from './PropertyField';

export interface LikesCountFieldProps extends PropertyFieldProps {
    mini?: boolean;
}

const transparentFieldStyles: Partial<ITextFieldStyles> = { 
    fieldGroup: {
        background: 'transparent',
        border: 'none'
    }
};

export const LikesCountField: FunctionComponent<LikesCountFieldProps> = observer(({ info, item, property, mini }) =>{
    const value = item[property];
    if ( undefined !== value && null !== value && typeof value !== 'number') throw new Error(`Property '${property}' is not a number, null or undefined, but it's of type ${typeof value}:${String(value)}`);

    return <TextField
        iconProps={{
            iconName: item.isLikedByMe() ? 'LikeSolid' : 'Like',
            style: { pointerEvents: "auto", cursor: "pointer" },
            onClick: () => item.toggleLike()
        }}
        style={mini ? { minWidth: 40, width: 40 + ((Math.floor(Math.log10(item[property] ? Number(item[property]) : 1)) + 1) * 15) } : undefined}
        styles={mini ? transparentFieldStyles : undefined}
        label={mini ? undefined : info.Title}
        value={value as unknown as string}
        readOnly={true}
        placeholder={info.Description}
        title={info.Title}
    />
});


import * as React from 'react';
import { FunctionComponent, useCallback } from 'react';
import { observer } from 'mobx-react-lite';
import { ITextFieldStyles, mergeStyles, TextField } from '@fluentui/react';
import { PropertyFieldProps } from './PropertyField';

export interface LikesCountFieldProps extends PropertyFieldProps {
    mini?: boolean;
};

const transparentFieldStyles: Partial<ITextFieldStyles> = { 
    fieldGroup: {
        background: 'transparent',
        border: 'none'
    }
};

export const LikesCountField: FunctionComponent<LikesCountFieldProps> = observer(({ info, item, property, mini }) =>
    <TextField
        iconProps={{
            iconName: item.isLikedByMe() ? 'LikeSolid' : 'Like',
            style: { pointerEvents: "auto", cursor: "pointer" },
            onClick: () => item.toggleLike()
        }}
        style={mini ? { minWidth: 40, width: 40 + ((Math.floor(Math.log10(item[property] ? Number(item[property]) : 1)) + 1) * 15) } : undefined}
        styles={mini ? transparentFieldStyles : undefined}
        label={mini ? undefined : info.Title}
        value={item[property]}
        readOnly={true}
        placeholder={info.Description}
        title={info.Title}
    />
);


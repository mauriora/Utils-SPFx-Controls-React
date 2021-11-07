import * as React from 'react';
import { FunctionComponent, useMemo } from 'react';
import { observer } from 'mobx-react-lite';
import { IconButton, IIconProps, ITextFieldStyles, Stack, Text } from '@fluentui/react';
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

export const LikesCountField: FunctionComponent<LikesCountFieldProps> = observer(({ info, item, property, mini }) => {
    const value = item[property];

    if (undefined !== value && null !== value && typeof value !== 'number') throw new Error(`Property '${property}' is not a number, null or undefined, but it's of type ${typeof value}:${String(value)}`);

    const fieldWidthStyle = useMemo(() =>
        mini ?
            { minWidth: 40, width: 40 + ((Math.floor(Math.log10(item[property] ? Number(item[property]) : 1)) + 1) * 15) } :
            undefined,
        [value, mini]
    );

    const iconProps = useMemo<IIconProps>(
        () => ({
            iconName: item.isLikedByMe() ? 'HeartFill' : 'Heart',
            style: { pointerEvents: "auto", cursor: "pointer" },
            onClick: () => item.toggleLike()
        }),
        [item, item.isLikedByMe()]
    );

    return <Stack horizontal>
        <IconButton iconProps={iconProps} />
        <Text
            style={fieldWidthStyle}
            styles={mini ? transparentFieldStyles : undefined}
            title={info.Title}
        >
            {`${value ?? 0} Like${value === 1 ? '' : 's'}`}
        </Text>
    </Stack>
});


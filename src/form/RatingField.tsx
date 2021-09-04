import * as React from 'react';
import { FunctionComponent, useCallback, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { Rating, RatingSize, Spinner, Stack, Text } from '@fluentui/react';
import { PropertyFieldProps } from './PropertyField';

export const RatingField: FunctionComponent<PropertyFieldProps> = observer(({ info, item, property }) => {
    const [updating, setUpdating] = useState(false);
    const [mouseActive, setMouseActive] = useState(false);

    const onChange = async (e, rating?: number) => {
        if (updating) {
        } else {
            setUpdating(true);
            try {
                await item.setRating(rating);
            }
            finally {
                setUpdating(false);
            }
        }
    };

    return updating ?
        <Spinner /> :
        <Stack
            onMouseEnter={() => setMouseActive(true)}
            onMouseLeave={() => setMouseActive(false)}>
            {mouseActive ?
                <Rating
                    rating={item.myRating() ?? 0}
                    readOnly={info.ReadOnlyField}
                    placeholder={info.Description}
                    allowZeroStars={true}
                    max={info['MaximumValue']}
                    onChange={onChange}
                    size={RatingSize.Small}
                /> 
                :
                <Stack horizontal>
                    <Rating
                        rating={item[property] ?? 0}
                        readOnly={true}
                        placeholder={info.Description}
                        allowZeroStars={true}
                        max={info['MaximumValue']}
                        size={RatingSize.Small}
                    />
                    <Text style={{alignSelf: 'center', paddingLeft: 10}} >
                        {item.ratingCount}
                    </Text>
                </Stack>
            }
        </Stack>
});


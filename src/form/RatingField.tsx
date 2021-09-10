import * as React from 'react';
import { FunctionComponent, useCallback, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { Rating, RatingSize, Spinner, Stack, Text } from '@fluentui/react';
import { PropertyFieldFC } from './PropertyField';
import { getMaximumValue } from '@mauriora/controller-sharepoint-list';

export const RatingField: PropertyFieldFC = observer(({ info, item, property }) => {
    const [updating, setUpdating] = useState(false);
    const [mouseActive, setMouseActive] = useState(false);

    const onChange = async (e: any, rating?: number) => {
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
                    max={getMaximumValue( info )}
                    onChange={onChange}
                    size={RatingSize.Small}
                /> 
                :
                <Stack horizontal>
                    <Rating
                        rating={item[property] as number ?? 0}
                        readOnly={true}
                        placeholder={info.Description}
                        allowZeroStars={true}
                        max={getMaximumValue( info )}
                        size={RatingSize.Small}
                    />
                    <Text style={{alignSelf: 'center', paddingLeft: 10}} >
                        {item.ratingCount}
                    </Text>
                </Stack>
            }
        </Stack>
});


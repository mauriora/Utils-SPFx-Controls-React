import { IPersonaProps, Persona, PersonaSize } from "@fluentui/react";
import { observer } from "mobx-react-lite";
import * as React from "react";
import { FunctionComponent, useMemo } from "react";
import { UserLookup } from "@mauriora/controller-sharepoint-list";
import { UserInfoPartial } from "../tools/UserInfo";

export const getAvatarUrl = (siteUrl: string, userEmail: string, size: 'S' | 'M' | 'L' = 'L'): string =>
    `${siteUrl}/_layouts/15/userphoto.aspx?size=${size}&username=${userEmail}`;

export interface UserPersonaProps extends IPersonaProps {
    user: UserInfoPartial & { picture?: string; };
}

export const getUserAvatarUrl = (user: UserLookup, size: 'S' | 'M' | 'L' | PersonaSize): string => {
    const email = user?.claims?.split('|').pop();
    const letterSize: 'S' | 'M' | 'L' = 'number' === typeof (size) ?
        (undefined === size ?
            'L' :
            size <= PersonaSize.size48 ?
                'S' :
                size < PersonaSize.size72 ?
                    'M' :
                    'L')
        : size;

    return getAvatarUrl(
        user.controller.site.url,
        email,
        letterSize
    );
}

export const UserPersona: FunctionComponent<UserPersonaProps> = observer(
    ({ user, imageUrl, ...props }) => {
        const avatarUrl = useMemo(
            ///TODO: Should check if is User for picture
            () => imageUrl ?? user['picture'] ?? 
                getAvatarUrl(
                    user.siteUrl,
                    user.email,
                    undefined === props.size ?
                        'L' :
                        props.size <= PersonaSize.size48 ?
                            'S' :
                            props.size < PersonaSize.size72 ?
                                'M' :
                                'L'
                ),
            [user.email]
        );

        const secondaryTextDefault = user.jobTitle ?? user.email;

        return <Persona
            text={user.displayName}
            imageUrl={avatarUrl}
            imageAlt={user.displayName}
            showSecondaryText={!!secondaryTextDefault}
            secondaryText={secondaryTextDefault}
            tertiaryText={user.department}
            {...props}
        />;
    }
);

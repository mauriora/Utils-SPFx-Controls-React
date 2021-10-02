import {
    CommandBarButton,
    FontIcon,
    HoverCard, HoverCardType,
    IconButton,
    IHoverCardProps,
    IStackItemTokens, IStackTokens,
    Link,
    mergeStyles,
    PersonaSize,
    Spinner,
    Stack,
    StackItem,
    Text
} from "@fluentui/react";
import * as React from "react";
import { FunctionComponent, useCallback, useEffect, useState } from "react";
import { UserPersona } from "./UserPersona";
import { sp } from "@pnp/sp";
import "@pnp/sp/profiles";
import { NeutralColors } from '@fluentui/theme';
import { copyTextToClipboard } from "../tools/Clipboard";
import { UserInfoFull } from '../tools/UserInfo';
import { getUser, User } from "@mauriora/controller-sharePoint-list";
import { useAsyncError } from '../hooks/AsyncError'
export interface PersonaHoverCardProps extends IHoverCardProps {
    user: UserInfoFull;
    sendEmailButtonText?: string;
}

const headerStackTokens: IStackTokens = {
    childrenGap: 'l1',
    padding: 'l1',
};

const expandedStackTokens: IStackTokens = {
    childrenGap: 0,
    padding: 0,
};

const detailItemToken: IStackItemTokens = {
}

const detailStackTokens: IStackTokens = {
    childrenGap: 'm',

}

const iconClass = mergeStyles({
    fontSize: 16,
    padding: "0px 8px"
    // margin: '0 25px',
});

const sectionHeaderClass = mergeStyles({
    fontSize: 14,
    fontWeight: 600
});

const UserProperty: FunctionComponent<{ iconName: string, value: string, hrefPrefix?: string }> = ({ iconName, value, hrefPrefix }) => {
    const [hover, setHover] = useState(false);
    const [clipboardState, setClipboardState] = useState<'idle' | 'copying' | 'failed' | 'successful'>('idle');
    const copyValueToClipboard = useCallback(
        async () => {
            setClipboardState('copying');
            setClipboardState(
                await copyTextToClipboard(value) ? 'successful' : 'failed'
            );
            setTimeout(() => setClipboardState('idle'), 3000);
        },
        [value]
    );

    return <StackItem
        align="stretch"
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        tokens={detailItemToken}
    >
        <Stack
            horizontal
            verticalAlign="center"
            tokens={detailStackTokens}
            styles={hover ? { root: { backgroundColor: NeutralColors.gray30, paddingLeft: 20 } } : { root: { paddingLeft: 20 } }}
        >
            <StackItem>
                {hrefPrefix ?
                    <IconButton
                        iconProps={{ iconName }}
                        href={`${hrefPrefix}:${value}`}
                    /> :
                    <FontIcon
                        iconName={iconName}
                        className={iconClass}
                    />
                }
            </StackItem>
            <StackItem grow={1}>
                {hrefPrefix ?
                    <Link href={`${hrefPrefix}:${value}`}>{value}</Link> :
                    <Text>{value}</Text>
                }
            </StackItem>
            <StackItem align="end">
                <IconButton
                    iconProps={{
                        iconName: 'idle' === clipboardState ? 'Copy' :
                            'copying' === clipboardState ? 'HourGlass' :
                                'successful' === clipboardState ? 'CheckMark' :
                                    'ErrorBadge'
                    }}
                    title={'idle' === clipboardState ? 'Copy' :
                        'copying' === clipboardState ? 'copying to clipboard' :
                            'successful' === clipboardState ? 'copied' :
                                'problem copying to clipboard'
                    }
                    styles={hover ? undefined : { root: { visibility: 'hidden' } }}
                    onClick={copyValueToClipboard}
                />
            </StackItem>
        </Stack>
    </StackItem>;
};

const ExpandedCard: FunctionComponent<{ userClaims: string, userEmail: string }> = ({ userClaims, userEmail }) => {
    const [profile, setProfile] = useState<{ userProperties: Record<string, string> }>();
    const [graphProfile, setGraphProfile] = useState<User>();
    const throwAsync = useAsyncError();

    const loadProfile = useCallback(
        async () => {
            try {
                const newProfile = await sp.profiles.getPropertiesFor(userClaims);

                if (!newProfile?.UserProfileProperties) {
                    console.error(`PersonaHoverCard.ExpandedCard: Can't get profile for userClaims=${userClaims}`, { newProfile, userClaims });
                } else {
                    // Properties are stored in inconvenient Key/Value pairs,
                    // so parse into an object called userProperties
                    newProfile.userProperties = (newProfile.UserProfileProperties as Array<{ Key: string, Value: unknown }>).reduce((res: Record<string, unknown>, prop) => {
                        res[prop.Key] = prop.Value;
                        return res;
                    }, {});

                    setProfile(newProfile);
                }
            } catch (getProfileError) {
                console.error(`PersonaHoverCard.ExpandedCard.loadProfile: can't get Properties for ${userClaims}`, {getProfileError});
                throwAsync(getProfileError);
            }
        },
        [userClaims]
    );

    const loadGraphUser = useCallback(
        async () => {
            try {
                const graphProfile = await getUser(userEmail);

                if (graphProfile) {
                    setGraphProfile(graphProfile);
                } else {
                    console.error(`PersonaHoverCard.ExpandedCard.loadGraphUser: can't get graph profile for ${userEmail}`);
                }
            } catch (getGraphError) {
                console.error(`PersonaHoverCard.ExpandedCard.loadGraphUser: can't get graph profile for ${userEmail}`, {getGraphError});
            }
        },
        [userEmail]
    );

    useEffect(() => { loadProfile(); }, [userClaims]);
    useEffect(() => { loadGraphUser(); }, [userEmail]);



    return undefined === profile ?
        <Spinner /> :
        <Stack tokens={expandedStackTokens}>
            <StackItem tokens={{ padding: 20 }}>
                <Text className={sectionHeaderClass}>
                    Contact
                </Text>
            </StackItem>
            {profile.userProperties.WorkEmail &&
                <UserProperty iconName="Mail" value={profile.userProperties.WorkEmail} hrefPrefix="mailto" />
            }
            {profile.userProperties.WorkPhone &&
                <UserProperty iconName="Phone" value={profile.userProperties.WorkPhone} hrefPrefix="tel" />
            }
            {profile.userProperties.CellPhone &&
                <UserProperty iconName="CellPhone" value={profile.userProperties.CellPhone} hrefPrefix="tel" />
            }
            {graphProfile?.mobilePhone &&
                <UserProperty iconName="CellPhone" value={graphProfile?.mobilePhone} hrefPrefix="tel" />
            }
            {profile.userProperties.Office &&
                <UserProperty iconName="POI" value={profile.userProperties.Office} />
            }
        </Stack>
        ;
}

export const PersonaHoverCard: FunctionComponent<PersonaHoverCardProps> = ({ user, sendEmailButtonText, ...props }) => {
    const renderCompact = useCallback(
        () => {
            return <Stack tokens={headerStackTokens}>
                <StackItem>
                    <UserPersona
                        user={user}
                        size={PersonaSize.size72}
                    />
                </StackItem>
                <StackItem>
                    <Stack horizontal>
                        <StackItem>
                            <CommandBarButton
                                styles={{ root: { height: 32 } }}
                                iconProps={{ iconName: 'Mail' }}
                                href={`mailto:${user.email}`}
                                text={sendEmailButtonText}
                                title={`Send an email to ${user.displayName}`}
                            />
                            <IconButton
                                iconProps={{ iconName: 'Chat' }}
                                href={`sip:${user.email}`}
                                title={`Start a chat with ${user.email}`}
                            />
                        </StackItem>
                    </Stack>
                </StackItem>
            </Stack>;
        },
        [user]
    );

    const renderExpanded = useCallback(
        () => <ExpandedCard userClaims={user.claims} userEmail={user.email} />,
        [user]
    );

    return <HoverCard
        type={HoverCardType.expanding}
        expandingCardProps={{
            onRenderCompactCard: renderCompact,
            onRenderExpandedCard: renderExpanded,
            expandedCardHeight: 197,
            gapSpace: 0
        }}
        {...props}
    />
}

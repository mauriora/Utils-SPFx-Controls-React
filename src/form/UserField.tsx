import { IPersonaProps } from "@fluentui/react";
import * as React from "react";
import { PropertyFieldFC } from './PropertyField';
import { observer } from 'mobx-react-lite';
import { personaProps2User, UserLookup, UserFull, allowsMultipleValues } from "@mauriora/controller-sharepoint-list";
import { PeoplePicker, PrincipalType } from "@pnp/spfx-controls-react/lib/PeoplePicker";


const userToSelectionUser = (user: Partial<UserFull>) => user.userName ?
    user.userName :
    user.email ?
        user.email :
        user.imnName ?
            user.imnName :
            user.claims.split('|').pop();

export const UserField: PropertyFieldFC = observer(({ info, item, property }) => {
    const isMulti = allowsMultipleValues(info);

    const selectedUsers = item[property] === undefined ?
        new Array<string>() :
        isMulti ?
            (item[property] as Array<Partial<UserFull>>).map(userToSelectionUser) :
            [userToSelectionUser(item[property] as Partial<UserFull>)];

    const onChange = async (items: IPersonaProps[]) => {
        if (isMulti) {
            const users = item[property];

            if (!Array.isArray(users)) throw new TypeError(`UserField([${item.id}].${property}).onChange allows multiple values and is not an array`);

            for (const persona of items) {
                const user = await personaProps2User(persona as any, info);

                if (! users.includes(user)) {
                    users.push( user );
                }
            }
        } else {
            const user = items.length ? await personaProps2User(items[0] as any, info) : undefined;
            (item[property] as unknown) = user;
        }
    };

    return <PeoplePicker
        context={item.controller.context}
        ensureUser={true}
        titleText={info.Title}
        showtooltip={true}
        disabled={info.ReadOnlyField}
        onChange={onChange as any}
        principalTypes={[PrincipalType.User, PrincipalType.SharePointGroup, PrincipalType.SecurityGroup, PrincipalType.DistributionList]}
        resolveDelay={500}
        defaultSelectedUsers={selectedUsers}
        required={info.Required}
        placeholder={info.Description}
        personSelectionLimit={isMulti ? 10 : 1}
    />;
});

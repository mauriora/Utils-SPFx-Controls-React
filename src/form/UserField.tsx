import { IPersonaProps } from "@fluentui/react";
import * as React from "react";
import { FunctionComponent } from "react";
import { PropertyFieldProps } from "./PropertyField";
import { observer } from 'mobx-react-lite';
import { personaProps2User, UserLookup, UserFull } from "@fusion5/controller-sharepoint-list";
import { PeoplePicker, PrincipalType } from "@pnp/spfx-controls-react/lib/PeoplePicker";


const userToSelectionUser = (user: Partial<UserFull>) => user.userName ?
    user.userName : 
    user.email ? 
        user.email :
        user.imnName ? 
            user.imnName : 
            user.claims.split('|').pop();

export const  UserField: FunctionComponent<PropertyFieldProps> = observer(({ info, item, property }) => {
    const isMulti = info['AllowMultipleValues'] === true;

    const selectedUsers = item[property] === undefined ?
        new Array<string>() :
        isMulti ?
            (item[property] as Array<Partial<UserFull>>).map(userToSelectionUser) :
            [userToSelectionUser(item[property] as Partial<UserFull>)];

    const onChange = async (items: IPersonaProps[]) => {
        if (isMulti) {
            const users = new Array<UserLookup>();
            for (const persona of items) {
                users.push(
                    await personaProps2User(persona as any, info)
                );
            }
            item[property] = users;
        } else {
            const user = items.length ? await personaProps2User(items[0] as any, info) : undefined;
            item[property] = user;
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

import { getSiteSync, UserLookup } from '@mauriora/controller-sharepoint-list';
import { ICommentAuthorData } from "@pnp/sp/comments";

export interface UserInfoPartial {
    claims?: string;
    email?: string;
    displayName: string;
    jobTitle: string;
    department: string;
    siteUrl?: string;
}

export interface UserInfoFull {
    claims?: string;
    email: string;
    displayName: string;
    jobTitle: string;
    department: string;
    siteUrl: string;
}

export const fromCommentAuthor = (source: ICommentAuthorData): UserInfoFull => init({
    department: "",
    jobTitle: source.jobTitle,
    displayName: source.name,
    email: source.email,
    claims: source.loginName
});

export const fromUserLookup = (source: UserLookup): UserInfoFull => init({
    department: source.department,
    jobTitle: source.jobTitle,
    displayName: source.title,
    claims: source.claims,
    siteUrl: source.controller.site.url
});

export const init = (info: UserInfoPartial): UserInfoFull => {
    if (!info.email) {
        if (info.claims) {
            info.email = info.claims.split('|').pop();
            // console.log(`UserInfo.init() set email= ${info.email} from claims= ${info.claims}`, info);
        } else {
            throw new Error('Init UserInfo, require email or claims');
        }
    }
    if (!info.siteUrl) {
        info.siteUrl = getSiteSync('').url;
        // console.log(`UserInfo.init() set siteUrl= ${info.siteUrl}`, info);
    }
    return info as UserInfoFull;
}
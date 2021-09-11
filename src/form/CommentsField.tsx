import * as React from 'react';
import { FunctionComponent, useCallback, useEffect, useMemo, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { ActivityItem, HoverCard, HoverCardType, IconButton, IStackTokens, Link, mergeStyleSets, PersonaSize, Spinner, Stack, StackItem, Text, TextField } from '@fluentui/react';
import { PropertyFieldProps } from './PropertyField';
import { ListItem } from '@mauriora/controller-sharepoint-list';
import { ICommentInfo } from '@pnp/sp/comments';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { useAsyncError } from '../hooks/AsyncError';
import { UserPersona } from '../components/UserPersona';
import { PersonaHoverCard } from '../components/PersonaHoverCard';
import { fromCommentAuthor } from '../tools/UserInfo';

interface NewCommentFieldProps {
    item: ListItem;
    newCommentPlaceholder: string;
    onNewComment: (comments: ICommentInfo) => void;
}

const NewCommentField: FunctionComponent<NewCommentFieldProps> = ({ item, newCommentPlaceholder, onNewComment }) => {
    const [updating, setUpdating] = useState(false);

    const [newComment, setNewComment] = useState('');
    const throwAsyncError = useAsyncError();

    const onChange = useCallback((e, newText?: string) => {
        setNewComment(newText)
    }, [item]);

    const addComment = useCallback(
        async () => {
            setUpdating(true);

            try {
                const pnpComment = await item.pnpItem.comments.add(newComment);
                onNewComment(pnpComment);
            } catch (addError) {
                throwAsyncError(addError);
            } finally {
                setNewComment('');
                setUpdating(false);
            }
        },
        [item, newComment]
    );

    return updating ?
        <Spinner /> :
        <TextField
            autoAdjustHeight
            multiline
            placeholder={newCommentPlaceholder}
            onChange={onChange}
            value={newComment}
            onKeyDown={e => (('Enter' === e.key) && (!(e.shiftKey || e.ctrlKey || e.altKey))) && addComment()}
        />
        ;
}


const classNames = mergeStyleSets({
    activityRoot: {
        marginTop: '10px',
    },
    nameText: {
        fontWeight: 'bold',
    },
    plainCard: {
        width: 200,
        height: 200,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    item: {
        selectors: {
            '&:hover': {
                textDecoration: 'underline',
                cursor: 'pointer',
            },
        },
    }
});

const isNotToday = (someDate: Date) => {
    const today = new Date();
    return someDate.getDate() != today.getDate() ||
        someDate.getMonth() != today.getMonth() ||
        someDate.getFullYear() != today.getFullYear();
}

const Comment: FunctionComponent<{ comment: ICommentInfo, commentedText: string, siteUrl: string }> = ({ comment, commentedText }) => {
    const dateObject = useMemo(() => new Date(comment.createdDate), [comment]);
    const isNotFromToday = useMemo(() => isNotToday(dateObject), [dateObject]);
    const timeString = useMemo(() => dateObject.toLocaleTimeString(), [dateObject]);
    const dateString = useMemo(() => isNotFromToday ? dateObject.toLocaleDateString() : undefined, [dateObject]);

    return <ActivityItem
        activityDescription={
            <PersonaHoverCard
                user={fromCommentAuthor(comment.author)}
            >
                <Link className={classNames.nameText} >
                    {comment.author.name}
                </Link>
                <Text>&nbsp;</Text>
                <Text>{commentedText}</Text>
            </PersonaHoverCard>
        }
        comments={comment.text}
        timeStamp={(isNotFromToday ? dateString + ' ' : '') + timeString}
        className={classNames.activityRoot}
        activityIcon={
            <PersonaHoverCard
                user={fromCommentAuthor(comment.author)}
            >
                <UserPersona
                    user={fromCommentAuthor(comment.author)}
                    size={PersonaSize.size24}
                    hidePersonaDetails={true}
                />
            </PersonaHoverCard>
        }
    />
};

export interface CommentsFieldProps<T extends ListItem> extends PropertyFieldProps<T> {
    newCommentPlaceholder?: string;
    commentedText: string;
}

export type CommentsFieldFC<ItemType extends ListItem = ListItem> = FunctionComponent<CommentsFieldProps<ItemType>>;


const commentStackTokens: IStackTokens = {
    childrenGap: 's1',
    padding: 's1',
};

export const CommentsField: CommentsFieldFC = observer(({ item, newCommentPlaceholder, commentedText }) => {
    const [updating, setUpdating] = useState(true);
    const [comments, setComments] = useState(new Array<ICommentInfo>());

    const loadComments = useCallback(
        () => {
            item.pnpItem.comments.get()
                .then(newComments => {
                    setComments(newComments);
                    setUpdating(false);
                });
        },
        [item]
    );

    const addComment = useCallback(
        (comment: ICommentInfo) => setComments( [comment, ...comments] ),
        [comments]
    );

    const renderComments = useCallback(
        () =>
            <Stack tokens={commentStackTokens}>
                <StackItem>
                    <ErrorBoundary>
                        <NewCommentField
                            item={item}
                            newCommentPlaceholder={newCommentPlaceholder}
                            onNewComment={addComment}
                        />
                    </ErrorBoundary>
                </StackItem>
                {comments.map(comment =>
                    <StackItem key={`comment-${comment.id}-stack-item`}>
                        <Comment siteUrl={item.controller.site.url} comment={comment} commentedText={commentedText} />
                    </StackItem>
                )}
            </Stack>,
        [item, comments, comments.length]
    );

    useEffect(loadComments, [loadComments]);

    return updating ?
        <Spinner /> :
        <HoverCard
            type={HoverCardType.plain}
            instantOpenOnClick={true}
            plainCardProps={{ onRenderPlainCard: renderComments }}
            
        >
            <IconButton iconProps={{ iconName: 'Comment' }} />
        </HoverCard>;
});

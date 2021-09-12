import { Spinner } from "@fluentui/react";
import * as React from "react";
import { FunctionComponent, useState } from "react";
import { PropertyFieldFC } from './PropertyField';
import { observer } from 'mobx-react-lite';
import { ListItemAttachments, IListItemAttachmentsProps, IListItemAttachmentsState } from "@pnp/spfx-controls-react";
import { DragDropFiles } from "@pnp/spfx-controls-react/lib/DragDropFiles";
import { ErrorBoundary } from "../components/ErrorBoundary";
import { IFieldInfo, ListItemBase } from "@mauriora/controller-sharepoint-list";
import { useAsyncError } from "..";
import { WebPartContext } from "@microsoft/sp-webpart-base";
import { ExtensionContext } from "@microsoft/sp-extension-base";

interface FileInfo {
    fullPath: string;
    lastModified: number;
    lastModifiedDate: Date;
    /** filename with extension
     * @example "my image.png" */
    name: string;
    size: number;
    /** @example "image/png" */
    type: string;
    webkitRelativePath: string;
}

const toBase64 = (file: Blob) => new Promise<ArrayBuffer>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as ArrayBuffer);
    reader.onerror = error => reject(error);
    reader.readAsArrayBuffer(file);
});

class ListItemAttachmentsWithUpdate extends ListItemAttachments {
    componentDidUpdate(prevProps: IListItemAttachmentsProps, prevState: IListItemAttachmentsState, snapshot?: unknown) {
        console.log(`ListItemAttachmentsWithUpdate.componentDidUpdate: ${prevProps.itemId} => ${this.props.itemId}`, { props: this.props, prevProps, prevState, snapshot });
        if(super.componentDidUpdate) {
            console.error(`ListItemAttachmentsWithUpdate.componentDidUpdate: ${prevProps.itemId} => ${this.props.itemId} super has super.componentDidUpdate, remove this implementation`, { props: this.props, prevProps, prevState, snapshot });
            super.componentDidUpdate(prevProps, prevState, snapshot);
        } else if (this.props.itemId !== prevProps.itemId) {
            if(this.props.itemId !== this.state.itemId) {
                console.log(`ListItemAttachmentsWithUpdate.componentDidUpdate: ${prevProps.itemId} => ${this.props.itemId} reset state and call componentDidMount`, { props: this.props, prevProps, prevState, snapshot });
                this.state = {
                    file: null,
                    hideDialog: true,
                    dialogMessage: '',
                    attachments: [],
                    deleteAttachment: false,
                    disableButton: false,
                    showPlaceHolder: false,
                    fireUpload: false,
                    filesToUpload: [],
                    itemId: this.props.itemId
                  };              
            }
            this.componentDidMount();
        }
    }
}

interface AttachmentControlProps {
    info: IFieldInfo,
    item: ListItemBase;
    listId: string;
    context: WebPartContext | ExtensionContext;
}
const AttachmentControl: FunctionComponent<AttachmentControlProps> = observer(({ info, item, listId, context }) => {
    const [uploading, setUploading] = useState(false);
    const throwError = useAsyncError();

    const addAttachment = async (fileInfo: FileInfo) => {
        if (item.pnpItem) {
            setUploading(true);
            const content: ArrayBuffer = await toBase64(fileInfo as unknown as Blob);
            try {
                await item.pnpItem.attachmentFiles.add(
                    fileInfo.name,
                    content
                );
            } catch (uploadError) {
                throwError(uploadError);
            } finally {
                setUploading(false);
            }
        } else {
            throw new Error(`AttachmentsField[${item.id}].addAttachment no pnpItem`);
        }
    };

    const onDrop = (files: FileInfo[]) => {
        for (const fileInfo of files) {
            addAttachment(fileInfo);
        }
    };

    return uploading ?
        <Spinner />
        :
        <DragDropFiles
            dropEffect="copy"
            enable={true}
            onDrop={onDrop}
            iconName="Upload"
            labelMessage={info.Title}
        >
            <ListItemAttachmentsWithUpdate
                listId={listId}
                itemId={item.id}
                context={context}
                disabled={false}
            />
        </DragDropFiles>;
});

export const AttachmentsField: PropertyFieldFC = observer(({ info, item, model }) => 
    <ErrorBoundary>
        {item?.id ?
            <AttachmentControl
                context={item.controller.context}
                listId={model.controller.listId}
                info={info}
                item={item}
            />
            :
            null
        }
    </ErrorBoundary>
);

import * as React from 'react';
import { FunctionComponent } from "react";
import { MessageBar, MessageBarType } from '@fluentui/react'

export interface ErrorBarProps {
    message: string;
    onDismiss: () => void;
}

export const ErrorBar: FunctionComponent<ErrorBarProps> = ({message, onDismiss}) => (
    <MessageBar
      messageBarType={MessageBarType.error}
      isMultiline={true}
      onDismiss={onDismiss}
      dismissButtonAriaLabel="Close"
    >
      {message}
    </MessageBar>
  );

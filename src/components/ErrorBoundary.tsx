import * as React from "react";
import { GetDerivedStateFromError, GetDerivedStateFromProps } from "react";
import { ErrorBar } from '../components/MessageBar';

interface ErrorBoundaryState {
    error: undefined | unknown;
    info: undefined | ErrorInfo;
    ignoredExceptions: Array<string>;
}

interface ODataError {
    'odata.error': {
        code: string,
        message: {
            lang: string,
            value: string
        }
    }
}

interface ErrorInfo {
    title: string;
    description?: string;
    code?: number;
}

interface ErrorVariants {
    message?: string;
    status?: number;

}

export interface ErrorBoundaryProps {
    ignoredExceptions?: Array<string>;
    children?: React.ReactNode;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
    private static defaultIgnoredExceptions = ['Cannot access https://webshell.suite.office.com', 'Failed to retrieve a valid token']

    constructor(props: ErrorBoundaryProps) {
        super(props);
        const ignoredExceptions = ErrorBoundary.defaultIgnoredExceptions;

        if(props.ignoredExceptions && props.ignoredExceptions.length) {
            ignoredExceptions.push( ... props.ignoredExceptions );
        }
        this.state = { error: undefined, info: undefined, ignoredExceptions };

        console.log(`ErrorBoundary()`, {ignoredExceptions, props: this.props, state: this.state, defaultIgnoredExceptions: ErrorBoundary.defaultIgnoredExceptions});
    }

    private promiseRejectionHandler = (event: PromiseRejectionEvent) => {

        if (this.state.ignoredExceptions.includes( event?.reason?.message )) {
            console.error(`ErrorBoundary.promiseRejectionHandler(): ignore: '${event.reason.message}'`, {event, reason: event.reason, state: this.state});
        } else {
            console.error(`ErrorBoundary.promiseRejectionHandler( ${event?.reason?.message} )`, { event });
            this.setState({
                error: event.reason ?? event.type,
                info: { title: event.reason?.message ?? event.type }
            });
        }
    }

    static parseError = (error: ErrorVariants): ErrorInfo => {
        const info: ErrorInfo = { title: String(error.message ?? error) };

        if ('string' === typeof (error.message) && (error.message.search(/\{.*\}/)) >= 0) {

            try {
                const odataError: ODataError = JSON.parse(error.message.substring(error.message.indexOf('{')));

                info.title = odataError["odata.error"].message.value;
                info.description = error.message.substring(0, error.message.indexOf('{')).trim();
            } catch (parseError) {
                console.error(`ErrorBoundary.parseError caught error parsing json`, { parseError, error })
            }
        }
        if ('number' === typeof (error.status)) {
            info.code = error.status;
        }
        return info;
    }

    /** Return new state so the next render will show the fallback UI.  */
    static getDerivedStateFromError: GetDerivedStateFromError<ErrorBoundaryProps, ErrorBoundaryState> = (error: ErrorVariants) => ({ error, info: ErrorBoundary.parseError(error) });

    componentDidCatch(error: unknown, errorInfo: unknown): void {
        // You can also log the error to an error reporting service
        console.error(`ErrorBoundary.componentDidCatch`, { error, errorInfo });
    }

    componentDidMount(): void {
        window.addEventListener('unhandledrejection', this.promiseRejectionHandler)
    }

    componentWillUnmount(): void {
        window.removeEventListener('unhandledrejection', this.promiseRejectionHandler);
    }

    static getDerivedStateFromProps: GetDerivedStateFromProps<ErrorBoundaryProps, ErrorBoundaryState> = (nextProps, prevState) => {
        const prevCustomIgnored = prevState.ignoredExceptions.slice(ErrorBoundary.defaultIgnoredExceptions.length);
        const changed = prevCustomIgnored.some( (prevIgnored, index) => prevIgnored !== nextProps.ignoredExceptions?.[index] );

        if(changed) {
            const ignoredExceptions = ErrorBoundary.defaultIgnoredExceptions;

            if(nextProps.ignoredExceptions && nextProps.ignoredExceptions.length) {
                ignoredExceptions.push( ... nextProps.ignoredExceptions );
            }
            console.log(`ErrorBoundary.getDerivedStateFromProps changed`, {nextProps, prevState, prevCustomIgnored, ignoredExceptions });
    
            return { ignoredExceptions };
        }
        console.log(`ErrorBoundary.getDerivedStateFromProps not changed`, {nextProps, prevState, prevCustomIgnored });

        return null;
    }

    render(): React.ReactNode {
        console.log(`ErrorBoundary.render()`, {state: this.state, props: this.props, me: this});

        if (this.state.error) {
            return <ErrorBar
                message={`${String(this.state.info.title ?? this.state.error + (this.state.info.description ? ': ' + this.state.info.description : ''))}`}
                onDismiss={() => this.setState({ error: undefined, info: undefined })}
            />;
        }
        return this.props.children;
    }
}

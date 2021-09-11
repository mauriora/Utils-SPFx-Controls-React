import * as React from "react";
import { ErrorBar } from '..'

interface ErrorBoundaryState {
    error: undefined | unknown;
    info: undefined | ErrorInfo;
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

export class ErrorBoundary extends React.Component<unknown, ErrorBoundaryState> {
    constructor(props: unknown) {
        super(props);
        this.state = { error: undefined, info: undefined };
    }

    private promiseRejectionHandler = (event: PromiseRejectionEvent) => {
        console.error(`ErrorBoundary.promiseRejectionHandler`, { event });

        if ('Cannot access https://webshell.suite.office.com' === event?.reason?.message) {
            console.error(event.reason.message, {event, reason: event.reason});
        } else {
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
    static getDerivedStateFromError = (error: ErrorVariants): ErrorBoundaryState => ({ error, info: ErrorBoundary.parseError(error) });

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

    render(): React.ReactNode {
        if (this.state.error) {
            return <ErrorBar
                message={`${String(this.state.info.title ?? this.state.error + (this.state.info.description ? ': ' + this.state.info.description : ''))}`}
                onDismiss={() => this.setState({ error: undefined, info: undefined })}
            />;
        }
        return this.props.children;
    }
}
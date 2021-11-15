import { useCallback, useState } from "react";

.

Example:

```typescript
    import { useAsyncError } from '@mauriora/utils-spfx-controls-react';

    const ItemForm: FunctionComponent<...> = ({ model, item }) => {

        const throwError = useAsyncError();

        const submitItem = useCallback(
            async () => {
                try {
                    await model.submit(item);
                } catch (submitError) {
                    throwError(submitError);
                }
            },
            [model, item]
        );
        ...
    }

```

/**
 * catch an error in an async operation and rethrow it in the main loop.
 * @example 
 * const ItemForm: FunctionComponent<...> = ({ model, item }) => {

        const throwError = useAsyncError();

        const submitItem = useCallback(
            async () => {
                try {
                    await model.submit(item);
                } catch (submitError) {
                    throwError(submitError);
                }
            },
            [model, item]
        );
        ...
    }
 * 
 */
export const useAsyncError = (): (e: unknown) => void => {
    const [, setError] = useState();

    return useCallback(
        e => {
            setError(() => { throw e; });
        },
        [setError],
    );
};


import { useCallback, useState } from "react";

export const useAsyncError = (): (e: unknown) => void => {
    const [, setError] = useState();

    return useCallback(
        e => {
            setError(() => { throw e; });
        },
        [setError],
    );
};


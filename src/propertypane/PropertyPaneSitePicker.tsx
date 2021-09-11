import { ISitePickerProps, SitePicker, ISite } from "@pnp/spfx-controls-react/lib/SitePicker";
import { CustomPropertyPaneField, PropertyChangeCallback } from "./CustomPropertyPaneField";
export { ISite } from "@pnp/spfx-controls-react/lib/SitePicker";
export { CustomPropertyPaneField } from "./CustomPropertyPaneField";

export type ChangeCallBack = (targetProperty: string, selectedSites: ISite[] ) => void;

export const createPropertyPaneSitePicker =
    (onChange: ChangeCallBack, targetProperty: string, props: Omit<ISitePickerProps, 'onChange'>): CustomPropertyPaneField<ISitePickerProps> =>
    new CustomPropertyPaneField(onChange as PropertyChangeCallback, targetProperty, props, SitePicker);

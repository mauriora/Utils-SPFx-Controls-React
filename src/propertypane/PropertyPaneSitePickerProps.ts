import { ISite, ISitePickerProps } from "@pnp/spfx-controls-react/lib/SitePicker";

export interface PropertyPaneSitePickerProps extends Omit< ISitePickerProps, 'onChange'> {
    onPropertyChange: (propertyPath: string, newValue: ISite) => void;
}

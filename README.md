# Introduction

Wrappers and tools for [@pnp/SPFX-Controls-react](https://github.com/pnp/sp-dev-fx-controls-react/) and [@FluentUI/react](https://github.com/microsoft/fluentui/tree/master/packages/react) to work with the [SharePoint List Controller](https://github.com/mauriora/Controller-SharePoint-List).

For each FieldType a component with label exists, that accpets the same props.
Mostly they are straight HOCs implementing onChange. Sometimes they'll add the label.

## Note

Not quite public yet, this is part of the [hybrid repro MVC SharePoint example implementation](https://github.com/mauriora/reusable-hybrid-repo-mvc-spfx-examples)

## Hooks

### AsyncError

[AsyncError](.\src\hooks\AsyncError.tsx) A hook usefull to catch an error in an async operation and rethrow it in the main loop.

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

## Components

### Form and Fields

A property is always passed as `item` and `property`-name, to enable statemanagement. `info` contains field information like displayname and description.

```typescript
    return <TextField
        info={info}
        property={'myTextField'}
        item={item}
    />;
```

#### Common interface

All fields use the same interface:

```typescript
interface PropertyFieldProps {
    info: IFieldInfo;
    controller: SharePointListController;
    property: string;
    item: ListItem;
    context;
}
```

Access to a the property of this field is done via `item[property]`. Dereferencing at the latest stage enables performance with tools like MobX and always provides the entire context to a field. This is needed for fields like `RatingCount` and `RatingAverage`, wich are generally displayed in one field.
`info` is the `IFieldInfo` for the represented SharePointfield. `info` contains important values like `Title` as field-displayname, `FieldTypeKind` and `TypeAsString`.
`controller` and `context` are passed for edge cases requiring more "context", e.g. fields that do their own SharePoint access like PeoplePicker, LookupListItemPicker, ... .

#### Generic PropertyField

Call this to create a generic field for an SharePointListItem property. It choose the specific Field component based on the fieldtype.
The example creates a form with a field for each property of a list:

```typescript
    return <Stack>
        {controller.propertyFields.forEach(
            (info, property) =>
                <PropertyField 
                    key={property}
                    info={info}
                    property={property}
                    item={item}
                    context={controller.context}
                    controller={controller} />
            }
        )}
    </Stack>;
```

#### Specific Property fields

A single PropertyField can be created for a specific field type, instead of using the generic approach.

```typescript
    return <LookupField
        info={info}
        property={'myLookupField'}
        item={item}
        context={controller.context}
        controller={controller}
    />;
```

### MessageBar

A HOC have been created for standard message bar cases. The MessageBar should be used instead of a intrusive messagebox when practicle.

## Getting Started

Include this module/repositiory in your solution as a submodule in shared. Reference through the `package.json` of the executable, e.g. WebPart, ListExtension or similar.

1. Add as a submodule to your solution
2. Add to `package.json`

```json
  "dependencies": {
    "@mauriora/utils-spfx-controls-react": "latest"
  }
```

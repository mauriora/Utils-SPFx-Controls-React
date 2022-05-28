# Utils SPFx controls React
[![Fluent UI React 8.69.0](https://img.shields.io/badge/Fluent%20UI%20React-8.69.0-green.svg)](https://github.com/microsoft/fluentui/blob/master/packages/react/README.md)
[![Mobx 6.1.8](https://img.shields.io/badge/MobX-6.1.8-yellow.svg)](https://mobx.js.org/)
[![Node.js v14](https://img.shields.io/badge/Node.js-v14-orange.svg)](https://nodejs.org/en/download/releases/)
[![PnPjs 3.15.0](https://img.shields.io/badge/PnPjs-3.3.2-green.svg)](https://pnp.github.io/pnpjs/)
[![SharePoint Online](https://img.shields.io/badge/SharePoint-Online-yellow.svg)](https://docs.microsoft.com/en-us/sharepoint/introduction)
[![SPFx 1.15.0](https://img.shields.io/badge/SPFx-1.15.0-green.svg)](https://docs.microsoft.com/en-us/sharepoint/dev/spfx/sharepoint-framework-overview)
[![SPFx React Controls 3.8.0](https://img.shields.io/badge/SPFx%20React%20Controls-3.8.0-green.svg)](https://pnp.github.io/sp-dev-fx-controls-react/)
[![Yarn 3.2.1](https://img.shields.io/badge/Yarn-3.2.1-green.svg)](https://yarnpkg.com/)

## Overview

Wrappers and tools for [@pnp/SPFX-Controls-react](https://github.com/pnp/sp-dev-fx-controls-react) and [@FluentUI/react](https://github.com/microsoft/fluentui/tree/master/packages/react).
For each FieldType a component with label exists, that excepts the same props.
Mostly they are straight HOCs implementing `onChange`, sometimes they'll add the label.

## Table of content

- [Overview](#overview)
- [Table of content](#table-of-content)
- [Note](#note)
- [Components](#components)
  - [Form & Fields](#form--fields)
    - [Common interface](#common-interface)
    - [Generic PropertyField](#generic-propertyfield)
    - [Specific Property fields](#specific-property-fields)
  - [PersonaHoverCard](#personahovercard)
  - [MessageBar](#messagebar)
- [Getting Started](#getting-started)
  - [Build and Test](#build-and-test)
- [Contribute](#contribute)

## Note

Not quite public yet, this is part of the [hybrid repro MVC SharePoint example implementation](https://github.com/mauriora/reusable-hybrid-repo-mvc-spfx-examples)

## Components

### Form & Fields

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
interface FormProps {
    model: SharePointModel<ListItem>;
    item: ListItem;
};

const ItemForm: FC<FormProps> = ({ model, item }) =>
    <Stack>
        {model.propertyFields.map(
            (info, property) =>
                <PropertyField
                    key={property}
                    info={info}
                    property={property}
                    item={item}
                    model={model} />
        )}
    </Stack>;
```

Currently supported: AttachmentsField, BooleanField, ChoiceField, CounterField, CurrencyField, DateTimeField,  LookupComboBoxField, LookupField, MultiChoiceField, NoteField, NumberField, RatingCountField, RatingField, TaxonmyField, TextField, UrlField, UserField, LikesCountField

#### Specific Property fields

A single PropertyField can be created for a specific field type, instead of using the generic approach.

```typescript
    return <LookupField
        info={info}
        property={property}
        item={item}
        context={controller.context}
        controller={controller}
    />;
```

### PersonaHoverCard

A persona card hover around any element. Initially brief and then expanding to details like mobile phone.

```typescript
    return <PersonaHoverCard user={spUser}>
        <UserPersona
            user={spUser}
            size={PersonaSize.size24}
            imageUrl={spUser.picture}
            imageAlt={spUser.title}
            text={spUser.title}
        />
    </PersonaHoverCard>;

```

### MessageBar

HOC have been created for standard message bar cases. The MessageBar should be used instead of a intrusive messagebox when practicle.

## Getting Started

Include this module/repositiory in your solution as a submodule in shared. Reference through the `package.json` of the executable, e.g. WebPart, ListExtension or similar.

1. Add as a submodule to your solution
2. Add to `package.json`

```json
  "dependencies": {
    "@mauriora/utils-spfx-controls-react": "*"
  }
```

### Build and Test

To build from the sources, clone this repo and execute:

```shell
    yarn install
    yarn run build
```

## Contribute

Please feel aprreciate to contribute. Priority at this stage is cleaning up and documentation.

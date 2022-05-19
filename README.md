# Introduction 
Wrappers and tools for @pnp/SPFX-Controls-react and @FluentUI/react. 
For each FieldType a component with label exists, that excepts the same props.
Mostly they are straight HOCs implementing onChange. Sometimes they'll add the label.

# Note
Not quite public yet, this is part of the [hybrid repro MVC SharePoint example implementation](https://github.com/mauriora/reusable-hybrid-repo-mvc-spfx-examples)

# Components
## Form & Fields
### Common interface
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

### Generic PropertyField
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

### Specific Property fields
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

## MessageBar
HOC have been created for standard message bar cases. The MessageBar should be used instead of a intrusive messagebox when practicle.


## Getting Started
Include this module/repositiory in your solution as a submodule in shared. Reference through the `package.json` of the executable, e.g. WebPart, ListExtension or similar.

1.	Add as a submodule to your solution
2.	Add to `package.json`
```json
  "dependencies": {
    "@mauriora/utils-spfx-controls-react": "*"
  }
```

# Build and Test
TODO: Describe and show how to build your code and run the tests. 

# Contribute
TODO: Explain how other users and developers can contribute to make your code better. 

If you want to learn more about creating good readme files then refer the following [guidelines](https://docs.microsoft.com/en-us/azure/devops/repos/git/create-a-readme?view=azure-devops). You can also seek inspiration from the below readme files:
- [ASP.NET Core](https://github.com/aspnet/Home)
- [Visual Studio Code](https://github.com/Microsoft/vscode)
- [Chakra Core](https://github.com/Microsoft/ChakraCore)

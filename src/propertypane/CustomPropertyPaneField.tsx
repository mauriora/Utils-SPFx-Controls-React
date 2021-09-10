import * as React from 'react';
import { ComponentClass, FunctionComponent }  from 'react';
import * as ReactDom from 'react-dom';
import {
  IPropertyPaneField,
  PropertyPaneFieldType,
  IPropertyPaneCustomFieldProps
} from '@microsoft/sp-property-pane';

export type PropertyChangeCallback = (targetProperty: string, ...changeArgs: unknown[]) => void;

export class CustomPropertyPaneField<T> implements IPropertyPaneField<Omit<T, 'onChange'>> {
  public type: PropertyPaneFieldType = PropertyPaneFieldType.Custom;
  public properties: Omit<T, 'onChange'> & IPropertyPaneCustomFieldProps;
  private elem: HTMLElement;
  
  constructor(public onChange: PropertyChangeCallback, public targetProperty: string, private props: Omit<T, 'onChange'>, private component: FunctionComponent<T> | ComponentClass<T>) {
    this.properties = {
      ...props,
      key: targetProperty + '.CustomField.' + this.constructor.name,
      onRender: this.onRender,
      onDispose: this.onDispose
    };
  }


  private onDispose=(element: HTMLElement): void =>{
    ReactDom.unmountComponentAtNode(element);
  }

  private onRender =(elem: HTMLElement): void=> {
    if (!this.elem) {
      this.elem = elem;
    }
    const Component = this.component
    ReactDom.render(<Component {...this.props as any} onChange={this.onChangedWrapper} />, elem);
  }

  private onChangedWrapper = (...changeArgs: unknown[]): void => {
    this.onChange(this.targetProperty, ...changeArgs);
  }
}


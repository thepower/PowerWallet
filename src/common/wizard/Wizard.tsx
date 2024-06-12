import React from 'react';
import classnames from 'classnames';

import styles from './Wizard.module.scss';
import { Breadcrumbs } from '../breadcrumbs/components/Breadcrumbs';
import { BreadcrumbsTypeEnum, BreadcrumbsDataType } from '../breadcrumbs/typings/breadcrumbsTypings';

export interface WizardProps {
  breadcrumbs: BreadcrumbsDataType[];
  componentsCommonProps?: any;
  className?: string;
  currentStep: number;
  onSelectBreadCrumb?: (data?: any) => void;
  type: BreadcrumbsTypeEnum;
  breadCrumbHasBorder?: boolean;
  breadCrumbClassName?: string;
}

export type WizardComponentType = {
  component: any;
  componentProps?: any;
};

export type WizardComponentProps = {
  setNextStep: () => void;
  setPrevStep: () => void;
};

export class Wizard extends React.Component<WizardProps> {
  handleSelectBreadcrumb = (nextStep: number) => {
    const { onSelectBreadCrumb } = this.props;

    onSelectBreadCrumb?.(nextStep);
  };

  setNextStep = () => {
    const { breadcrumbs, currentStep } = this.props;

    const nextStep = Math.min(currentStep + 1, breadcrumbs.length - 1);

    this.handleSelectBreadcrumb(nextStep);
  };

  setPrevStep = () => {
    const { currentStep } = this.props;

    const nextStep = Math.max(currentStep - 1, 0);

    this.handleSelectBreadcrumb(nextStep);
  };

  setCurrentStep = (nextStep: number) => {
    this.handleSelectBreadcrumb(nextStep);
  };

  getCurrentComponent = (): WizardComponentType => {
    const { currentStep, breadcrumbs } = this.props;
    const { componentProps, component } = (breadcrumbs || [])[currentStep];

    if (!component && !componentProps) {
      return { component: React.Fragment };
    }

    return { componentProps, component };
  };

  renderComponent = () => {
    const { component, componentProps } = this.getCurrentComponent();
    const CurrentComponent: any = component;
    const { componentsCommonProps } = this.props;

    return (
      <CurrentComponent
        setNextStep={this.setNextStep}
        setPrevStep={this.setPrevStep}
        {...componentsCommonProps}
        {...componentProps}
      />
    );
  };

  render() {
    const {
      breadcrumbs,
      className,
      type,
      breadCrumbHasBorder,
      breadCrumbClassName,
    } = this.props;
    const { currentStep } = this.props;

    return <div className={classnames(styles.wizard, className)}>
      <Breadcrumbs
        currentStep={currentStep}
        breadcrumbs={breadcrumbs}
        setCurrentStep={this.setCurrentStep}
        type={type}
        breadCrumbHasBorder={breadCrumbHasBorder}
        breadCrumbClassName={breadCrumbClassName}
      />
      {this.renderComponent()}
    </div>;
  }
}

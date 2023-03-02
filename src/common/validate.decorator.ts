import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import * as moment from 'moment';

export function IsDateStringFormat(
  format: string = 'YYYY-MM-DD',
  allowNull: boolean = false,
  validationOptions?: ValidationOptions,
) {
  return function (object: unknown, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [format, allowNull],
      validator: IsDateStringFormatConstraint,
    });
  };
}

@ValidatorConstraint({ name: 'IsDateStringFormat' })
export class IsDateStringFormatConstraint
  implements ValidatorConstraintInterface
{
  validate(value: any, args: ValidationArguments) {
    const [format, allowNull] = args.constraints;
    if (allowNull && !value) {
      return true;
    } 
    return moment(value).isValid() && moment(value).format(format) === value;
  }

  defaultMessage({ property, constraints }) {
    const [format] = constraints;
    return `${property} must be a valid format date ${format}`;
  }
}

export function IsAfterDate(
  property: string = 'startAt',
  allowNull: boolean = false,
  validationOptions?: ValidationOptions,
) {
  return function (object: unknown, propertyName: string) {
    return registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [property, allowNull],
      validator: IsAfterDateConstraint,
    });
  };
}

@ValidatorConstraint({ name: 'IsAfterDate' })
export class IsAfterDateConstraint implements ValidatorConstraintInterface {
  validate(value: any, args: ValidationArguments) {
    const [property, allowNull] = args.constraints;
    if (property && property.toLowerCase() === 'now') {
      return moment(value).isValid() && moment(value).isAfter(moment.now());
    }
    const relatedValue = (args.object as any)[property];
    return allowNull
      ? true
      : moment(value).isValid() &&
          moment(relatedValue).isValid() &&
          moment(value).isAfter(relatedValue);
  }

  defaultMessage({ property, constraints }) {
    const [format] = constraints;
    return `${property} must be a after ${format}`;
  }
}

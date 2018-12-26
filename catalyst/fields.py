"Fields"

from typing import Callable, Dict, Any, NoReturn
from collections import Iterable
from datetime import datetime, time, date

from .validators import (
    ValidationError, LengthValidator, ComparisonValidator,
    BoolValidator
)


def no_processing(value): return value


Name = str
Value = Any


class Field:
    default_error_messages = {
        'required': 'Missing data for required field.',
        'allow_none': 'Field may not be None.'
    }

    def __init__(
        self,
        name: str = None,
        key: str = None,
        dump_from: Callable[[object, Name], Value] = None,
        formatter: Callable[[Value], Value] = None,
        parse: Callable[[Value], Value] = None,
        validator: Callable[[Value], None] = None,
        required: bool = False,
        allow_none: bool = True,
        error_messages: Dict[str, str] = None,
        no_dump: bool = False,
        no_load: bool = False,
    ):
        self.name = name
        self.key = key
        self.required = required
        self.allow_none = allow_none
        self.no_dump = no_dump
        self.no_load = no_load

        self.dump_from = dump_from if dump_from else getattr

        self.formatter = formatter if formatter else no_processing

        self.parse = parse if parse else no_processing

        self.validator = validator if validator else no_processing

        self.error_messages = self.default_error_messages.copy() \
            if self.default_error_messages else {}
        self.error_messages.update(error_messages if error_messages else {})

        # 待定参数: default

    def set_dump_from(self, dump_from: Callable[[object, Name], Value]):
        self.dump_from = dump_from
        return dump_from

    def set_formatter(self, formatter: Callable[[Value], Value]):
        self.formatter = formatter
        return formatter

    def set_parse(self, parse: Callable[[Value], Value]):
        self.parse = parse
        return parse

    def set_validator(self, validator: Callable[[Value], None]):
        self.validator = validator
        return validator

    def set_dump(self, dump: Callable[[object, Name], Value]):
        self.dump = dump
        return dump

    def set_load(self, load: Callable[[dict, Name], Value]):
        self.load = load
        return load

    def dump(self, obj):
        value = self.dump_from(obj, self.name)
        if self.formatter and value is not None:
            value = self.formatter(value)
        return value

    def load(self, data: dict):
        value = self.load_from(data)
        if value is None:
            if self.allow_none:
                return None
            else:
                raise ValidationError(self.error_messages.get('allow_none'))

        value = self.parse(value)
        self.validate(value)
        return value

    def load_from(self, data: dict):
        if self.key in data.keys():
            value = data[self.key]
            return value
        elif self.required:
            raise ValidationError(self.error_messages.get('required'))
        else:
            return None

    def validate(self, value):
        if isinstance(self.validator, Iterable):
            for vld in self.validator:
                vld(value)
        else:
            self.validator(value)


class StringField(Field):
    def __init__(self, min_length=None, max_length=None,
                 name=None, key=None, dump_from=None, formatter=str,
                 parse=str, validator=None,
                 required=False, allow_none=True, error_messages=None,
                 no_dump=False, no_load=False):
        self.min_length = min_length
        self.max_length = max_length
        if validator is None and \
                (min_length is not None or max_length is not None):
            validator = LengthValidator(min_length, max_length)

        super().__init__(
            name=name, key=key, dump_from=dump_from, formatter=formatter,
            parse=parse, validator=validator,
            required=required, allow_none=allow_none, error_messages=error_messages,
            no_dump=no_dump, no_load=no_load
        )


class NumberField(Field):
    type_ = float

    def __init__(self, min_value=None, max_value=None,
                 name=None, key=None, dump_from=None, formatter=None,
                 parse=None, validator=None,
                 required=False, allow_none=True, error_messages=None,
                 no_dump=False, no_load=False):
        self.max_value = self.type_(
            max_value) if max_value is not None else max_value
        self.min_value = self.type_(
            min_value) if min_value is not None else min_value

        if not formatter:
            formatter = self.type_

        if not parse:
            parse = self.type_

        if validator is None and \
                (min_value is not None or max_value is not None):
            validator = ComparisonValidator(min_value, max_value)

        super().__init__(
            name=name, key=key, dump_from=dump_from, formatter=formatter,
            parse=parse, validator=validator,
            required=required, allow_none=allow_none, error_messages=error_messages,
            no_dump=no_dump, no_load=no_load
        )


class IntegerField(NumberField):
    type_ = int


class FloatField(NumberField):
    type_ = float


class BoolField(Field):
    def __init__(self, name=None, key=None, dump_from=None, formatter=bool,
                 parse=bool, validator=None,
                 required=False, allow_none=True, error_messages=None,
                 no_dump=False, no_load=False):

        if not validator:
            validator = BoolValidator(error_messages)

        super().__init__(
            name=name, key=key, dump_from=dump_from, formatter=formatter,
            parse=parse, validator=validator,
            required=required, allow_none=allow_none, error_messages=error_messages,
            no_dump=no_dump, no_load=no_load
        )


class ListField(Field):
    def __init__(self, item_field=Field(),
                 name=None, key=None, dump_from=None, formatter=None,
                 validator=None, parse=None,
                 required=False, allow_none=True, error_messages=None,
                 no_dump=False, no_load=False):
        if not formatter:
            formatter = lambda list_: [item_field.formatter(item) for item in list_]

        self.item_field = item_field
        self.default_error_messages['iterable'] = 'The field value is not Iterable.',

        super().__init__(
            name=name, key=key, dump_from=dump_from, formatter=formatter,
            parse=parse, validator=validator,
            required=required, allow_none=allow_none, error_messages=error_messages,
            no_dump=no_dump, no_load=no_load
        )

    def load(self, data):
        list_ = self.load_from(data)
        if list_ is None:
            if self.allow_none:
                return None
            else:
                raise ValidationError(self.error_messages.get('allow_none'))

        if not isinstance(list_, Iterable):
            raise ValidationError(self.error_messages.get('iterable'))

        for i, value in enumerate(list_):
            value = self.item_field.parse(value)
            self.item_field.validate(value)
            list_[i] = value
        return list_


class CallableField(Field):
    def __init__(self, func_args: list = None, func_kwargs: dict = None,
                 name=None, key=None, dump_from=None, formatter=None,
                 parse=None, validator=None,
                 required=False, allow_none=True, error_messages=None,
                 no_dump=False, no_load=True):

        if not func_args:
            func_args = []

        if not func_kwargs:
            func_kwargs = {}

        if not formatter:
            formatter = lambda func: func(*func_args, **func_kwargs)

        super().__init__(
            name=name, key=key, dump_from=dump_from, formatter=formatter,
            parse=parse, validator=validator,
            required=required, allow_none=allow_none, error_messages=error_messages,
            no_dump=no_dump, no_load=no_load
        )


class DatetimeField(Field):
    type_ = datetime

    def __init__(self, fmt=None,
                 name=None, key=None, dump_from=None, formatter=None,
                 parse=None, validator=None,
                 required=False, allow_none=True, error_messages=None,
                 no_dump=False, no_load=False):

        self.fmt = fmt

        if not formatter:
            if fmt:
                formatter = lambda dt: self.type_.strftime(dt, fmt)
            else:
                formatter = lambda dt: self.type_.isoformat(dt)

        if not parse:
            if fmt:
                parse = self._get_parse(fmt)
            else:
                parse = lambda dt_str: self.type_.fromisoformat(dt_str)

        super().__init__(
            name=name, key=key, dump_from=dump_from, formatter=formatter,
            parse=parse, validator=validator,
            required=required, allow_none=allow_none, error_messages=error_messages,
            no_dump=no_dump, no_load=no_load
        )

    def _get_parse(self, fmt):
        parse = no_processing
        if self.type_ is datetime:
            parse = lambda dt_str: datetime.strptime(dt_str, fmt)
        elif self.type_ is date:
            parse = lambda dt_str: datetime.strptime(dt_str, fmt).date()
        elif self.type_ is time:
            parse = lambda dt_str: datetime.strptime(dt_str, fmt).time()
        return parse


class TimeField(DatetimeField):
    type_ = time


class DateField(DatetimeField):
    type_ = date


class NestField(Field):
    def __init__(self, catalyst,
                 name=None, key=None, dump_from=None, formatter=None,
                 parse=None, validator=None,
                 required=False, allow_none=True, error_messages=None,
                 no_dump=False, no_load=False):
        self.catalyst = catalyst

        if not formatter:
            formatter = lambda obj: catalyst.dump(obj)

        if not parse:
            parse = self._get_parse(catalyst)

        super().__init__(
            name=name, key=key, dump_from=dump_from, formatter=formatter,
            parse=parse, validator=validator,
            required=required, allow_none=allow_none, error_messages=error_messages,
            no_dump=no_dump, no_load=no_load
        )

    def _get_parse(self, catalyst):
        def parse(obj):
            r = catalyst.load(obj)
            if not r.is_valid:
                raise ValidationError(r)
            return r.valid_data
        return parse

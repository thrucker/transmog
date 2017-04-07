# transmog

[![Greenkeeper badge](https://badges.greenkeeper.io/thrucker/transmog.svg)](https://greenkeeper.io/)

[![npm](https://img.shields.io/npm/v/transmog.svg?maxAge=2592000)](https://www.npmjs.org/package/transmog)
[![Build Status](https://travis-ci.org/thrucker/transmog.svg?branch=master)](https://travis-ci.org/thrucker/transmog)
[![codecov](https://codecov.io/gh/thrucker/transmog/branch/master/graph/badge.svg)](https://codecov.io/gh/thrucker/transmog)
[![dependencies Status](https://david-dm.org/thrucker/transmog/status.svg)](https://david-dm.org/thrucker/transmog)
[![devDependencies Status](https://david-dm.org/thrucker/transmog/dev-status.svg)](https://david-dm.org/thrucker/transmog?type=dev)

transmog is a utility for converting JavaScript objects of a certain shape to JavaScript objects of a different shape.
This transformation is based on standardized rules to make it easy to express and comprehend the transformation.

Features:
* reading/writing from/to nested properties
* whitelisting of properties
* conversion of property values
* default values for missing property values

## API

### `transmog()`

```
transmog(
  rules: object,
  object: object
): object
```

Transforms `object` according to `rules`.

`transmog` will apply the `rules` to `object` without mutating it and will always return a newly created object. Note
however that the property values of the resulting object may reference the same objects as the source `object` does.
There's no cloning of objects involved unless you specify individual rules which do so.

#### `rules`

The `rules` object consists of key-value pairs which specify how every property of the resulting object is determined.

```
rules = {
    "path.to.property": <boolean | function | string | object>,
    ...
}
```

The key of a rule specifies the property name or property path in the resulting object. A property path is a `.`
delimited string of valid property names and can be used to create nested objects.

The value of a rule is a description for how to calculate the property value based on the source `object`. Different
common use cases can be expressed based on the type of the rule.

##### boolean rule

`true | false`

If `true` the value of the source `object` under the same path is written to the resulting object. If `false` the rule
is ignored. (This is just for consistency. Instead of specifying `false` the rule can be omitted as well.)

##### function rule

```
function (
    sourceValue: any,
    sourceObject: object
): any
```

The specified function is called with
* the `sourceValue` which is the property value of the source `object` under the same path as the rule describes
* the source `object` itself.

It should return the value which will be written to the resulting object under the path which the rule describes.

##### string rule

`"source.property.path"`

The specified string is interpreted as a property path of the source `object` whose value will be written to the
resulting object.

##### object rule

```
{
    converter?: (sourceValue: any, sourceObject: object) => any,
    sourcePath?: string,
    defaultTo?: (sourceObject: object) => any
}
```

An object rule is the generalization of the `boolean`, `function` and `string` rule.

The `converter` function will be called with the `sourceValue` and `sourceObject` and should return the value which will
be written to the resulting object. If omitted the identity function will be used as a default.

The `sourcePath` specifies the property path under which the `sourceValue` for the `converter` function will be read. If
omitted the destination path of the rule will be used as a default.

The `defaultTo` function will be called if the `sourceValue` is `null`, `undefined` or the source `object` has no
property under the specified `sourcePath`. It will be called with the `sourceObject` as an argument and should return
the default value which will be written to the resulting object. If `defaultTo` is omitted no value will be written to
the resulting object if `sourceValue` is `null`, `undefined` or the source `object` has no property under the specified
`sourcePath`.

## Example

TODO

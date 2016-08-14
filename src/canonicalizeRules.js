import _ from 'lodash/fp/placeholder';
import defaults from 'lodash/fp/defaults';
import flow from 'lodash/fp/flow';
import forEach from 'lodash/fp/forEach';
import has from 'lodash/fp/has';
import identity from 'lodash/fp/identity';
import invoke from 'lodash/invoke';
import isNil from 'lodash/fp/isNil';
import _mapValues from 'lodash/fp/mapValues';
import omitBy from 'lodash/fp/omitBy';
import pickBy from 'lodash/fp/pickBy';
import tap from 'lodash/fp/tap';

import assert from './assert';
import typeOf from './typeOf';

let mapValues = _mapValues.convert({cap: false});

let canonicalizeBoolean = (transformProperty, sourcePath) => {
    if (!transformProperty) {
        return null;
    }

    return {
        converter: identity,
        destinationPath: sourcePath
    };
};

let canonicalizeFunction = (converter, sourcePath) => {
    return {converter, destinationPath: sourcePath};
}

let canonicalizeString = (destinationPath, sourcePath) => {
    return {converter: identity, destinationPath};
}

let canonicalizeObject = (rule, sourcePath) =>
    defaults(
        {
            converter: identity,
            destinationPath: sourcePath
        },
        rule
    )

let canonicalizers = {
    'boolean': canonicalizeBoolean,
    'function': canonicalizeFunction,
    'string': canonicalizeString,
    'object': canonicalizeObject
};

let filterExistingCanonicalizers = pickBy(
    flow(typeOf, has(_, canonicalizers))
);

let applyCanonicalizers = mapValues(
    (rule, sourcePath) => invoke(canonicalizers, typeOf(rule), rule, sourcePath)
);

let omitEmptyRules = omitBy(isNil);

let assertRuleFormat = tap(
    forEach(({converter, destinationPath}) => {
        assert(typeof converter === 'function', 'converter must be a function');
        assert(typeof destinationPath === 'string', 'destinationPath must be a string');
    })
);

export default flow(
    filterExistingCanonicalizers,
    applyCanonicalizers,
    omitEmptyRules,
    assertRuleFormat
);

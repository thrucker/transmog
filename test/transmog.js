import {expect} from 'chai';
import transmog from '../src/index';
import identity from 'lodash/identity';
import assert from '../src/assert';

describe('transmog', () => {
    context('object rules', () => {
        it('should map the property at sourcePath to the destination path given by the key', () => {
            let rules = {
                'mapped.a': {
                    converter: identity,
                    sourcePath: 'a'
                },
                'C': {
                    converter: identity,
                    sourcePath: 'b.c'
                }
            };

            let obj = {
                a: 1,
                b: {
                    c: 2
                }
            };

            expect(transmog(rules, obj)).to.deep.equal({
                mapped: {
                    a: 1
                },
                C: 2
            });
        });

        it('should convert the value using the given converter function', () => {
            let rules = {
                A: {
                    converter: (a) => a + 1,
                    sourcePath: 'a'
                },
                'hello.world': {
                    converter: (b) => `Hello, ${b}!`,
                    sourcePath: 'b'
                }
            };

            let obj = {
                a: 41,
                b: 'world'
            };

            expect(transmog(rules, obj)).to.deep.equal({
                A: 42,
                hello: {
                    world: 'Hello, world!'
                }
            });
        });

        it('should use identity if converter is omitted', () => {
            let rules = {
                b: {
                    sourcePath: 'a'
                }
            };

            let obj = {
                a: 1
            };

            expect(transmog(rules, obj)).to.deep.equal({
                b: 1
            });
        });

        it('should use destination path as source path if sourcePath is omitted', () => {
            let rules = {
                a: {
                    converter: (a) => a + 1
                }
            };

            let obj = {
                a: 1
            };

            expect(transmog(rules, obj)).to.deep.equal({
                a: 2
            });
        });
    });

    context('property paths', () => {
        it('should read from deep paths', () => {
            let rules = {
                abc: {
                    converter: identity,
                    sourcePath: 'a.b.c'
                }
            };

            let obj = {
                a: {
                    b: {
                        c: 1
                    }
                }
            };

            expect(transmog(rules, obj)).to.deep.equal({
                abc: 1
            });
        });

        it('should write to deep path', () => {
            let rules = {
                'a.b.c': {
                    converter: identity,
                    sourcePath: 'abc'
                }
            };

            let obj = {
                abc: 1
            };

            expect(transmog(rules, obj)).to.deep.equal({
                a: {
                    b: {
                        c: 1
                    }
                }
            });
        });

        it('should ignore non-existing source paths', () => {
            let rules = {
                A: {
                    converter: identity,
                    sourcePath: 'a'
                },
                BC: {
                    converter: identity,
                    sourcePath: 'b.c'
                }
            };

            let obj = {
                a: 1,
                b: {
                    d: 2
                }
            };

            expect(transmog(rules, obj)).to.deep.equal({
                A: 1
            });
        });
    });

    context('boolean rules', () => {
        it('should take property when rule is true', () => {
            let rules = {
                a: true,
                c: true
            };

            let obj = {
                a: 1,
                b: 2,
                c: 3
            };

            expect(transmog(rules, obj)).to.deep.equal({
                a: 1,
                c: 3
            });
        });

        it('should ignore property when rule is false', () => {
            let rules = {
                a: false,
                c: true
            };

            let obj = {
                a: 1,
                b: 2,
                c: 3
            };

            expect(transmog(rules, obj)).to.deep.equal({
                c: 3
            });
        });
    });

    context('function rules', () => {
        it('should transform the value using the given function', () => {
            let rules = {
                a: (a) => 10 * a
            };

            let obj = {
                a: 4.2
            };

            expect(transmog(rules, obj)).to.deep.equal({
                a: 42
            });
        });
    });

    context('string rules', () => {
        it('should move the property from source path given by the value to destination path given by the key', () => {
            let rules = {
                'b.c': 'a'
            };

            let obj = {
                a: 1
            }

            expect(transmog(rules, obj)).to.deep.equal({
                b: {
                    c: 1
                }
            });
        });
    });

    context('rule format assertion', () => {
        it('should throw AssertionError if converter is not a function', () => {
            let rules = {
                a: {
                    converter: 3,
                    sourcePath: 'a'
                }
            };

            let obj = {
                a: 1
            };

            expect(() => transmog(rules, obj)).to.throw('AssertionError');
        });

        it('should throw AssertionError if sourcePath is not a string', () => {
            let rules = {
                a: {
                    converter: identity,
                    sourcePath: 1
                }
            };

            let obj = {
                a: 2
            };

            expect(() => transmog(rules, obj)).to.throw('AssertionError');
        });
    });
});

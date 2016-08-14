import {expect} from 'chai';
import transmog from '../src/index';
import identity from 'lodash/identity';
import assert from '../src/assert';

describe('transmog', () => {
    context('object rules', () => {
        it('should map the property at the given path to the destinationPath', () => {
            let rules = {
                a: {
                    converter: identity,
                    destinationPath: 'mapped.a'
                },
                'b.c': {
                    converter: identity,
                    destinationPath: 'C'
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
                a: {
                    converter: (a) => a + 1,
                    destinationPath: 'A'
                },
                b: {
                    converter: (b) => `Hello, ${b}!`,
                    destinationPath: 'hello.world'
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
                a: {
                    destinationPath: 'b'
                }
            };

            let obj = {
                a: 1
            };

            expect(transmog(rules, obj)).to.deep.equal({
                b: 1
            });
        });

        it('should use source path if destinationPath is omitted', () => {
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
                'a.b.c': {
                    converter: identity,
                    destinationPath: 'abc'
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
                abc: {
                    converter: identity,
                    destinationPath: 'a.b.c'
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
                a: {
                    converter: identity,
                    destinationPath: 'A'
                },
                'b.c': {
                    converter: identity,
                    destinationPath: 'BC'
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
        it('should move the property to the given destination path', () => {
            let rules = {
                a: 'b.c'
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
                    destinationPath: 'a'
                }
            };

            let obj = {
                a: 1
            };

            expect(() => transmog(rules, obj)).to.throw('AssertionError');
        });

        it('should throw AssertionError if destinationPath is not a string', () => {
            let rules = {
                a: {
                    converter: identity,
                    destinationPath: 1
                }
            };

            let obj = {
                a: 2
            };

            expect(() => transmog(rules, obj)).to.throw('AssertionError');
        });
    });
});

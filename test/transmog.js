import { expect } from 'chai'
import identity from 'lodash/identity'
import transmog from '../src/index'

describe('transmog', () => {
  context('object rules', () => {
    it('should map the property at sourcePath to the destination path given by the key', () => {
      const rules = {
        'mapped.a': {
          converter: identity,
          sourcePath: 'a',
        },
        C: {
          converter: identity,
          sourcePath: 'b.c',
        },
      }

      const obj = {
        a: 1,
        b: {
          c: 2,
        },
      }

      expect(transmog(rules, obj)).to.deep.equal({
        mapped: {
          a: 1,
        },
        C: 2,
      })
    })

    it('should convert the value using the given converter function', () => {
      const rules = {
        A: {
          converter: a => a + 1,
          sourcePath: 'a',
        },
        'hello.world': {
          converter: b => `Hello, ${b}!`,
          sourcePath: 'b',
        },
      }

      const obj = {
        a: 41,
        b: 'world',
      }

      expect(transmog(rules, obj)).to.deep.equal({
        A: 42,
        hello: {
          world: 'Hello, world!',
        },
      })
    })

    it('should use identity if converter is omitted', () => {
      const rules = {
        b: {
          sourcePath: 'a',
        },
      }

      const obj = {
        a: 1,
      }

      expect(transmog(rules, obj)).to.deep.equal({
        b: 1,
      })
    })

    it('should use destination path as source path if sourcePath is omitted', () => {
      const rules = {
        a: {
          converter: a => a + 1,
        },
      }

      const obj = {
        a: 1,
      }

      expect(transmog(rules, obj)).to.deep.equal({
        a: 2,
      })
    })

    it('should omit the property if source object has no value under the specified path', () => {
      const rules = {
        a: {
          converter: a => a + 1,
          sourcePath: 'b',
        },
        x: 'c',
      }

      const obj = {
        c: 10,
      }

      expect(transmog(rules, obj)).to.deep.equal({
        x: 10,
      })
    })

    describe('defaultTo property', () => {
      it('should use defaultTo function for non-existing source path', () => {
        const rules = {
          a: {
            converter: identity,
            defaultTo: () => 1,
            sourcePath: 'a',
          },
        }

        const obj = {
          b: 10,
        }

        expect(transmog(rules, obj)).to.deep.equal({
          a: 1,
        })
      })

      it('should use defaultTo function if source value is undefined', () => {
        const rules = {
          a: {
            converter: identity,
            defaultTo: () => 1,
            sourcePath: 'a',
          },
        }

        const obj = {
          a: undefined,
          b: 10,
        }

        expect(transmog(rules, obj)).to.deep.equal({
          a: 1,
        })
      })

      it('should use defaultTo function if source value is null', () => {
        const rules = {
          a: {
            converter: identity,
            defaultTo: () => 1,
            sourcePath: 'a',
          },
        }

        const obj = {
          a: null,
          b: 10,
        }

        expect(transmog(rules, obj)).to.deep.equal({
          a: 1,
        })
      })

      it('should call defaultTo function with source object as argument', () => {
        let arg

        const defaultToFunction = (o) => {
          arg = o
          return 1
        }

        const rules = {
          a: {
            converter: identity,
            defaultTo: defaultToFunction,
            sourcePath: 'a',
          },
        }

        const obj = {
          b: 10,
        }

        transmog(rules, obj)

        expect(arg).to.equal(obj)
      })
    })
  })

  context('property paths', () => {
    it('should read from deep paths', () => {
      const rules = {
        abc: {
          converter: identity,
          sourcePath: 'a.b.c',
        },
      }

      const obj = {
        a: {
          b: {
            c: 1,
          },
        },
      }

      expect(transmog(rules, obj)).to.deep.equal({
        abc: 1,
      })
    })

    it('should write to deep path', () => {
      const rules = {
        'a.b.c': {
          converter: identity,
          sourcePath: 'abc',
        },
      }

      const obj = {
        abc: 1,
      }

      expect(transmog(rules, obj)).to.deep.equal({
        a: {
          b: {
            c: 1,
          },
        },
      })
    })

    it('should ignore non-existing source paths', () => {
      const rules = {
        A: {
          converter: identity,
          sourcePath: 'a',
        },
        BC: {
          converter: identity,
          sourcePath: 'b.c',
        },
      }

      const obj = {
        a: 1,
        b: {
          d: 2,
        },
      }

      expect(transmog(rules, obj)).to.deep.equal({
        A: 1,
      })
    })

    it('should convert undefined values', () => {
      const rules = {
        a: {
          converter: identity,
          sourcePath: 'a',
        },
      }

      const obj = {
        a: undefined,
      }

      expect(transmog(rules, obj)).to.deep.equal({
        a: undefined,
      })
    })

    it('should convert null values', () => {
      const rules = {
        a: {
          converter: identity,
          sourcePath: 'a',
        },
      }

      const obj = {
        a: null,
      }

      expect(transmog(rules, obj)).to.deep.equal({
        a: null,
      })
    })
  })

  context('boolean rules', () => {
    it('should take property when rule is true', () => {
      const rules = {
        a: true,
        c: true,
      }

      const obj = {
        a: 1,
        b: 2,
        c: 3,
      }

      expect(transmog(rules, obj)).to.deep.equal({
        a: 1,
        c: 3,
      })
    })

    it('should ignore property when rule is false', () => {
      const rules = {
        a: false,
        c: true,
      }

      const obj = {
        a: 1,
        b: 2,
        c: 3,
      }

      expect(transmog(rules, obj)).to.deep.equal({
        c: 3,
      })
    })
  })

  context('function rules', () => {
    it('should transform the value using the given function', () => {
      const rules = {
        a: a => 10 * a,
      }

      const obj = {
        a: 4.2,
      }

      expect(transmog(rules, obj)).to.deep.equal({
        a: 42,
      })
    })
  })

  context('string rules', () => {
    it('should move the property from source path given by the value to destination path given by the key', () => {
      const rules = {
        'b.c': 'a',
      }

      const obj = {
        a: 1,
      }

      expect(transmog(rules, obj)).to.deep.equal({
        b: {
          c: 1,
        },
      })
    })
  })

  context('rule format assertion', () => {
    it('should throw AssertionError if converter is not a function', () => {
      const rules = {
        a: {
          converter: 3,
          sourcePath: 'a',
        },
      }

      const obj = {
        a: 1,
      }

      expect(() => transmog(rules, obj)).to.throw('converter must be a function')
    })

    it('should throw AssertionError if sourcePath is not a string', () => {
      const rules = {
        a: {
          converter: identity,
          sourcePath: 1,
        },
      }

      const obj = {
        a: 2,
      }

      expect(() => transmog(rules, obj)).to.throw('sourcePath must be a string')
    })
  })

  context('conversion function', () => {
    it('should be called with source property value as first argument', () => {
      let firstArgument

      const converterFunction = (a) => {
        firstArgument = a
        return a
      }

      const rules = {
        a: {
          converter: converterFunction,
          sourcePath: 'a',
        },
      }

      const obj = {
        a: {},
      }

      transmog(rules, obj)

      expect(firstArgument).to.equal(obj.a)
    })

    it('should be called with source object as second argument', () => {
      let secondArgument

      const converterFunction = (a, o) => {
        secondArgument = o
        return a
      }

      const rules = {
        a: {
          converter: converterFunction,
          sourcePath: 'a',
        },
      }

      const obj = {
        a: 1,
      }

      transmog(rules, obj)

      expect(secondArgument).to.equal(obj)
    })
  })
})

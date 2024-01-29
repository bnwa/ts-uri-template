# ts-url-template

WIP non-standard, typed superset of [RFC
6570](https://datatracker.ietf.org/doc/html/rfc6570).

## Implementation Status

- [ ] Level 1

- [ ] Level 2

- [ ] Level 3

- [ ] Level 4

## Usage

```typescript
// Re-open and extend VariableTypes interface with custom types. Comes with // string, boolean, and number by default

namespace 'ts-uri-tempalte' {
 interface VariableTypes {
    semver: `${number}.${number}${number}`
  }
}
```

```typescript
// Create a supported RFC-6570 URI literal, except you can specify parameter// types by enclosing the key you inscribed in `VariableTypes` after the
// variable name
import type { URITemplateVars } from 'ts-uri-template'
import { expand } from 'ts-uri-template'
import { regex } from 'ts-uri-template'
import { glob } from 'ts-uri-template'

const uri =
"http://api.example.com/foo/bar/{version(semver)}/?a={author(string)}"


// { version:  `${number}.${number}${number}`, author: string }
type URIVars = URITemplateVars<typeof uri>

// The value proposition is that typing the URI template itself makes
// for a single source of truth about the types needed to evaluate the
// URI variables in different scenarios rather than litering them across
// different function signatures or just discarding types altogether and
// making typing everything stringly

// type glob = <URI extends string>(uri: URI, vars: Partial<URITemplateVars<URI>>) : string

// Returns "http://api.example.com/foo/bar/2.2.2/?*"
const globbed = glob(uri, { version: "2.2.2" })

// type expand = <URI extends string>(uri: URI, vars: URITemplateVars<URI>) : string

// Returns  "http://api.example.com/foo/bar/2.2.2/?a=somebody"
const expanded = expand(uri, { version: "2.2.2", author: "somebody" })

// Parse errors are caught at the type level
// Result will evaluate to:
// { _err: true } & "Encountered reserved character ')' before parsing '(' character -> ')}'"
type Result = URITemplateVars<typeof "http://example.com/api/things/{thing)}">
```

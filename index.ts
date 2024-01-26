// Extend interface in client code to expand map of 
// string identifiers to types
export interface VarTypes {
  ['boolean']: boolean
  ['uuid']: string
  ['list']: Array<string>
}

// RFC 6570 types
type LowercaseAlpha =
  | 'a' | 'b' | 'c' | 'd' | 'e' | 'f' | 'g'
  | 'h' | 'i' | 'j' | 'k' | 'l' | 'm' | 'n'
  | 'o' | 'p' | 'q' | 'r' | 's' | 't' | 'u'
  | 'v' | 'w' | 'x' | 'y' | 'z'

type Alpha = LowercaseAlpha | Uppercase<LowercaseAlpha>

type Digit =
  | '0' | '1' | '2' | '3' | '4'
  | '5' | '6' | '7' | '8' | '9'

type HexDig =
  | Digit
  | 'A' | 'B' | 'C' | 'D' | 'E' | 'F' 

type GenDelimits = 
  | ':' | '/' | '?' | '#' | '[' | ']' | '@'

type SubDelimits =
  | '!' | '$' | '&' | "'" | '('| ')'
  | '*' | '+' | ',' | ';' | '='

type PctEnc =
  `%${HexDig}${HexDig}`

type UnReserved =
  | Alpha
  | Digit
  | '-' | '.' | '_' | '~'

type Reserved = GenDelimits | SubDelimits

type Literal =
  | UnReserved
  | Reserved

type ExpandSafeReserve = '+'
type ExpandFragment = '#'

type VarChar =
  | Alpha
  | Digit
  | PctEnc
  | '_'
  | ''

type ExprOpen = '{'
type ExprClose = '}'

type TypeOpen = '('
type TypeClose = ')'

type ExprDelimits =
  | ExprOpen
  | ExprClose

type TypeDelimits =
  | TypeOpen
  | TypeClose

type OpLvl2 =
  | ExpandSafeReserve
  | ExpandFragment

type Op =
  | OpLvl2

type Merge<A,B, C =
  { [P in keyof A]: A[P] } &
  { [P in keyof B]: B[P] }> =
  { [P in keyof C as Exclude<P, never>]: C[P] } // Empty string valid var

type ParseError<Str extends string, Msg extends string> =
  { _err: true } & `${Msg} -> '${Str}'`


type ParseType<Str extends string, Acc, VarName extends string, VarType extends string = ""> =
  Str extends `${infer Head}${infer Rest}` ?
    Head extends ' ' ?
      ParseError<Str, "Encountered whitespace while parsing variable type; whitespace not allowed"> :
    Head extends ExprClose ?
      ParseError<Str, "Encountered character indicating end of expression before a type could be parsed"> :
    Head extends ExprOpen ?
      ParseError<Str, "Encountered character opening a nested expression while parsing a variable type; nested expressions are also always illegal"> :
    Head extends TypeOpen ?
      ParseError<Str, "Encountered character opening a new type before completing parsing current type; nested types are generally illegal"> :
    Head extends TypeClose ?
      VarType extends '' ?
        ParseError<Str, "Encountered end of type declaration with no type specified"> :
      VarType extends keyof VarTypes ?
        ParseExpr<Rest, Merge<Acc, {[name in VarName]: VarTypes[VarType]}>> :
        ParseError<VarType, "Parsed a variable type not found in VarTypes interface; extend interface with provided string as key to a definition"> :
    ParseType<Rest, Acc, VarName, `${VarType}${Head}`> :
  ParseError<Str, "Encountered end of string before a variable type could be parsed">

type ParseVar<Str extends string, Acc, VarName extends string = ""> =
  Str extends `${infer Head}${infer Rest}` ?
    Head extends TypeClose ?
      ParseError<Str, "Encountered reserved character ')' before parsing '(' character"> :
    Head extends ExprClose ?
      ParseError<Str, "Encountered reserved character '}' before completing parsing of an expression"> :
    Head extends ExprOpen ?
      ParseError<Str, "Encountered character opening a nested expression while parsing a variable name; nested expressions are also always illegal"> :
    Head extends TypeOpen ?
      ParseType<Rest, Acc, VarName> :
    Head extends VarChar ?
      ParseVar<Rest, Acc, `${VarName}${Head}`> :
    ParseError<Str, "Encountered illegal character while parsing variable name"> :
  ParseError<Str, "Encountered end of string before a variable name could be parsed">

type ParseExpr<Str extends string, Acc = {}> =
  Str extends `${infer Head}${infer Rest}` ?
    Head extends TypeClose ?
      ParseError<Str, "Encountered reserved character ')' either before parsing a variable name or after completing parsing of a variable"> :
    Head extends TypeOpen ?
      ParseError<Str, "Encountered reserved character '(' either before parsing a variable name or after completing parsing of a variable"> :
    Head extends ExprOpen ?
      ParseError<Str, "Encountered character '{' indicating a nested expression while parsing an expression; nested expressions are also always illegal"> :
    Head extends ExprClose ?
      ParseLiteral<Rest, Acc> :
    Head extends ' ' ?
      ParseExpr<Rest, Acc> :
      ParseError<Str, "An expression cannot possess a non-space character between end of type declaration and end of expression"> :
  ParseError<"EOL", "Encountered end of string before parsing a complete expression">

type ParseLiteral<Str extends string, Acc = {}> =
  Str extends `${infer Head}${infer Rest}` ?
    Head extends ExprOpen ?
      ParseVar<Rest, Acc> :
      ParseLiteral<Rest, Acc> :
  Acc

export type URITemplateVars<URI extends string> =
  ParseLiteral<URI>

/**
 * Copyright 2016 Shape Security, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License")
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import * as Shift from "shift-ast"

import {validStmt, invalidStmt, validExpr, invalidExpr, valid, invalid, wrapIter, exprStmt, label, block, BLOCK, ATI, BI, IE, ID, STMT, EXPR} from "./helpers"

suite("unit", () => {
  test("LiteralRegExpExpression value must be a valid RegExp", () => {
    return; // TODO patternAcceptor in parser is currently broken, so we don't have validation for regexs
    validExpr(new Shift.LiteralRegExpExpression({pattern: "a", flags: ""}));
    validExpr(new Shift.LiteralRegExpExpression({pattern: "a", flags: "g"}));
    validExpr(new Shift.LiteralRegExpExpression({pattern: "\\/", flags: ""}));
    validExpr(new Shift.LiteralRegExpExpression({pattern: "\\/", flags: "g"}));
    validExpr(new Shift.LiteralRegExpExpression({pattern: "/", flags: ""}));
    validExpr(new Shift.LiteralRegExpExpression({pattern: "/", flags: "g"}));
    validExpr(new Shift.LiteralRegExpExpression({pattern: "", flags: ""}));
    validExpr(new Shift.LiteralRegExpExpression({pattern: "", flags: "g"}));
    invalidExpr(1, new Shift.LiteralRegExpExpression({pattern: "[", flags: ""}));
    invalidExpr(1, new Shift.LiteralRegExpExpression({pattern: "(", flags: ""}));
    invalidExpr(1, new Shift.LiteralRegExpExpression({pattern: ")", flags: ""}));
  });

  test("Identifier name member must be a valid IdentifierName", () => {
    validExpr(new Shift.IdentifierExpression({name: "x"}));
    validExpr(new Shift.IdentifierExpression({name: "$"}));
    validExpr(new Shift.IdentifierExpression({name: "_"}));
    validExpr(new Shift.IdentifierExpression({name: "_$0x"}));
    validExpr(new Shift.StaticMemberExpression({object: EXPR, property: ID}));
    validExpr(new Shift.StaticMemberExpression({object: EXPR, property: "if"}));
    validExpr(new Shift.ObjectExpression({properties: [new Shift.DataProperty({name: new Shift.StaticPropertyName({value: "if"}), expression: EXPR})]}));
    invalidExpr(1, new Shift.IdentifierExpression({name: ""}));
    invalidExpr(1, new Shift.IdentifierExpression({name: "a-b"}));
    invalidExpr(1, new Shift.IdentifierExpression({name: "0x0"}));
    invalidExpr(1, new Shift.StaticMemberExpression({object: EXPR, property: ""}));
    invalidExpr(1, new Shift.StaticMemberExpression({object: EXPR, property: "0"}));
    invalidExpr(1, new Shift.StaticMemberExpression({object: EXPR, property: "a-b"}));
  });

  test("IdentifierExpression must not contain Identifier with reserved word name other than let and yield", () => {
    validExpr(new Shift.IdentifierExpression({name: "varx"}));
    validExpr(new Shift.IdentifierExpression({name: "xvar"}));
    validExpr(new Shift.IdentifierExpression({name: "varif"}));
    validExpr(new Shift.IdentifierExpression({name: "if_var"}));
    validExpr(new Shift.IdentifierExpression({name: "function0"}));
    validExpr(new Shift.IdentifierExpression({name: "let"}));
    validExpr(new Shift.IdentifierExpression({name: "yield"}));
    invalidExpr(1, new Shift.IdentifierExpression({name: "if"}));
    invalidExpr(1, new Shift.IdentifierExpression({name: "var"}));
    invalidExpr(1, new Shift.IdentifierExpression({name: "function"}));
  });

  test("FunctionExpression name must not be a reserved word other than let and yield", () => {
    validExpr(new Shift.FunctionExpression({name: null, isGenerator: false, params: new Shift.FormalParameters({items: [], rest: null}), body: new Shift.FunctionBody({directives: [], statements: []})}));
    validExpr(new Shift.FunctionExpression({name: BI, isGenerator: false, params: new Shift.FormalParameters({items: [], rest: null}), body: new Shift.FunctionBody({directives: [], statements: []})}));
    invalidExpr(1, new Shift.FunctionExpression({name: new Shift.BindingIdentifier({name: "if"}), isGenerator: false, params: new Shift.FormalParameters({items: [], rest: null}), body: new Shift.FunctionBody({directives: [], statements: []})}));
  });

  test("FunctionDeclaration name must not be a reserved word other than let and yield", () => {
    validStmt(new Shift.FunctionDeclaration({name: BI, isGenerator: false, params: new Shift.FormalParameters({items: [], rest: null}), body: new Shift.FunctionBody({directives: [], statements: []})}));
    invalidStmt(1, new Shift.FunctionDeclaration({name: new Shift.BindingIdentifier({name: "if"}), isGenerator: false, params: new Shift.FormalParameters({items: [], rest: null}), body: new Shift.FunctionBody({directives: [], statements: []})}));
  });

  test("FunctionExpression parameters must not be reserved words other than let and yield", () => {
    validExpr(new Shift.FunctionExpression({name: null, isGenerator: false, params: new Shift.FormalParameters({items: [], rest: null}), body: new Shift.FunctionBody({directives: [], statements: []})}));
    validExpr(new Shift.FunctionExpression({name: null, isGenerator: false, params: new Shift.FormalParameters({items: [BI], rest: null}), body: new Shift.FunctionBody({directives: [], statements: []})}));
    invalidExpr(1, new Shift.FunctionExpression({name: null, isGenerator: false, params: new Shift.FormalParameters({items: [new Shift.BindingIdentifier({name: "if"})], rest: null}), body: new Shift.FunctionBody({directives: [], statements: []})}));
    invalidExpr(1, new Shift.FunctionExpression({name: null, isGenerator: false, params: new Shift.FormalParameters({items: [BI, new Shift.BindingIdentifier({name: "if"})], rest: null}), body: new Shift.FunctionBody({directives: [], statements: []})}));
    invalidExpr(1, new Shift.FunctionExpression({name: null, isGenerator: false, params: new Shift.FormalParameters({items: [new Shift.BindingIdentifier({name: "if"}), BI], rest: null}), body: new Shift.FunctionBody({directives: [], statements: []})}));
  });

  test("FunctionDeclaration parameters must not be reserved words other than let and yield", () => {
    validStmt(new Shift.FunctionDeclaration({name: BI, isGenerator: false, params: new Shift.FormalParameters({items: [], rest: null}), body: new Shift.FunctionBody({directives: [], statements: []})}));
    validStmt(new Shift.FunctionDeclaration({name: BI, isGenerator: false, params: new Shift.FormalParameters({items: [BI], rest: null}), body: new Shift.FunctionBody({directives: [], statements: []})}));
    invalidStmt(1, new Shift.FunctionDeclaration({name: BI, isGenerator: false, params: new Shift.FormalParameters({items: [new Shift.BindingIdentifier({name: "if"})], rest: null}), body: new Shift.FunctionBody({directives: [], statements: []})}));
    invalidStmt(1, new Shift.FunctionDeclaration({name: BI, isGenerator: false, params: new Shift.FormalParameters({items: [BI, new Shift.BindingIdentifier({name: "if"})], rest: null}), body: new Shift.FunctionBody({directives: [], statements: []})}));
    invalidStmt(1, new Shift.FunctionDeclaration({name: BI, isGenerator: false, params: new Shift.FormalParameters({items: [new Shift.BindingIdentifier({name: "if"}), BI], rest: null}), body: new Shift.FunctionBody({directives: [], statements: []})}));
  });

  test("Setter parameter must not be a reserved word other than let and yield", () => {
    validExpr(new Shift.ObjectExpression({properties: [new Shift.Setter({name: new Shift.StaticPropertyName({value: ID}), param: BI, body: new Shift.FunctionBody({directives: [], statements: []})})]}));
    invalidExpr(1, new Shift.ObjectExpression({properties: [new Shift.Setter({name: new Shift.StaticPropertyName({value: ID}), param: new Shift.BindingIdentifier({name: "if"}), body: new Shift.FunctionBody({directives: [], statements: []})})]}));
  });

  test("IfStatement with null `alternate` must not be the `consequent` of an IfStatement with a non-null `alternate`", () => {
    validStmt(new Shift.IfStatement({test: EXPR, consequent: new Shift.DoWhileStatement({body: new Shift.IfStatement({test: EXPR, consequent: STMT, alternate: null}), test: EXPR}), alternate: STMT}));
    validStmt(new Shift.IfStatement({test: EXPR, consequent: new Shift.IfStatement({test: EXPR, consequent: STMT, alternate: STMT}), alternate: STMT}));
    validStmt(new Shift.IfStatement({test: EXPR, consequent: new Shift.IfStatement({test: EXPR, consequent: STMT, alternate: null}), alternate: null}));
    invalidStmt(1, new Shift.IfStatement({test: EXPR, consequent: new Shift.IfStatement({test: EXPR, consequent: STMT, alternate: null}), alternate: STMT}));
    invalidStmt(1, new Shift.IfStatement({test: EXPR, consequent: new Shift.IfStatement({test: EXPR, consequent: STMT, alternate: new Shift.IfStatement({test: EXPR, consequent: STMT, alternate: null})}), alternate: STMT}));
    invalidStmt(1, new Shift.IfStatement({test: EXPR, consequent: new Shift.IfStatement({test: EXPR, consequent: new Shift.IfStatement({test: EXPR, consequent: STMT, alternate: null}), alternate: null}), alternate: STMT}));
    invalidStmt(1, new Shift.IfStatement({test: EXPR, consequent: new Shift.LabeledStatement({label: ID, body: new Shift.IfStatement({test: EXPR, consequent: STMT, alternate: null})}), alternate: STMT}));
    invalidStmt(1, new Shift.IfStatement({test: EXPR, consequent: new Shift.WhileStatement({test: EXPR, body: new Shift.IfStatement({test: EXPR, consequent: STMT, alternate: null})}), alternate: STMT}));
    invalidStmt(1, new Shift.IfStatement({test: EXPR, consequent: new Shift.WithStatement({object: EXPR, body: new Shift.IfStatement({test: EXPR, consequent: STMT, alternate: null})}), alternate: STMT}));
    invalidStmt(1, new Shift.IfStatement({test: EXPR, consequent: new Shift.ForStatement({init: EXPR, test: EXPR, update: EXPR, body: new Shift.IfStatement({test: EXPR, consequent: STMT, alternate: null})}), alternate: STMT}));
    invalidStmt(1, new Shift.IfStatement({test: EXPR, consequent: new Shift.ForInStatement({left: ATI, right: EXPR, body: new Shift.IfStatement({test: EXPR, consequent: STMT, alternate: null})}), alternate: STMT}));
    invalidStmt(1, new Shift.IfStatement({test: EXPR, consequent: new Shift.ForOfStatement({left: ATI, right: EXPR, body: new Shift.IfStatement({test: EXPR, consequent: STMT, alternate: null})}), alternate: STMT}));
  });

  test("LiteralNumericExpression nodes must not be NaN", () => {
    invalidExpr(1, new Shift.LiteralNumericExpression({value: 0/0}));
  });

  test("LiteralNumericExpression nodes must be non-negative", () => {
    validExpr(new Shift.LiteralNumericExpression({value: 0.0}));
    invalidExpr(1, new Shift.LiteralNumericExpression({value: -1}));
    invalidExpr(1, new Shift.LiteralNumericExpression({value: -1e308}));
    invalidExpr(1, new Shift.LiteralNumericExpression({value: -1e-308}));
    invalidExpr(1, new Shift.LiteralNumericExpression({value: -0.0}));
  });

  test("LiteralNumericExpression nodes must be finite", () => {
    invalidExpr(1, new Shift.LiteralNumericExpression({value: 1/0}));
    invalidExpr(2, new Shift.LiteralNumericExpression({value: -1/0}));
  });

  test("ReturnStatement must be nested within a FunctionExpression or FunctionDeclaration or Getter or Setter node", () => {
    validExpr(new Shift.FunctionExpression({name: null, isGenerator: false, params: new Shift.FormalParameters({items: [], rest: null}), body: new Shift.FunctionBody({directives: [], statements: [new Shift.ReturnStatement({expression: null})]})}));
    validStmt(new Shift.FunctionDeclaration({name: BI, isGenerator: false, params: new Shift.FormalParameters({items: [], rest: null}), body: new Shift.FunctionBody({directives: [], statements: [new Shift.ReturnStatement({expression: null})]})}));
    validExpr(new Shift.ObjectExpression({properties: [new Shift.Getter({name: new Shift.StaticPropertyName({value: ID}), body: new Shift.FunctionBody({directives: [], statements: [new Shift.ReturnStatement({expression: null})]})})]}));
    validExpr(new Shift.ObjectExpression({properties: [new Shift.Setter({name: new Shift.StaticPropertyName({value: ID}), param: BI, body: new Shift.FunctionBody({directives: [], statements: [new Shift.ReturnStatement({expression: null})]})})]}));
    invalidStmt(1, new Shift.ReturnStatement({expression: null}));
  });

  test("Labels must be valid identifier names", () => {
    validStmt(new Shift.LabeledStatement({label: ID, body: new Shift.WhileStatement({test: EXPR, body: new Shift.BlockStatement({block: new Shift.Block({statements: [new Shift.BreakStatement({label: ID})]})})})}));
    invalidStmt(1, new Shift.LabeledStatement({label: ID, body: new Shift.WhileStatement({test: EXPR, body: new Shift.BlockStatement({block: new Shift.Block({statements: [new Shift.BreakStatement({label: "1"})]})})})}));
    invalidStmt(1, new Shift.LabeledStatement({label: "1", body: new Shift.WhileStatement({test: EXPR, body: new Shift.BlockStatement({block: new Shift.Block({statements: [new Shift.BreakStatement({label: ID})]})})})}));
    invalidStmt(2, new Shift.LabeledStatement({label: "1", body: new Shift.WhileStatement({test: EXPR, body: new Shift.BlockStatement({block: new Shift.Block({statements: [new Shift.BreakStatement({label: "1"})]})})})}));

    validStmt(new Shift.LabeledStatement({label: ID, body: new Shift.WhileStatement({test: EXPR, body: new Shift.BlockStatement({block: new Shift.Block({statements: [new Shift.ContinueStatement({label: ID})]})})})}));
    invalidStmt(1, new Shift.LabeledStatement({label: ID, body: new Shift.WhileStatement({test: EXPR, body: new Shift.BlockStatement({block: new Shift.Block({statements: [new Shift.ContinueStatement({label: "1"})]})})})}));
  });

  test("Directive must be a string literal", () => {
    let directive = new Shift.Directive({rawValue: ""});
    let script = new Shift.Script({directives: [directive], statements: []});
    valid(script);
    directive.rawValue = '"';
    valid(script);
    directive.rawValue = "'";
    valid(script);
    directive.rawValue = "\"\\'\\n\\\\";
    valid(script);
    directive.rawValue = "\n";
    invalid(1, script);
    directive.rawValue = "\r";
    invalid(1, script);
    directive.rawValue = "\\";
    invalid(1, script);
    directive.rawValue = "\"\'";
    invalid(1, script);
  });

  test("Exported names must be sane", () => {
    let specifier = new Shift.ExportFromSpecifier({name: ID, exportedName: "if"});
    let exportFrom = new Shift.ExportFrom({namedExports: [specifier], moduleSpecifier: "if"});
    let module = new Shift.Module({directives: [], items: [exportFrom]});
    valid(module);

    specifier.name = "1";
    invalid(1, module);

    specifier.name = ID;
    specifier.exportedName = "%";
    invalid(1, module);
  });

  test("Exported local names must be sane", () => {
    let specifier = new Shift.ExportLocalSpecifier({name: IE, exportedName: "if"});
    let exportFrom = new Shift.ExportLocals({namedExports: [specifier]});
    let module = new Shift.Module({directives: [], items: [exportFrom]});
    valid(module);

    specifier.exportedName = "%";
    invalid(1, module);
  });

  test("ForIn variable declarator must be sane", () => {
    let declarator = new Shift.VariableDeclarator({binding: BI, init: null});
    let declaration = new Shift.VariableDeclaration({kind: "const", declarators: [declarator]});
    let forin = new Shift.ForInStatement({left: declaration, right: EXPR, body: STMT});
    validStmt(forin);

    declaration.declarators = [declarator, declarator];
    invalidStmt(1, forin);

    declaration.declarators = [declarator];
    declarator.init = EXPR;
    invalidStmt(1, forin);
  });

  test("ForOf variable declarator must be sane", () => {
    let declarator = new Shift.VariableDeclarator({binding: BI, init: null});
    let declaration = new Shift.VariableDeclaration({kind: "const", declarators: [declarator]});
    let forof = new Shift.ForOfStatement({left: declaration, right: EXPR, body: STMT});
    validStmt(forof);

    declaration.declarators = [declarator, declarator];
    invalidStmt(1, forof);

    declaration.declarators = [declarator];
    declarator.init = EXPR;
    invalidStmt(1, forof);
  });

  test("Imported names must be sane", () => {
    let specifier = new Shift.ImportSpecifier({name: ID, binding: BI});
    let module = new Shift.Module({directives: [], items: [new Shift.Import({moduleSpecifier: ID, defaultBinding: null, namedImports: [specifier]})]});
    valid(module);

    specifier.name = "1";
    invalid(1, module);
  });

  test("Static property names must be identifiers", () => {
    let expr = new Shift.StaticMemberExpression({object: EXPR, property: "if"});
    validExpr(expr);

    expr.property = "1";
    invalidExpr(1, expr);

    expr.property = "a^";
    invalidExpr(1, expr);
  });

  test("TemplateElements must not contain forbidden substrings", () => {
    let ele = new Shift.TemplateElement({rawValue: ""});
    let expr = new Shift.TemplateExpression({tag: null, elements: [ele]});
    validExpr(expr);

    ele.rawValue = "\\${";
    validExpr(expr);

    ele.rawValue = "\\`";
    validExpr(expr);

    ele.rawValue = "${";
    invalidExpr(1, expr);

    ele.rawValue = "a`b";
    invalidExpr(1, expr);

    ele.rawValue = "a${b}c";
    invalidExpr(1, expr);
  });

  test("TemplateExpressions must alternate TemplateElements and Expressions", () => {
    let ele = new Shift.TemplateElement({rawValue: ""});
    let texpr = new Shift.LiteralNullExpression;
    let expr = new Shift.TemplateExpression({tag: null, elements: [ele, texpr, ele]});
    validExpr(expr);

    expr.elements = [texpr];
    invalidExpr(1, expr);

    expr.elements = [ele, texpr];
    invalidExpr(1, expr);

    expr.elements = [texpr, ele];
    invalidExpr(1, expr);

    expr.elements = [ele, texpr, ele, texpr];
    invalidExpr(1, expr);
  });

  test("VariableDeclarations must declare something", () => {
    let declarator = new Shift.VariableDeclarator({binding: BI, init: null});
    let declaration = new Shift.VariableDeclaration({kind: "let", declarators: [declarator, declarator]});
    let stmt = new Shift.VariableDeclarationStatement({declaration});
    validStmt(stmt);

    declaration.declarators = [];
    invalidStmt(1, stmt);
  });

  test("Const declaration must have init", () => {
    let declarator = new Shift.VariableDeclarator({binding: BI, init: EXPR});
    let declaration = new Shift.VariableDeclaration({kind: "const", declarators: [declarator]});
    let stmt = new Shift.VariableDeclarationStatement({declaration});
    validStmt(stmt);

    declarator.init = null;
    invalidStmt(1, stmt);
  });

  test("Binding identifiers named '*default*' must only appear as names of default-exported functions or classes", () => {
    let binding = new Shift.BindingIdentifier({name: "*default*"});
    let exportDefault = new Shift.ExportDefault({body: new Shift.FunctionDeclaration({name: binding, isGenerator: false, params: new Shift.FormalParameters({items: [], rest: null}), body: new Shift.FunctionBody({directives: [], statements: []})})});
    let module = new Shift.Module({directives: [], items: [exportDefault]});
    valid(module);

    exportDefault.body = new Shift.ClassDeclaration({name: binding, super: null, elements: []});
    valid(module);

    exportDefault.body = new Shift.FunctionExpression({name: binding, isGenerator: false, params: new Shift.FormalParameters({items: [], rest: null}), body: new Shift.FunctionBody({directives: [], statements: []})});
    invalid(1, module);

    exportDefault.body = new Shift.ClassExpression({name: binding, super: null, elements: []});
    invalid(1, module);
  });

  test("Return statements must only appear in function body", () => {
    let returnStmt = new Shift.ReturnStatement({expression: null});
    invalidStmt(1, returnStmt);
    invalidStmt(1, block(returnStmt));

    let body = new Shift.FunctionBody({directives: [], statements: [returnStmt]});
    validStmt(new Shift.FunctionDeclaration({name: BI, isGenerator: false, params: new Shift.FormalParameters({items: [], rest: null}), body})); 
    validExpr(new Shift.FunctionExpression({name: BI, isGenerator: false, params: new Shift.FormalParameters({items: [], rest: null}), body})); 
    validExpr(new Shift.ArrowExpression({params: new Shift.FormalParameters({items: [], rest: null}), body})); 
  });

  test("Yield expressions must only appear in generators", () => {
    let yieldExpr = new Shift.YieldExpression({expression: null});
    let body = new Shift.FunctionBody({directives: [], statements: [new Shift.ExpressionStatement({expression: yieldExpr})]});
    invalidExpr(1, yieldExpr);

    let fnExpr = new Shift.FunctionExpression({name: null, isGenerator: true, params: new Shift.FormalParameters({items: [], rest: null}), body});
    validExpr(fnExpr);

    fnExpr.isGenerator = false;
    invalidExpr(1, fnExpr);

    let fnDecl = new Shift.FunctionDeclaration({name: BI, isGenerator: true, params: new Shift.FormalParameters({items: [], rest: null}), body});
    validStmt(fnDecl);

    fnDecl.isGenerator = false;
    invalidStmt(1, fnDecl);

    let method = new Shift.Method({name: new Shift.StaticPropertyName({value: ID}), isGenerator: true, params: new Shift.FormalParameters({items: [], rest: null}), body});
    let objExpr = new Shift.ObjectExpression({properties: [method]});
    validExpr(objExpr);

    method.isGenerator = false;
    invalidExpr(1, objExpr);
  });

  test("Yield generator expressions must only appear in generators", () => {
    let yieldExpr = new Shift.YieldGeneratorExpression({expression: EXPR});
    let body = new Shift.FunctionBody({directives: [], statements: [new Shift.ExpressionStatement({expression: yieldExpr})]});
    invalidExpr(1, yieldExpr);

    let fnExpr = new Shift.FunctionExpression({name: null, isGenerator: true, params: new Shift.FormalParameters({items: [], rest: null}), body});
    validExpr(fnExpr);

    fnExpr.isGenerator = false;
    invalidExpr(1, fnExpr);

    let fnDecl = new Shift.FunctionDeclaration({name: BI, isGenerator: true, params: new Shift.FormalParameters({items: [], rest: null}), body});
    validStmt(fnDecl);

    fnDecl.isGenerator = false;
    invalidStmt(1, fnDecl);

    let method = new Shift.Method({name: new Shift.StaticPropertyName({value: ID}), isGenerator: true, params: new Shift.FormalParameters({items: [], rest: null}), body});
    let objExpr = new Shift.ObjectExpression({properties: [method]});
    validExpr(objExpr);

    method.isGenerator = false;
    invalidExpr(1, objExpr);
  });

  test("Yield must not be contained in ArrowExpressions", () => {
    let yieldExpr = new Shift.YieldExpression({expression: null});
    let params = new Shift.FormalParameters({items: [new Shift.BindingWithDefault({binding: new Shift.BindingIdentifier({name: "a"}), init: new Shift.LiteralNullExpression})], rest: null});
    let arrow = new Shift.ArrowExpression({params, body: new Shift.LiteralNullExpression});

    let body = new Shift.FunctionBody({directives: [], statements: [new Shift.ExpressionStatement({expression: arrow})]});
    let fnExpr = new Shift.FunctionExpression({name: null, isGenerator: true, params: new Shift.FormalParameters({items: [], rest: null}), body});

    validExpr(fnExpr);

    params.items[0].init = yieldExpr;
    invalidExpr(1, fnExpr);

    params.items[0].init = new Shift.LiteralNullExpression;
    arrow.body = yieldExpr;
    invalidExpr(1, fnExpr);
  });

  test("Yield must not be the computed name of a generator method outside of a generator context", () => {
    let yieldExpr = new Shift.YieldExpression({expression: null});
    let obj = new Shift.ObjectExpression({properties: [new Shift.Method({isGenerator: true, name: new Shift.ComputedPropertyName({expression: yieldExpr}), params: new Shift.FormalParameters({items: [], rest: null}), body: new Shift.FunctionBody({directives: [], statements: []})})]});

    let body = new Shift.FunctionBody({directives: [], statements: [new Shift.ExpressionStatement({expression: obj})]});
    let fnExpr = new Shift.FunctionExpression({name: null, isGenerator: true, params: new Shift.FormalParameters({items: [], rest: null}), body});

    validExpr(fnExpr);

    fnExpr.isGenerator = false;
    invalidExpr(1, fnExpr);
  });

  test("Yield must not be in a nested non-generator function", () => {
    let emptyParams = new Shift.FormalParameters({items: [], rest: null});
    let yieldBody = new Shift.FunctionBody({
      directives: [],
      statements: [new Shift.ExpressionStatement({expression: new Shift.YieldExpression({expression: null})})]
    });
    let nested = [new Shift.FunctionDeclaration({name: BI, isGenerator: true, params: emptyParams, body: yieldBody})];

    let outer = new Shift.FunctionDeclaration({name: BI, isGenerator: true, params: emptyParams, body: new Shift.FunctionBody({
      directives: [],
      statements: nested
    })});

    validStmt(outer);

    nested[0].isGenerator = false;
    invalidStmt(1, outer);

    nested[0] = new Shift.ExpressionStatement({expression: new Shift.FunctionExpression({name: BI, isGenerator: true, params: emptyParams, body: yieldBody})})
    validStmt(outer);

    nested[0].expression.isGenerator = false;
    invalidStmt(1, outer);

    nested[0] = new Shift.ObjectExpression({properties: [new Shift.Getter({name: new Shift.StaticPropertyName({value: ID}), body: yieldBody})]});
    invalidStmt(1, outer);

    nested[0] = new Shift.ObjectExpression({properties: [new Shift.Setter({name: new Shift.StaticPropertyName({value: ID}), param: BI, body: yieldBody})]});
    invalidStmt(1, outer);
  });
});

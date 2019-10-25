module.exports = {
    "env": {
        "es6": true,
        "node": true
    },
    "parser": "@typescript-eslint/parser",
    "parserOptions": {
        "project": "tsconfig.json",
        "sourceType": "module"
    },
    "plugins": [
        "@typescript-eslint",
        "@typescript-eslint/tslint"
    ],
    "rules": {
        "@typescript-eslint/adjacent-overload-signatures": "warn",
        "@typescript-eslint/array-type": "warn",
        "@typescript-eslint/ban-types": "warn",
        "@typescript-eslint/class-name-casing": "warn",
        "@typescript-eslint/explicit-member-accessibility": [
            "warn",
            {
                "overrides": {
                    "constructors": "off"
                }
            }
        ],
        "@typescript-eslint/indent": "off",
        "@typescript-eslint/interface-name-prefix": "warn",
        "@typescript-eslint/member-delimiter-style": "off",
        "@typescript-eslint/no-angle-bracket-type-assertion": "warn",
        "@typescript-eslint/no-empty-interface": "warn",
        "@typescript-eslint/no-explicit-any": "off",
        "@typescript-eslint/no-misused-new": "warn",
        "@typescript-eslint/no-namespace": "off",
        "@typescript-eslint/no-object-literal-type-assertion": "warn",
        "@typescript-eslint/no-parameter-properties": "off",
        "@typescript-eslint/no-this-alias": "warn",
        "@typescript-eslint/no-triple-slash-reference": "warn",
        "@typescript-eslint/no-use-before-declare": "off",
        "@typescript-eslint/no-var-requires": "warn",
        "@typescript-eslint/prefer-for-of": "warn",
        "@typescript-eslint/prefer-function-type": "warn",
        "@typescript-eslint/prefer-interface": "warn",
        "@typescript-eslint/prefer-namespace-keyword": "warn",
        "@typescript-eslint/type-annotation-spacing": "off",
        "@typescript-eslint/unified-signatures": "warn",
        "arrow-body-style": "warn",
        "arrow-parens": [
            "off",
            "as-needed"
        ],
        "complexity": "off",
        "constructor-super": "warn",
        "curly": "warn",
        "dot-notation": "warn",
        "eol-last": "off",
        "guard-for-in": "warn",
        "linebreak-style": "off",
        "max-classes-per-file": [
            "warn",
            1
        ],
        "member-ordering": "warn",
        "new-parens": "off",
        "newline-per-chained-call": "off",
        "no-bitwise": "warn",
        "no-caller": "warn",
        "no-cond-assign": "warn",
        "no-console": "warn",
        "no-debugger": "warn",
        "no-duplicate-case": "warn",
        "no-empty": "off",
        "no-empty-functions": "off",
        "no-eval": "warn",
        "no-extra-bind": "warn",
        "no-extra-semi": "off",
        "no-fallthrough": "off",
        "no-invalid-this": "off",
        "no-irregular-whitespace": "off",
        "no-multiple-empty-lines": "off",
        "no-new-func": "warn",
        "no-new-wrappers": "warn",
        "no-return-await": "warn",
        "no-sequences": "warn",
        "no-sparse-arrays": "warn",
        "no-template-curly-in-string": "warn",
        "no-throw-literal": "warn",
        "no-undef-init": "warn",
        "no-unsafe-finally": "warn",
        "no-unused-labels": "warn",
        "no-var": "warn",
        "object-shorthand": "warn",
        "one-var": "warn",
        "prefer-const": "warn",
        "prefer-object-spread": "warn",
        "quote-props": "off",
        "radix": "warn",
        "space-before-function-paren": "off",
        "use-isnan": "warn",
        "valid-typeof": "off",
        "@typescript-eslint/tslint/config": [
            "error",
            {
                "rules": {
                    "comment-format": [
                        true,
                        "check-space"
                    ],
                    "jsdoc-format": [
                        true,
                        "check-multiline-start"
                    ],
                    "no-duplicate-imports": true,
                    "no-duplicate-variable": true,
                    "no-reference-import": true,
                    "no-submodule-imports": true,
                    "no-unused-expression": true,
                    "only-arrow-functions": [
                        true,
                        "allow-declarations",
                        "allow-named-functions"
                    ],
                    "prefer-conditional-expression": true,
                    "semicolon": [
                        true,
                        "always"
                    ],
                    "triple-equals": true,
                    "variable-name": [
                        true,
                        "allow-leading-underscore"
                    ]
                }
            }
        ]
    }
};

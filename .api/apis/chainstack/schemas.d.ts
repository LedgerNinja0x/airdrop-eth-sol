declare const GetTokenAccountBalance: {
    readonly body: {
        readonly type: "object";
        readonly properties: {
            readonly id: {
                readonly type: "integer";
                readonly default: 1;
            };
            readonly jsonrpc: {
                readonly type: "string";
                readonly default: "2.0";
            };
            readonly method: {
                readonly type: "string";
                readonly default: "getTokenAccountBalance";
            };
            readonly params: {
                readonly type: "array";
                readonly default: readonly ["3emsAVdmGKERbHjmGfQ6oZ1e35dkf5iYcS6U4CPKFVaa"];
                readonly items: {};
            };
        };
        readonly $schema: "http://json-schema.org/draft-04/schema#";
    };
    readonly response: {
        readonly "200": {
            readonly type: "object";
            readonly properties: {
                readonly jsonrpc: {
                    readonly type: "string";
                };
                readonly id: {
                    readonly type: "integer";
                };
                readonly result: {
                    readonly type: "object";
                    readonly additionalProperties: true;
                };
            };
            readonly $schema: "http://json-schema.org/draft-04/schema#";
        };
    };
};
export { GetTokenAccountBalance };

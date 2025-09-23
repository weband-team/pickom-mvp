export declare class AppController {
    getInfo(): {
        message: string;
        version: string;
        mode: string;
        documentation: string;
        testPage: string;
        endpoints: {
            auth: {
                login: string;
                me: string;
                logout: string;
            };
        };
        firebase: {
            initialized: boolean;
            mode: string;
        };
    };
}

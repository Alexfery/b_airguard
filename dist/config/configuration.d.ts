declare const _default: () => {
    port: number;
    corsOrigin: string;
    jwt: {
        secret: string;
        expiresIn: string;
    };
    supabase: {
        url: string;
        serviceKey: string;
    };
    mqtt: {
        host: string;
        port: number;
        username: string;
        password: string;
        clientId: string;
    };
};
export default _default;

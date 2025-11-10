import { Request as ExpressRequest, Response as ExpressResponse } from 'express';

declare global {
    namespace Express {
        interface Request extends ExpressRequest {
            body: any;
            query: any;
            params: any;
        }

        interface Response extends ExpressResponse {
            json: (body: any) => this;
            status: (code: number) => this;
            send: (body?: any) => this;
            header: (field: string, value?: string) => this;
            setHeader: (name: string, value: string) => this;
            attachment: (filename?: string) => this;
            write: (chunk: any) => boolean;
            end: (cb?: () => void) => void;
        }
    }
}
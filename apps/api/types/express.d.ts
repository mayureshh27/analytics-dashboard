declare namespace Express {
    export interface Request {
        body: any;
        query: any;
        params: any;
    }

    export interface Response {
        json(body: any): this;
        status(code: number): this;
        send(body?: any): this;
        header(field: string, value?: string): this;
        setHeader(name: string, value: string): this;
        attachment(filename?: string): this;
        write(chunk: any): boolean;
        end(cb?: () => void): this;
    }
}
/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

import * as SMTPTransport from "nodemailer/lib/smtp-transport";
import * as SMTPPool from "nodemailer/lib/smtp-pool";
import * as SendmailTransport from "nodemailer/lib/sendmail-transport";
import * as StreamTransport from "nodemailer/lib/stream-transport";
import * as JSONTransport from "nodemailer/lib/json-transport";
import * as SESTransport from "nodemailer/lib/ses-transport";
import {Transport, TransportOptions, Transporter, createTransport, SentMessageInfo} from "nodemailer";
import {ServiceModule} from "zation-service";
import {SmallBag, Bag} from "zation-server";
import {Options} from "nodemailer/lib/mailer";

const serviceName = "NodeMailer";

export type NodeMailerConfig = (
    SMTPTransport | SMTPTransport.Options |
    SMTPPool | SMTPPool.Options |
    SendmailTransport | SendmailTransport.Options |
    StreamTransport | StreamTransport.Options |
    JSONTransport | JSONTransport.Options |
    SESTransport | SESTransport.Options |
    Transport | TransportOptions
    );

export namespace NodeMailerModule {

    export function build(configs: Record<string, NodeMailerConfig> | DefaultConfig<NodeMailerConfig>): ServiceModule<NodeMailerConfig, Transporter, {}> {
        const service: any = configs;
        service.get = undefined;
        service.create = async (c): Promise<Transporter> => {
            const transport = createTransport(c);
            await new Promise<void | string>((resolve, reject) => {
                transport.verify(function (err) {
                    if (err) {
                        reject(err);
                    } else {
                        resolve();
                    }
                });
            });
            return transport;
        };

        return {
            serviceName: serviceName,
            service: service,
            bagExtensions: {
                smallBag: {
                    sendMail: async function(this: SmallBag,mailOptions : Options,serviceKey : string = 'default') : Promise<SentMessageInfo> {
                        return new Promise<SentMessageInfo>(async (resolve, reject) => {
                            const service = await this.getService<Transporter>(serviceName, serviceKey);
                            service.sendMail(mailOptions,(error, info) => {
                                if(error) {reject(error);}
                                else {resolve(info);}
                            });
                        });
                    },
                    getNodeMailer: async function (this: SmallBag, serviceKey: string = 'default'): Promise<Transporter> {
                        return await this.getService<Transporter>(serviceName, serviceKey);
                    },
                    isNodeMailer: function (this: SmallBag, serviceKey: string = 'default'): boolean {
                        return this.isService(serviceName, serviceKey);
                    }
                },
                bag: {}
            }
        };
    }

}

interface DefaultConfig<T> {
    default?: T;
}

declare module 'zation-server' {
    export interface SmallBag {
        // noinspection JSUnusedGlobalSymbols
        /**
         * @description
         * Send an email, with the node mailer service.
         * Throws an ServiceNotFoundError if the service is not found.
         * @example
         * let mailOptions = {
         *  from: '"Fred Foo 👻" <foo@example.com>', // sender address
         *  to: 'bar@example.com, baz@example.com', // list of receivers
         *  subject: 'Hello ✔', // Subject line
         *  text: 'Hello world?', // plain text body
         *  html: '<b>Hello world?</b>' // html body
         *  };
         * const info = await sendMail(mailOptions);
         * @throws ServiceNotFoundError
         * @param mailOptions
         * @param  serviceKey
         * @return Promise<object>
         * The object is an info object.
         */
        sendMail: (mailOptions: Options, serviceKey ?: string) => Promise<SentMessageInfo>;
        // noinspection JSUnusedGlobalSymbols
        /**
         * @description
         * Returns this service, if it exist otherwise it will throw an ServiceNotFoundError error.
         * @throws ServiceNotFoundError
         * @param  serviceKey
         * the key to the service.
         */
        getNodeMailer: (serviceKey ?: string) => Promise<Transporter>;
        // noinspection JSUnusedGlobalSymbols
        /**
         * @description
         * Checks if the service with this key is exist and can be used.
         * @param  serviceKey
         * the key to the service.
         */
        isNodeMailer: (serviceKey ?: string) => boolean;
    }

    export interface Bag {
        // noinspection JSUnusedGlobalSymbols
        /**
         * @description
         * Send an email, with the node mailer service.
         * Throws an ServiceNotFoundError if the service is not found.
         * @example
         * let mailOptions = {
         *  from: '"Fred Foo 👻" <foo@example.com>', // sender address
         *  to: 'bar@example.com, baz@example.com', // list of receivers
         *  subject: 'Hello ✔', // Subject line
         *  text: 'Hello world?', // plain text body
         *  html: '<b>Hello world?</b>' // html body
         *  };
         * const info = await sendMail(mailOptions);
         * @throws ServiceNotFoundError
         * @param mailOptions
         * @param  serviceKey
         * @return Promise<object>
         * The object is an info object.
         */
        sendMail: (mailOptions: Options, serviceKey ?: string) => Promise<SentMessageInfo>;
        // noinspection JSUnusedGlobalSymbols
        /**
         * @description
         * Returns this service, if it exist otherwise it will throw an ServiceNotFoundError error.
         * @throws ServiceNotFoundError
         * @param  serviceKey
         * the key to the service.
         */
        getNodeMailer: (serviceKey ?: string) => Promise<Transporter>;
        // noinspection JSUnusedGlobalSymbols
        /**
         * @description
         * Checks if the service with this key is exist and can be used.
         * @param  serviceKey
         * the key to the service.
         */
        isNodeMailer: (serviceKey ?: string) => boolean;
    }
}


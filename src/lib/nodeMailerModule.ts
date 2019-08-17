/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import * as SMTPTransport     from "nodemailer/lib/smtp-transport";
import * as SMTPPool          from "nodemailer/lib/smtp-pool";
import * as SendmailTransport from "nodemailer/lib/sendmail-transport";
import * as StreamTransport   from "nodemailer/lib/stream-transport";
import * as JSONTransport     from "nodemailer/lib/json-transport";
import * as SESTransport      from "nodemailer/lib/ses-transport";
import {Transport, TransportOptions, Transporter, createTransport, SentMessageInfo} from "nodemailer";
import {ServiceModule}              from "zation-service";
import {Bag,RequestBag}             from "zation-server";
import {Options}                    from "nodemailer/lib/mailer";

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

    export function build(configs: Record<string, NodeMailerConfig> | DefaultConfig<NodeMailerConfig>): ServiceModule<NodeMailerConfig, Transporter, {},BagExtension> {
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
                bag : {
                    sendMail: async function(this: Bag,mailOptions : Options,configName : string = 'default') : Promise<SentMessageInfo> {
                        return new Promise<SentMessageInfo>(async (resolve, reject) => {
                            const service = await this.getService<Transporter>(serviceName, configName);
                            service.sendMail(mailOptions,(error, info) => {
                                if(error) {reject(error);}
                                else {resolve(info);}
                            });
                        });
                    },
                    getNodeMailer: async function (this: Bag, configName: string = 'default'): Promise<Transporter> {
                        return await this.getService<Transporter>(serviceName, configName);
                    },
                    isNodeMailer: function (this: Bag, configName: string = 'default'): boolean {
                        return this.isService(serviceName, configName);
                    }
                }
            }
        };
    }

}

interface DefaultConfig<T> {
    default?: T;
}

interface BagExtension {
    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Send an email promise based with a node mailer service.
     * Throws a ServiceNotFoundError if the service is not found.
     * @example
     * const mailOptions = {
     *  from: '"Fred Foo 👻" <foo@example.com>', // sender address
     *  to: 'bar@example.com, baz@example.com', // list of receivers
     *  subject: 'Hello ✔', // Subject line
     *  text: 'Hello world?', // plain text body
     *  html: '<b>Hello world?</b>' // html body
     *  };
     * const info = await sendMail(mailOptions);
     * @throws ServiceNotFoundError
     * @param mailOptions
     * @param configName Default: 'default'
     * @return Promise<object>
     * The object is an info object.
     */
    sendMail: (mailOptions: Options, configName ?: string) => Promise<SentMessageInfo>;
    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Returns the node mailer service, if it exists otherwise, it will throw a ServiceNotFoundError error.
     * @throws ServiceNotFoundError
     * @param  configName Default: 'default'
     */
    getNodeMailer: (configName ?: string) => Promise<Transporter>;
    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * This function returns a boolean that indicates if the node mailer service with the given configuration name exists.
     * @param configName Default: 'default'
     */
    isNodeMailer: (configName ?: string) => boolean;
}

declare module 'zation-server' {
    export interface Bag extends BagExtension {}
    export interface RequestBag extends BagExtension {}
}
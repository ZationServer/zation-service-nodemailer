/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import {Options}                      from "nodemailer/lib/mailer";
import {SentMessageInfo, Transporter} from "nodemailer";
import {registerBagExtension}         from "zation-bag-extension";
import {serviceName}                  from "./constants";
import {Bag}                          from "zation-server";

interface BagExtension {
    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Send an email promise based with a node mailer service instance.
     * Throws a ServiceNotFoundError error if the service instance is not found.
     * @example
     * const mailOptions = {
     *  from: '"Fred Foo 👻" <foo@example.com>', // sender address
     *  to: 'bar@example.com, baz@example.com', // list of receivers
     *  subject: 'Hello ✔', // Subject line
     *  text: 'Hello world?', // plain text body
     *  html: '<b>Hello world?</b>' // html body
     * };
     * const info = await sendMail(mailOptions);
     * @throws ServiceNotFoundError
     * @param mailOptions
     * @param instanceName Default: 'default'
     * @return Promise<SentMessageInfo>
     */
    sendMail: (mailOptions: Options, instanceName?: string) => Promise<SentMessageInfo>;
    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Returns the node mailer service instance, if it exists otherwise,
     * it will throw a ServiceNotFoundError error.
     * @throws ServiceNotFoundError
     * @param instanceName Default: 'default'
     */
    getNodeMailer: (instanceName?: string) => Promise<Transporter>;
    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * This function returns a boolean that indicates if the node mailer
     * service instance exists.
     * @param instanceName Default: 'default'
     */
    hasNodeMailer: (instanceName?: string) => boolean;
}

declare module 'zation-server' {
    export interface Bag extends BagExtension {}
    export interface RequestBag extends BagExtension {}
}

registerBagExtension({
    name: serviceName,
    bag: {
        sendMail: async function(this: Bag,mailOptions: Options,instanceName: string = 'default'): Promise<SentMessageInfo> {
            return new Promise<SentMessageInfo>(async (resolve, reject) => {
                (await this.getService<Transporter>(serviceName, instanceName)).
                sendMail(mailOptions,(error, info) => {
                    error ? reject(error) : resolve(info);
                });
            });
        },
        getNodeMailer: async function (this: Bag, instanceName: string = 'default'): Promise<Transporter> {
            return this.getService<Transporter>(serviceName,instanceName);
        },
        hasNodeMailer: function (this: Bag, instanceName: string = 'default'): boolean {
            return this.hasService(serviceName,instanceName);
        }
    } as BagExtension
});
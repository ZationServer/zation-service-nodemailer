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
import {serviceName}          from "./constants";
import {DefaultInstance, ServicePackage} from "zation-service";
import {Transport, TransportOptions, Transporter, createTransport} from "nodemailer";

export type NodeMailerConfig = (
    SMTPTransport | SMTPTransport.Options |
    SMTPPool | SMTPPool.Options |
    SendmailTransport | SendmailTransport.Options |
    StreamTransport | StreamTransport.Options |
    JSONTransport | JSONTransport.Options |
    SESTransport | SESTransport.Options |
    Transport | TransportOptions);

export namespace NodeMailerPackage {

    /**
     * This build function creates a node mailer service package with
     * the provided instances configuration.
     * You can use this package in the service config.
     * @example
     * export default Config.serviceConfig({
     *     ...NodeMailer.build({
     *         default: {
     *             service: 'gmail',
     *             auth: {
     *                 pass: process.env.EMAIL_PASSWORD,
     *                 user: process.env.EMAIL_USER
     *             },
     *             tsl: {
     *                 rejectUnauthorized: false
     *             }
     *         }
     *    })
     * });
     * @param instances
     */
    export function build(instances: Record<string, NodeMailerConfig> | DefaultInstance<NodeMailerConfig>): ServicePackage<NodeMailerConfig,Transporter> {
        return {
            [serviceName] : {
                create: async (c): Promise<Transporter> => {
                    const transport = createTransport(c);
                    await (new Promise<void | string>((resolve, reject) => {
                        transport.verify((err) => {
                            err ? reject(err) : resolve();
                        });
                    }));
                    return transport;
                },
                instances
            }
        };
    }
}
# zation-service-nodemailer ⚙️
*Zation service for NodeMailer.*
<h1 align="center">  
  <!-- Stability -->
  <a href="https://nodejs.org/api/documentation.html#documentation_stability_index">
    <img src="https://img.shields.io/badge/stability-stable-brightgreen.svg" alt="API Stability"/>
  </a>
  <!-- TypeScript -->
  <a href="http://typescriptlang.org">
    <img src="https://img.shields.io/badge/%3C%2F%3E-typescript-blue.svg" alt="TypeScript"/>
  </a>    
  <!-- Downloads -->
  <a href="https://npmjs.org/package/zation-service-mysql">
    <img src="https://img.shields.io/npm/dm/zation-service-mysql.svg" alt="Downloads"/>
  </a> 
  <!-- Size -->
  <a href="https://npmjs.org/package/zation-service-mysql">
      <img src="https://img.shields.io/bundlephobia/min/zation-service-mysql.svg" alt="Size"/>
  </a>  
</h1>

## What is Zation-service-nodemailer?
***Zation-service-nodemailer*** is a zation service wrapper of the npm package [nodemailer](https://www.npmjs.com/package/nodemailer) for sending emails from a zation server.
This service will automatically create transporters with your provided instance configurations on each worker. 
Also, it will add new functionality to the Bag and RequestBag for easy sending emails or access the transporter instances.

## Install

```bash
$ npm install --save zation-service-nodemailer
```

## Usage

To use this service, you have to define it in the service configuration of your zation server. 
Therefore you must use the build method, and this method requires an instances argument.
In this argument, you can define different transport configurations linked to a name (instanceName). 
The transport options are the same as in the npm module [nodemailer](https://www.npmjs.com/package/nodemailer).  
If you only want to specify one transport or 
you have a primary transport that you will use the most it is recommended to use the default instance name for it.
That will make it later easier to access the transporter because you don't have to provide every time the instance name.

```typescript
import {Config}          from 'zation-server';
import NodeMailerService from "zation-service-nodemailer";

export default Config.serviceConfig({
    ...NodeMailerService.build({
        default: {
            service: 'gmail',
            auth: {
                pass: process.env.EMAIL_PASSWORD,
                user: process.env.EMAIL_USER
            },
            tsl: {
                rejectUnauthorized: false
            }
        }
    })
});
```
In this example code, each worker of the zation server will create the defined transporter in the start process.
After the launch, the transporter can be accessed by using a Bag or RequestBag.
If something goes wrong by creating the transporter, the server won't start or notify you with a log it depends on your configuration of the server.

### Access 
For access to your transporters, you can use one of these new functionalities that will be added to the Bag class.
Notice that this service also adds the typescript definitions and 
that you can use these methods even on the RequestBag class because the RequestBag is extending the Bag.
The new functionalities:

* `getNodeMailer` (`Function (instanceName?: string) => Promise<Transporter>`) - This function returns the transporter instance, if it exists otherwise, it will throw a ServiceNotFoundError error. 
It takes a instance name as an argument if you don't provide one it will use the default instance name.
                                
* `hasNodeMailer` (`Function (instanceName?: string) => boolean`) - This function returns a boolean that indicates if the transporter instance exists. 
If you don't provide a instance name, it will use the default instance name.

* `sendMail` (`Function (mailOptions: Options, instanceName?: string) => Promise<SentMessageInfo>`) - With this function, you can simply send an email promise based by using one of your transporter instances.
Notice that this function can throw a ServiceNotFoundError error if the transporter with the instance name is not found.
The function takes the mailOptions and the instance name as arguments.
If you don't provide a instance name, it will use the default instance name.
```typescript
const mailOptions = {
    from: '"Fred Foo 👻" <foo@example.com>', // sender address
    to: 'bar@example.com, baz@example.com', // list of receivers
    subject: 'Hello ✔', // Subject line
    text: 'Hello world?', // plain text body
    html: '<b>Hello world?</b>' // html body
};
const info = await bag.sendMail(mailOptions);
```

## License

MIT License

Copyright (c) 2019 Luca Scaringella

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.                                                  

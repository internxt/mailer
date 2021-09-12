import SMTPTransport from 'nodemailer/lib/smtp-transport';
import { ContextName } from './context';
interface MailerOptions extends Omit<SMTPTransport.Options, 'from'> {
    sendgrid: {
        api_key: string;
    };
    from: string;
}
declare class Mailer {
    private options;
    private transporter;
    constructor(options: MailerOptions);
    /**
     * Sends the email template to the specified address
     * using SMTP protocol
     * #dispatch
     * @param {String} email
     * @param {String} template
     * @param {Object} context
     * @param {Function} callback
     */
    dispatch(email: string, template: ContextName, context: any, callback: any): void;
    /**
   * Sends the email template to the specified address,
   * using SendGrid API
   * #dispatch
   * @param {String} email
   * @param {String} template
   * @param {Object} context
   * @param {Function} callback
   */
    dispatchSendGrid(email: string, template: ContextName, context: any, callback: (err?: Error) => void): void;
    /**
     * Loads and compiles the mail template
     * #getTemplate
     * @param {String} name
     * @param {Function} callback
     */
    getTemplate(name: string, callback: (err: Error | null, template?: any) => void): void;
    /**
     * Helper for loading email template subject
     * #_getSubject
     * @param {String} name
     * @param {Function} callback
     */
    private getSubject;
    /**
     * Helper for loading email template markup
     * #_getMarkup
     * @param {String} name
     * @param {Function} callback
     */
    private getMarkup;
    /**
     * Helper for loading email template plaintext
     * #_getPlaintext
     * @param {String} name
     * @param {Function} callback
     */
    private getPlaintext;
    /**
     * Helper for loading email template resource
     * #__getTemplateResource
     * @param {String} filename
     * @param {Function} callback
     */
    private getTemplateResource;
}
export default Mailer;

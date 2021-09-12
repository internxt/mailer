"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var path_1 = __importDefault(require("path"));
var fs_1 = __importDefault(require("fs"));
var async_1 = __importDefault(require("async"));
var assert_1 = __importDefault(require("assert"));
var nodemailer_1 = __importDefault(require("nodemailer"));
var handlebars_1 = __importDefault(require("handlebars"));
var mail_1 = __importDefault(require("@sendgrid/mail"));
var Mailer = /** @class */ (function () {
    function Mailer(options) {
        options = options || {};
        if (!options.sendgrid || !options.sendgrid.api_key) {
            assert_1.default.ok(options.host, 'No SMTP host supplied');
            assert_1.default.ok(options.port, 'No SMTP port supplied');
        }
        if (options.sendgrid && options.sendgrid.api_key) {
            mail_1.default.setApiKey(options.sendgrid.api_key);
        }
        this.options = options;
        this.transporter = nodemailer_1.default.createTransport(options);
    }
    /**
     * Sends the email template to the specified address
     * using SMTP protocol
     * #dispatch
     * @param {String} email
     * @param {String} template
     * @param {Object} context
     * @param {Function} callback
     */
    Mailer.prototype.dispatch = function (email, template, context, callback) {
        var _this = this;
        var done = callback || function () { };
        this.getTemplate(template, function (err, template) {
            if (err) {
                return done(err);
            }
            var compiled = template(context);
            var mailparams = {
                to: email,
                from: _this.options.from,
                subject: compiled.subject,
                html: compiled.markup,
                text: compiled.plaintext
            };
            _this.transporter.sendMail(mailparams, done);
        });
    };
    /**
   * Sends the email template to the specified address,
   * using SendGrid API
   * #dispatch
   * @param {String} email
   * @param {String} template
   * @param {Object} context
   * @param {Function} callback
   */
    Mailer.prototype.dispatchSendGrid = function (email, template, context, callback) {
        var _this = this;
        var done = callback || function () { };
        if (!this.options || !this.options.sendgrid || !this.options.sendgrid.api_key) {
            return callback(new Error('No SendGrid API Key provided'));
        }
        this.getTemplate(template, function (err, template) {
            if (err) {
                return done(err);
            }
            var compiled = template(context);
            var mailparams = {
                to: email,
                from: _this.options.from,
                subject: compiled.subject,
                html: compiled.markup,
                text: compiled.plaintext
            };
            mail_1.default.send(mailparams).then(function () {
                callback();
            }).catch(function (err) {
                callback(err);
            });
        });
    };
    /**
     * Loads and compiles the mail template
     * #getTemplate
     * @param {String} name
     * @param {Function} callback
     */
    Mailer.prototype.getTemplate = function (name, callback) {
        assert_1.default.ok(name, 'No template name was supplied');
        var stack = [
            this.getSubject.bind(this, name),
            this.getMarkup.bind(this, name),
            this.getPlaintext.bind(this, name)
        ];
        async_1.default.parallel(stack, function (err, results) {
            if (err) {
                return callback(err);
            }
            callback(null, function render(data) {
                data = data || {};
                return {
                    subject: results[0](data),
                    markup: results[1](data),
                    plaintext: results[2](data)
                };
            });
        });
    };
    ;
    /**
     * Helper for loading email template subject
     * #_getSubject
     * @param {String} name
     * @param {Function} callback
     */
    Mailer.prototype.getSubject = function (name, callback) {
        this.getTemplateResource([name, 'subject'].join('.'), callback);
    };
    ;
    /**
     * Helper for loading email template markup
     * #_getMarkup
     * @param {String} name
     * @param {Function} callback
     */
    Mailer.prototype.getMarkup = function (name, callback) {
        this.getTemplateResource([name, 'html'].join('.'), callback);
    };
    ;
    /**
     * Helper for loading email template plaintext
     * #_getPlaintext
     * @param {String} name
     * @param {Function} callback
     */
    Mailer.prototype.getPlaintext = function (name, callback) {
        this.getTemplateResource([name, 'txt'].join('.'), callback);
    };
    ;
    /**
     * Helper for loading email template resource
     * #__getTemplateResource
     * @param {String} filename
     * @param {Function} callback
     */
    Mailer.prototype.getTemplateResource = function (filename, callback) {
        fs_1.default.exists(path_1.default.join(__dirname, 'templates', filename), function (exists) {
            if (!exists) {
                return callback(new Error('Resource "' + filename + '" does not exist'));
            }
            fs_1.default.readFile(path_1.default.join(__dirname, 'templates', filename), function (err, contents) {
                if (err) {
                    return callback(err);
                }
                callback(null, handlebars_1.default.compile(contents.toString()));
            });
        });
    };
    ;
    return Mailer;
}());
exports.default = Mailer;
module.exports = Mailer;

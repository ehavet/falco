import { Email } from '../../common-api/domain/mailer'
const config = require('../../../config')

export function buildValidationLinkEmail (recipient, uriFr, uriEn): Email {
  return {
    sender: config.get('FALCO_API_APPENIN_EMAIL_ADDRESS'),
    recipient: recipient,
    subject: 'valider votre email',
    messageHtml: _buildValidationMessage(uriEn, uriFr)
  }
}

function _buildValidationMessage (uriEn: string, uriFr: string): string {
  const html = '<!DOCTYPE html>\n' +
      '<html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">\n' +
      '<head>\n' +
      '    <meta charset="utf-8"> <!-- utf-8 works for most cases -->\n' +
      "    <meta name=\"viewport\" content=\"width=device-width\"> <!-- Forcing initial-scale shouldn't be necessary -->\n" +
      '    <meta http-equiv="X-UA-Compatible" content="IE=edge"> <!-- Use the latest (edge) version of IE rendering engine -->\n' +
      '    <meta name="x-apple-disable-message-reformatting">  <!-- Disable auto-scale in iOS 10 Mail entirely -->\n' +
      '    <meta name="format-detection" content="telephone=no,address=no,email=no,date=no,url=no"> <!-- Tell iOS not to automatically link certain text strings. -->\n' +
      '    <meta name="color-scheme" content="light">\n' +
      '    <meta name="supported-color-schemes" content="light">\n' +
      '    <title></title> <!--   The title tag shows in email notifications, like Android 4.4. -->\n' +
      '\n' +
      '    <!-- What it does: Makes background images in 72ppi Outlook render at correct size. -->\n' +
      '    <!--[if gte mso 9]>\n' +
      '    <xml>\n' +
      '        <o:OfficeDocumentSettings>\n' +
      '            <o:AllowPNG/>\n' +
      '            <o:PixelsPerInch>96</o:PixelsPerInch>\n' +
      '        </o:OfficeDocumentSettings>\n' +
      '    </xml>\n' +
      '    <![endif]-->\n' +
      '\n' +
      '    <!-- Web Font / @font-face : BEGIN -->\n' +
      '    <!-- NOTE: If web fonts are not required, lines 23 - 41 can be safely removed. -->\n' +
      '\n' +
      '    <!-- Desktop Outlook chokes on web font references and defaults to Times New Roman, so we force a safe fallback font. -->\n' +
      '    <!--[if mso]>\n' +
      '        <style>\n' +
      '            * {\n' +
      '                font-family: sans-serif !important;\n' +
      '            }\n' +
      '        </style>\n' +
      '    <![endif]-->\n' +
      '\n' +
      '    <!-- All other clients get the webfont reference; some will render the font and others will silently fail to the fallbacks. More on that here: http://stylecampaign.com/blog/2015/02/webfont-support-in-email/ -->\n' +
      '    <!--[if !mso]><!-->\n' +
      "    <!-- insert web font reference, eg: <link href='https://fonts.googleapis.com/css?family=Roboto:400,700' rel='stylesheet' type='text/css'> -->\n" +
      '    <!--<![endif]-->\n' +
      '\n' +
      '    <!-- Web Font / @font-face : END -->\n' +
      '\n' +
      '    <!-- CSS Reset : BEGIN -->\n' +
      '    <style>\n' +
      '\n' +
      '        /* What it does: Tells the email client that only light styles are provided but the client can transform them to dark. A duplicate of meta color-scheme meta tag above. */\n' +
      '        :root {\n' +
      '          color-scheme: light;\n' +
      '          supported-color-schemes: light;\n' +
      '        }\n' +
      '\n' +
      '        /* What it does: Remove spaces around the email design added by some email clients. */\n' +
      '        /* Beware: It can remove the padding / margin and add a background color to the compose a reply window. */\n' +
      '        html,\n' +
      '        body {\n' +
      '            margin: 0 auto !important;\n' +
      '            padding: 0 !important;\n' +
      '            height: 100% !important;\n' +
      '            width: 100% !important;\n' +
      '        }\n' +
      '\n' +
      '        /* What it does: Stops email clients resizing small text. */\n' +
      '        * {\n' +
      '            -ms-text-size-adjust: 100%;\n' +
      '            -webkit-text-size-adjust: 100%;\n' +
      '        }\n' +
      '\n' +
      '        /* What it does: Centers email on Android 4.4 */\n' +
      '        div[style*="margin: 16px 0"] {\n' +
      '            margin: 0 !important;\n' +
      '        }\n' +
      '\n' +
      '        /* What it does: forces Samsung Android mail clients to use the entire viewport */\n' +
      '        #MessageViewBody, #MessageWebViewDiv{\n' +
      '            width: 100% !important;\n' +
      '        }\n' +
      '\n' +
      '        /* What it does: Stops Outlook from adding extra spacing to tables. */\n' +
      '        table,\n' +
      '        td {\n' +
      '            mso-table-lspace: 0pt !important;\n' +
      '            mso-table-rspace: 0pt !important;\n' +
      '        }\n' +
      '\n' +
      '        /* What it does: Fixes webkit padding issue. */\n' +
      '        table {\n' +
      '            border-spacing: 0 !important;\n' +
      '            border-collapse: collapse !important;\n' +
      '            table-layout: fixed !important;\n' +
      '            margin: 0 auto !important;\n' +
      '        }\n' +
      '\n' +
      '        /* What it does: Uses a better rendering method when resizing images in IE. */\n' +
      '        img {\n' +
      '            -ms-interpolation-mode:bicubic;\n' +
      '        }\n' +
      '\n' +
      '        /* What it does: Prevents Windows 10 Mail from underlining links despite inline CSS. Styles for underlined links should be inline. */\n' +
      '        a {\n' +
      '            text-decoration: none;\n' +
      '        }\n' +
      '\n' +
      '        /* What it does: A work-around for email clients meddling in triggered links. */\n' +
      '        a[x-apple-data-detectors],  /* iOS */\n' +
      '        .unstyle-auto-detected-links a,\n' +
      '        .aBn {\n' +
      '            border-bottom: 0 !important;\n' +
      '            cursor: default !important;\n' +
      '            color: inherit !important;\n' +
      '            text-decoration: none !important;\n' +
      '            font-size: inherit !important;\n' +
      '            font-family: inherit !important;\n' +
      '            font-weight: inherit !important;\n' +
      '            line-height: inherit !important;\n' +
      '        }\n' +
      '\n' +
      '        /* What it does: Prevents Gmail from displaying a download button on large, non-linked images. */\n' +
      '        .a6S {\n' +
      '            display: none !important;\n' +
      '            opacity: 0.01 !important;\n' +
      '        }\n' +
      '\n' +
      '        /* What it does: Prevents Gmail from changing the text color in conversation threads. */\n' +
      '        .im {\n' +
      '            color: inherit !important;\n' +
      '        }\n' +
      '\n' +
      "        /* If the above doesn't work, add a .g-img class to any image in question. */\n" +
      '        img.g-img + div {\n' +
      '            display: none !important;\n' +
      '        }\n' +
      '\n' +
      '        /* What it does: Removes right gutter in Gmail iOS app: https://github.com/TedGoas/Cerberus/issues/89  */\n' +
      "        /* Create one of these media queries for each additional viewport size you'd like to fix */\n" +
      '\n' +
      '        /* iPhone 4, 4S, 5, 5S, 5C, and 5SE */\n' +
      '        @media only screen and (min-device-width: 320px) and (max-device-width: 374px) {\n' +
      '            u ~ div .email-container {\n' +
      '                min-width: 320px !important;\n' +
      '            }\n' +
      '        }\n' +
      '        /* iPhone 6, 6S, 7, 8, and X */\n' +
      '        @media only screen and (min-device-width: 375px) and (max-device-width: 413px) {\n' +
      '            u ~ div .email-container {\n' +
      '                min-width: 375px !important;\n' +
      '            }\n' +
      '        }\n' +
      '        /* iPhone 6+, 7+, and 8+ */\n' +
      '        @media only screen and (min-device-width: 414px) {\n' +
      '            u ~ div .email-container {\n' +
      '                min-width: 414px !important;\n' +
      '            }\n' +
      '        }\n' +
      '\n' +
      '    </style>\n' +
      '    <!-- CSS Reset : END -->\n' +
      '\n' +
      '    <!-- Progressive Enhancements : BEGIN -->\n' +
      '    <style>\n' +
      '\n' +
      '\t    /* What it does: Hover styles for buttons */\n' +
      '\t    .button-td,\n' +
      '\t    .button-a {\n' +
      '\t        transition: all 100ms ease-in;\n' +
      '\t    }\n' +
      '\t    .button-td-primary:hover,\n' +
      '\t    .button-a-primary:hover {\n' +
      '\t        background: #2C2B94 !important;\n' +
      '\t        border-color: #2C2B94 !important;\n' +
      '            font-weight:bold;\n' +
      '\t    }\n' +
      '\n' +
      '\t    /* Media Queries */\n' +
      '\t    @media screen and (max-width: 600px) {\n' +
      '\n' +
      '\t        /* What it does: Adjust typography on small screens to improve readability */\n' +
      '\t        .email-container p {\n' +
      '\t            font-size: 17px !important;\n' +
      '\t        }\n' +
      '\n' +
      '\t    }\n' +
      '\n' +
      '    </style>\n' +
      '    <!-- Progressive Enhancements : END -->\n' +
      '\n' +
      '</head>\n' +
      '<!--\n' +
      '\tThe email background color (#666666) is defined in three places:\n' +
      '\t1. body tag: for most email clients\n' +
      '\t2. center tag: for Gmail and Inbox mobile apps and web versions of Gmail, GSuite, Inbox, Yahoo, AOL, Libero, Comcast, freenet, Mail.ru, Orange.fr\n' +
      '\t3. mso conditional: For Windows 10 Mail\n' +
      '-->\n' +
      '<body width="100%" style="margin: 0; padding: 0 !important; mso-line-height-rule: exactly; background-color: #EEEEEE;">\n' +
      '\t<center role="article" aria-roledescription="email" lang="en" style="width: 100%; background-color: #EEEEEE;">\n' +
      '    <!--[if mso | IE]>\n' +
      '    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #EEEEEE;">\n' +
      '    <tr>\n' +
      '    <td>\n' +
      '    <![endif]-->\n' +
      '\n' +
      '        <!-- Visually Hidden Preheader Text : BEGIN -->\n' +
      '        <div style="max-height:0; overflow:hidden; mso-hide:all;" aria-hidden="true">\n' +
      "            <!-- (Optional) This text will appear in the inbox preview, but not the email body. It can be used to supplement the email subject line or even summarize the email's contents. Extended text preheaders (~490 characters) seems like a better UX for anyone using a screenreader or voice-command apps like Siri to dictate the contents of an email. If this text is not included, email clients will automatically populate it using the text (including image alt text) at the start of the email's body. -->\n" +
      '        </div>\n' +
      '        <!-- Visually Hidden Preheader Text : END -->\n' +
      '\n' +
      '        <!-- Create white space after the desired preview text so email clients don’t pull other distracting text into the inbox preview. Extend as necessary. -->\n' +
      '        <!-- Preview Text Spacing Hack : BEGIN -->\n' +
      '        <div style="display: none; font-size: 1px; line-height: 1px; max-height: 0px; max-width: 0px; opacity: 0; overflow: hidden; mso-hide: all; font-family: sans-serif;">\n' +
      '\t        &zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;\n' +
      '        </div>\n' +
      '        <!-- Preview Text Spacing Hack : END -->\n' +
      '\n' +
      '        <!--\n' +
      '            Set the email width. Defined in two places:\n' +
      '            1. max-width for all clients except Desktop Windows Outlook, allowing the email to squish on narrow but never go wider than 600px.\n' +
      '            2. MSO tags for Desktop Windows Outlook enforce a 600px width.\n' +
      '        -->\n' +
      '        <div style="max-width: 600px; margin: 0 auto;" class="email-container">\n' +
      '            <!--[if mso]>\n' +
      '            <table align="center" role="presentation" cellspacing="0" cellpadding="0" border="0" width="600">\n' +
      '            <tr>\n' +
      '            <td>\n' +
      '            <![endif]-->\n' +
      '\n' +
      '\t        <!-- Email Body : BEGIN -->\n' +
      '\t        <table align="center" role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: auto;">\n' +
      '\t\t        <!-- Email Header : BEGIN\n' +
      '\t            <tr>\n' +
      '\t                <td style="padding: 20px 0; text-align: center">\n' +
      '\t                    <img src="https://via.placeholder.com/200x50" width="200" height="50" alt="alt_text" border="0" style="height: auto; background: #dddddd; font-family: sans-serif; font-size: 15px; line-height: 15px; color: #555555;">\n' +
      '\t                </td>\n' +
      '\t            </tr>\n' +
      '\t\t         Email Header : END -->\n' +
      '\n' +
      '                <!-- Hero Image, Flush : BEGIN -->\n' +
      '                <tr>\n' +
      '                    <td style="background-color: #ffffff;">\n' +
      '                        <img src="https://assurance.appenin.fr/assets/header-validation.png" width="600" height="" alt="alt_text" border="0" style="width: 100%; max-width: 600px; height: auto; background: #000000; font-family: sans-serif; font-size: 15px; line-height: 15px; color: #555555; margin: auto; display: block;" class="g-img">\n' +
      '                    </td>\n' +
      '                </tr>\n' +
      '                <!-- Hero Image, Flush : END -->\n' +
      '\n' +
      '                <!-- 1 Column Text + Button : BEGIN -->\n' +
      '                <tr>\n' +
      '                    <td style="background-color: #ffffff;">\n' +
      '                        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">\n' +
      '                            <tr>\n' +
      '                                <td style="padding: 20px; font-family: sans-serif; font-size: 15px; line-height: 20px; color: #333333;">\n' +
      '                                    <h1 style="margin: 0 0 10px 0; font-family: sans-serif; font-size: 25px; line-height: 30px; color: #2C2B94; font-weight: normal;">Bienvenue chez&nbsp;Appenin&nbsp;!</h1>\n' +
      '                                    <h2 style="margin: 0 0 10px 0; font-family: sans-serif; font-size: 18px; line-height: 22px; color: #333333; font-weight: bold;">Pour poursuivre la souscription de votre assurance habitation, cliquez ci-dessous :</h2>\n' +
      '                                </td>\n' +
      '                            </tr>\n' +
      '                            <tr>\n' +
      '                                <td style="padding: 0 20px;">\n' +
      '                                    <!-- Button : BEGIN -->\n' +
      '                                    <table align="center" role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin: auto;">\n' +
      '                                        <tr>\n' +
      '                                            <td class="button-td button-td-primary" style="border-radius: 24px; background: #2C2B94;">\n' +
      '\t\t\t\t\t\t\t\t\t\t\t     <a class="button-a button-a-primary" href="\n' + uriFr + '" style="background: #2C2B94; border: 1px solid #2C2B94; font-family: sans-serif; font-size: 15px; line-height: 15px; text-decoration: none; padding: 13px 17px; color: #ffffff; display: block; border-radius: 24px;">Valider mon adresse email</a>\n' +
      '\t\t\t\t\t\t\t\t\t\t\t</td>\n' +
      '                                        </tr>\n' +
      '                                    </table>\n' +
      '                                    <!-- Button : END -->\n' +
      '                                </td>\n' +
      '                            </tr>\n' +
      '                            <tr>\n' +
      '                                 <td style="padding: 20px; font-family: sans-serif; font-size: 15px; line-height: 20px; color: #555555;">\n' +
      '                                     <p style="margin: 0;">&nbsp;</p>\n' +
      '                                 </td>\n' +
      '                             </tr>\n' +
      '                        </table>\n' +
      '                    </td>\n' +
      '                </tr>\n' +
      '                <!-- 1 Column Text + Button : END -->\n' +
      '\n' +
      '\n' +
      '                <!-- Clear Spacer : BEGIN -->\n' +
      '                <tr>\n' +
      '                    <td aria-hidden="true" height="1" style="font-size: 0px; line-height: 0px;background: #2C2B94;">\n' +
      '                        &nbsp;\n' +
      '                    </td>\n' +
      '                </tr>\n' +
      '                <!-- Clear Spacer : END -->\n' +
      '\n' +
      '                <!-- 1 Column Text : BEGIN -->\n' +
      '                <tr>\n' +
      '                    <td style="background-color: #ffffff;">\n' +
      '                        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">\n' +
      '                           <tr>\n' +
      '                                 <td style="padding: 20px; font-family: sans-serif; font-size: 15px; line-height: 20px; color: #666666;">\n' +
      '                                     <h1 style="margin: 0 0 10px 0; font-family: sans-serif; font-size: 25px; line-height: 30px; color: #8180BF; font-weight: normal;">Welcome to&nbsp;Appenin!</h1>\n' +
      '                                     <h2 style="margin: 0 0 10px 0; font-family: sans-serif; font-size: 18px; line-height: 22px; color: #666666; font-weight: bold;">Please click here to complete your subscription:</h2>\n' +
      '                                 </td>\n' +
      '                             </tr>\n' +
      '                             <tr>\n' +
      '                                 <td style="padding: 0 20px;">\n' +
      '                                     <!-- Button : BEGIN -->\n' +
      '                                     <table align="center" role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin: auto;">\n' +
      '                                         <tr>\n' +
      '                                             <td class="button-td button-td-primary" style="border-radius: 24px; background: #8180BF;">\n' +
      '                                                  <a class="button-a button-a-primary" href="\n' + uriEn + '" style="background: #8180BF; border: 1px solid #8180BF; font-family: sans-serif; font-size: 15px; line-height: 15px; text-decoration: none; padding: 13px 17px; color: #ffffff; display: block; border-radius: 24px;">Confirm my email address</a>\n' +
      '                                             </td>\n' +
      '                                         </tr>\n' +
      '                                     </table>\n' +
      '                                     <!-- Button : END -->\n' +
      '                                 </td>\n' +
      '                             </tr>\n' +
      '                             <tr>\n' +
      '                                  <td style="padding: 20px; font-family: sans-serif; font-size: 15px; line-height: 20px; color: #555555;">\n' +
      '                                      <p style="margin: 0;">&nbsp;</p>\n' +
      '                                  </td>\n' +
      '                              </tr>\n' +
      '                        </table>\n' +
      '                    </td>\n' +
      '                </tr>\n' +
      '                <!-- 1 Column Text : END -->\n' +
      '\n' +
      '            </table>\n' +
      '            <!-- Email Body : END -->\n' +
      '\n' +
      '            <!-- Email Footer : BEGIN -->\n' +
      '\t        <table align="center" role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: auto; background: #2B2C94;">\n' +
      '                <tr>\n' +
      '                    <td style="padding: 20px; font-family: sans-serif; font-size: 12px; line-height: 15px; text-align: center; color: #ffffff;">\n' +
      '                        <span class="unstyle-auto-detected-links">Appenin, SAS au capital de 7&nbsp;038&nbsp;400&nbsp;€ – RCS&nbsp;Paris&nbsp;482&nbsp;112&nbsp;331</span><br>\n' +
      '                        <span class="unstyle-auto-detected-links">86/90 rue Saint-Lazare 75009 Paris – n<sup>o</sup>&nbsp;ORIAS 20001013 (www.orias.fr) – www.appenin.fr</span>\n' +
      '                    </td>\n' +
      '                </tr>\n' +
      '            </table>\n' +
      '            <!-- Email Footer : END -->\n' +
      '\n' +
      '            <!--[if mso]>\n' +
      '            </td>\n' +
      '            </tr>\n' +
      '            </table>\n' +
      '            <![endif]-->\n' +
      '        </div>\n' +
      '\n' +
      '        <!-- Full Bleed Background Section : BEGIN -->\n' +
      '        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="">\n' +
      '            <tr>\n' +
      '                <td>\n' +
      '                    <div align="center" style="max-width: 600px; margin: auto;" class="email-container">\n' +
      '                        <!--[if mso]>\n' +
      '                        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" align="center">\n' +
      '                        <tr>\n' +
      '                        <td>\n' +
      '                        <![endif]-->\n' +
      '                        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">\n' +
      '                            <tr>\n' +
      '                                <td style="padding: 20px; text-align: left; font-family: sans-serif; font-size: 15px; line-height: 20px; color: #ffffff;">\n' +
      '                                    <p style="margin: 0;">&nbsp;</p>\n' +
      '                                </td>\n' +
      '                            </tr>\n' +
      '                        </table>\n' +
      '                        <!--[if mso]>\n' +
      '                        </td>\n' +
      '                        </tr>\n' +
      '                        </table>\n' +
      '                        <![endif]-->\n' +
      '                    </div>\n' +
      '                </td>\n' +
      '            </tr>\n' +
      '        </table>\n' +
      '        <!-- Full Bleed Background Section : END -->\n' +
      '\n' +
      '    <!--[if mso | IE]>\n' +
      '    </td>\n' +
      '    </tr>\n' +
      '    </table>\n' +
      '    <![endif]-->\n' +
      '    </center>\n' +
      '</body>\n' +
      '</html>'

  return html
}

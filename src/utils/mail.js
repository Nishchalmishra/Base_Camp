import Mailgen from "mailgen";
import nodemailer from "nodemailer";

/** 
const sendEmail = async (options) => { 
    const mailGenerator =new Mailgen({
        theme: "default",
        product: {
            name: "Project Management App",
            link: "https://project-management-app.vercel.app/"
        }
    })

    const emailTextual = mailGenerator.generatePlaintext(options.mailgenContent)

    const emailHtml = mailGenerator.generate(options.mailgenContent)

    const transporter = nodemailer.createTransport({
        host: process.env.MAILTRAP_SMTP_HOST,
        port: process.env.MAILTRAP_SMTP_PORT,
        auth: {
            user: process.env.MAILTRAP_SMTP_EMAIL,
            pass: process.env.MAILTRAP_SMTP_PASSWORD
        }
    })

    const mail = {
        from: "mail.taskmanager.com",
        to: options.email,
        subject: options.subject,
        text: emailTextual,
        html: emailHtml
    }

    try {
        await transporter.sendMail(mail)
    } catch (error) {
        console.log(error);    
    }
}
*/

const sendEmail = async (options) => {
    
    const mailGenerator = new Mailgen({
        theme: "default",
        product: {
            name: "Project Management App",
            link: "https://project-management-app.vercel.app/"
        }
    })

    const emailTextual = mailGenerator.generatePlaintext(options.mailgenContent)

    const emailHtml = mailGenerator.generate(options.mailgenContent)

    const transporter = nodemailer.createTransport({
        host: process.env.MAILTRAP_SMTP_HOST,
        port: process.env.MAILTRAP_SMTP_PORT,
        auth: {
            user: process.env.MAILTRAP_SMTP_EMAIL,
            pass: process.env.MAILTRAP_SMTP_PASSWORD
        }
    })


    const mail = {
        from: "mail.taskmanager.com",
        to: options.email,
        subject: options.subject,
        text: emailTextual,
        html: emailHtml
    }

    try {
        await transporter.sendMail(mail)
    } catch (error) {
        console.log(error);
    }

}


const emailVerificationMailgenContent = (username, verficationUrl) => {
    return {
        body: {
            name: username,
            intro: "Welcome to project management app! We're very excited to have you on board.",
            action: {
                instructions: "To verify your email, please click here:",
                button: {
                    color: "#22BC66",
                    text: "Confirm your email",
                    link: verficationUrl
                }
            },
            outro: "Need help, or have questions? Just reply to this email, we'd love to help."
        }
    }
}
const forgotPasswordMailgenContent = (username, resetUrl) => {
    return {
        body: {
            name: username,
            intro: "We got a request to reset your password",
            action: {
                instructions: "To reset your password, please click here:",
                button: {
                    color: "#22BC66",
                    text: "Confirm your email",
                    link: resetUrl
                }
            },
            outro: "Need help, or have questions? Just reply to this email, we'd love to help."
        }
    }
}

export {emailVerificationMailgenContent, sendEmail, forgotPasswordMailgenContent}
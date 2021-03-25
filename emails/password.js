const sgMail = require('@sendgrid/mail')

const sendgridAPIKey = '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'

// sgMail.setApiKey(process.env.SENDGRID_API_KEY)

sgMail.setApiKey(sendgridAPIKey)

const forgotPassword = (email, name, id) => {
    sgMail.send({
        to: email,
        from: 'amiraamr1538@gmail.com',
        subject: 'Your password reset request !',
        text: `Hey ${name} ! As you required a password reset follow the link .. http://localhost:5000/api/auth/verifypassword/${id}`
    })
}

const verifiedPassword = (email) => {
    sgMail.send({
        to: email,
        from: 'amiraamr1538@gmail.com',
        subject: 'Password reset succeeded',
        text: `Your password is successfully reset. كل الشكر`
    })
}


module.exports = {
    forgotPassword,
    verifiedPassword
}
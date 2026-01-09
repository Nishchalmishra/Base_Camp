import { Router} from "express";

// app.get("/test-email", async (req, res) => {
//     try {
//         await sendEmail({
//             email: "YOUR_PERSONAL_EMAIL@gmail.com",
//             subject: "Resend test email",
//             mailgenContent: {
//                 body: {
//                     name: "Tester",
//                     intro: "If you received this email, Resend is working 🎉",
//                     outro: "All good."
//                 }
//             }
//         });

//         res.send("Email sent successfully 🚀");
//     } catch (err) {
//         res.status(500).send("Email failed");
//     }
// });

const router = Router();

router.route("/test-email").get(async (req, res) => {
    try {
        await sendEmail({
            email: "YOUR_PERSONAL_EMAIL@gmail.com",
            subject: "Resend test email",
            mailgenContent: {
                body: {
                    name: "Tester",
                    intro: "If you received this email, Resend is working 🎉",
                    outro: "All good."
                }
            }
        });

        res.send("Email sent successfully 🚀");
    } catch (err) {
        res.status(500).send("Email failed");
    }
})

export default router

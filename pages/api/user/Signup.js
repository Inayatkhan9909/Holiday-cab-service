import bcrypt from "bcrypt";
import errorHandler from "../../../utils/Features";
import ConnectDb from "../../../utils/DbConnect";
import User from "../../../Models/userModel";
import GenerateOtp from "../../../utils/GenerateOtp"
import sendEmail from "../../../utils/Sendmail";

const SignupHandler = async (req, res) => {


    if (req.method !== "POST") {
        return errorHandler(res, 400, "Only POST Method is allowed");
    }

    try {
        const { firstname, lastname, email, phone, password } = req.body;

        if (firstname === "" && lastname === "" && phone === "" && email === "" && password === "") {
            return errorHandler(res, 400, "All Credentials Required!");
        }

        if (phone.length !== 10) {
            toast.error("Phone number must be 10 digits");
            return;
          }

        await ConnectDb();
        const Alreadyexists = await User.findOne({ email });
        if (Alreadyexists) {
            return errorHandler(res, 400, "User alredy exists");
        }
        const verified = false;
        const otp = GenerateOtp();
        const pageUrl = process.env.PAGE_URL;
        const verificationUrl = `${pageUrl}/user/Verifyuser?email=${encodeURIComponent(email)}`;
        const html = `<p>Your OTP code is: <b>${otp}</b></p> <br/> <p>${verificationUrl}</p>`;
        const sent = await sendEmail(email, 'OTP Verification', html);

        if (!sent) {

            return errorHandler(res, 400, "invalid email");
        }

        const passencrypt = await bcrypt.hash(password, 10);
        let isAdmin = false;
        if ( email === process.env.MY_EMAIL) {
          isAdmin = true;
        }
        const user = await User.create({
            firstname,
            lastname,
            email,
            phone,
            otp,
            verified,
            password: passencrypt,
            isAdmin

        });

        if (user) {

            res.status(201).json({ message: "User Created Succesfully" });

        }


    }
    catch (error) {
        console.log(error);
        errorHandler(res, 500, "Server Error");
    }

}

export default SignupHandler

const Receptionist = require("../model/receptionist.model")



class ReceptionistController {
    async loginReceptionist(req, res) {
        try {
            const { email, password } = req.body;

            if (!email || !password) {
                return res.status(400).json({
                    status: false,
                    message: "Email and password are required",
                });
            }

            const receptionist = await Receptionist.findOne({ email });
            if (!receptionist) {
                return res.status(401).json({
                    status: false,
                    message: "Invalid email or password",
                });
            }

            const isMatch = await bcryptjs.compare(password, receptionist.password);
            if (!isMatch) {
                return res.status(401).json({
                    status: false,
                    message: "Invalid password",
                });
            }

            if (!receptionist.isVerified && !receptionist.role == 'receptionist') {
                return res.status(403).json({
                    status: false,
                    message: "Email not verified or you are not a receptionist.",
                });
            }

            // generate access token using jwt
            const accessToken = jwt.sign(
                {
                    id:  receptionist._id,
                    name:  receptionist.name,
                    email:  receptionist.email,
                    role:  receptionist.role,
                },
                process.env.JWT_SECRET || "jwt-secret-key",
                { expiresIn: "1m" }
            );

            const refreshToken = jwt.sign(
                {
                    id:  receptionist._id,
                    name:  receptionist.name,
                    email:  receptionist.email,
                    role: receptionist.role,
                },
                process.env.JWT_SECRET || "jwt_secret_key",
                { expiresIn: "7d" }
            );

            // hashed refresh token for security
            const hashedRefreshToken = await bcryptjs.hash(refreshToken, 10);
            // Store refresh token in the database
            receptionist.refreshToken = hashedRefreshToken;
            await receptionist.save();

            const token = {
                accessToken: accessToken,
                refreshToken: refreshToken,
            };

            // set cookie for refresh token
            res.cookie("accessToken", accessToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production", // Set to true in production
                sameSite: "strict",
                maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
            });

            res.status(200).json({
                status: true,
                message: "Login successful",
                data: { doctorId: receptionist._id, email: receptionist.email },
                token,
            });
        } catch (error) {
            console.log(err);
            res.status(500).json({
                status: false,
                message: "Server error in login user",
            });
        }
    }

    async getAllReceptionist(req,res){
        
    }
}
module.exports = new ReceptionistController()
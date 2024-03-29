const express = require('express');
const router = express.Router();

const bcrypt = require('bcryptjs');
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

const User = require("../models/User.model");
const Cart = require('../models/Cart.model');

const isAuthenticated = require("../middleware/isAuthenticated");

// ! SIGNUP

router.post('/signup', async (req, res, next) => {
    try {
        const { email, password, name } = req.body;

        if (!email || !password || !name) {
            res.status(400).json({ message: "Provide email, password, or name" });
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
        if (!emailRegex.test(email)) {
            res.status(400).json({ message: 'Provide a valid email address.' });
            return;
        }

        // const passwordRegex = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,}/;
        // if (!passwordRegex.test(password)) {
        //     res.status(400).json({ message: 'Password must have at least 6 characters and contain at least one number, one lowercase and one uppercase letter.' });
        //     return;
        // }

        const foundUser = await User.findOne({ email });
        if (foundUser) {
            res.status(400).json({ message: "User already exists." });
            return;
        }

        const salt = bcrypt.genSaltSync(10);
        const hashedPassword = bcrypt.hashSync(password, salt);

        const createdUser = await User.create({ email, password: hashedPassword, name });
        const { _id, role } = createdUser;

        const user = { email, name, _id };

        const payload = { _id, email, name, role };

        const authToken = jwt.sign(
            payload,
            process.env.SECRET,
            { algorithm: 'HS256', expiresIn: "24h" }
        );

        // Create user cart when they sign up
        const createdCart = await Cart.create({ user: createdUser._id });
        createdUser.cart = createdCart._id;
        await createdUser.save();

        res.status(201).json({ user, authToken });

    } catch (error) {
        if (error instanceof mongoose.Error.ValidationError) {
            console.log("There was an error", error);
            res.status(501).json({ message: "Provide all fields", error });
        } else if (error.code === 11000) {
            console.log("Duplicate value", error);
            res.status(502).json({ message: "Invalid name, password, or email" });
        } else {
            console.log("Error =>", error);
            res.status(503).json({ message: "Unable to sign up user" });
        }
    }
});

// ! LOGIN

router.post('/login', async (req, res, next) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            res.status(400).json({ message: "Provide email and password." });
            return;
        }

        const foundUser = await User.findOne({ email });

        if (!foundUser) {
            res.status(401).json({ message: "User or password not found." });
            return;
        }

        const passwordCorrect = bcrypt.compareSync(password, foundUser.password);

        if (passwordCorrect) {
            const { _id, email, name, role } = foundUser;

            const payload = { _id, email, name, role };

            const authToken = jwt.sign(
                payload,
                process.env.SECRET,
                { algorithm: 'HS256', expiresIn: "1h" }
            );

            res.status(200).json({ authToken: authToken });
        } else {
            res.status(401).json({ message: "Unable to authenticate the user" });
        }
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error" });
    }
});

router.get("/verify", isAuthenticated, (req, res, next) => {
    res.status(201).json(req.user);
});

module.exports = router;








// const express = require('express');
// const router = express.Router();

// const bcrypt = require('bcryptjs'); // bcrypt is used for encrypting the passwords before saving them in the database,
// const jwt = require("jsonwebtoken"); // jsonwebtoken which we will use to create and sign new JSON Web Tokens,
// const mongoose = require("mongoose");

// const User = require("../models/User.model");

// const isAuthenticated = require("../middleware/isAuthenticated");

// // ! SIGNUP

// router.post('/signup', (req, res, next) => {
//     const { email, password, name } = req.body;
   
//     if (!email || !password || !name) {
//       res.status(400).json({ message: "Provide email, password, or name" });
//       return;
//     }
   
//     const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
//     if (!emailRegex.test(email)) {
//       res.status(400).json({ message: 'Provide a valid email address.' });
//       return;
//     }
    
//     const passwordRegex = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,}/;
//     if (!passwordRegex.test(password)) {
//       res.status(400).json({ message: 'Password must have at least 6 characters and contain at least one number, one lowercase and one uppercase letter.' });
//       return;
//     }
   
//     User.findOne({ email })
//       .then((foundUser) => {
//         if (foundUser) {
//           res.status(400).json({ message: "User already exists." });
//           return;
//         }
   
//         const salt = bcrypt.genSaltSync(10);
//         const hashedPassword = bcrypt.hashSync(password, salt);
   
//         User.create({ email, password: hashedPassword, name })
//         .then((createdUser) => {
//           const { email, name, _id, role } = createdUser;
        
//           const user = { email, name, _id };

//           const payload = { _id, email, name, role};
   
//           // Create and sign the token
//           const authToken = jwt.sign( 
//             payload,
//             process.env.SECRET,
//             { algorithm: 'HS256', expiresIn: "24h" }
//           );
     
//           res.status(201).json({ user, authToken });
//         })
//         .catch(error => {
//             if (error instanceof mongoose.Error.ValidationError) {
//                 console.log("There was an error", error);
//                 res.status(501).json({ message: "Provide all fields", error})
//             } else if (error.code === 11000) {
//                 console.log("Duplicate value", error)
//                 res.status(502).json({message: "Invalid name, password, or email"})
//             } else {
//                 console.log("Error =>", error)
//                 res.status(503).json({message: "Unable to sign up user"})
//             }
//         });
//       })
//       .catch(error => {
//         console.log(error);
//         res.status(500).json({ message: "Internal Server Error" })
//       });
//   });

//   // ! LOGIN

//   router.post('/login', (req, res, next) => {
//     const { email, password } = req.body;
   
//     if (!email || !password) {
//       res.status(400).json({ message: "Provide email and password." });
//       return;
//     }
   
//     User.findOne({ email })
//       .then((foundUser) => {
      
//         if (!foundUser) {
//           res.status(401).json({ message: "User or password not found." })
//           return;
//         }
   
//         const passwordCorrect = bcrypt.compareSync(password, foundUser.password);
   
//         if (passwordCorrect) {
//           const { _id, email, name , role} = foundUser;
          
//           const payload = { _id, email, name, role };
   
//           const authToken = jwt.sign( 
//             payload,
//             process.env.SECRET,
//             { algorithm: 'HS256', expiresIn: "1h" }
//           );
   
//           res.status(200).json({ authToken: authToken });
//         }
//         else {
//           res.status(401).json({ message: "Unable to authenticate the user" });
//         }
   
//       })
//       .catch(error => res.status(500).json({ message: "Internal Server Error" }));
//   });

//   router.get("/verify", isAuthenticated, (req, res, next) => {
//     // res.status(201).json({user: req.user});
//     res.status(201).json(req.user);
//   });

// module.exports = router;
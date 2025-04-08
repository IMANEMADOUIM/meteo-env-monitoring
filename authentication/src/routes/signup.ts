import express, { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { User } from '../models';
import mongoose from 'mongoose';

export const SIGNUP_ROUTE = '/api/authentication/signup';

const signUpRouter = express.Router();

// Add JSON body parser middleware
signUpRouter.use(express.json());

signUpRouter.post(
  SIGNUP_ROUTE,
  [
    body('email')
      .isEmail()
      .withMessage('Email must be in a valid format')
      .normalizeEmail(),
    body('password')
      .trim()
      .isLength({ min: 8, max: 32 })
      .withMessage('Password must be between 8 and 32 characters'),
    body('password')
      .matches(/^(.*[a-z].*)$/)
      .withMessage('Password must contain at least one lowercase letter'),
    body('password')
      .matches(/^(.*[A-Z].*)$/)
      .withMessage('Password must contain at least one uppercase letter'),
    body('password')
      .matches(/^(.*\d.*)$/)
      .withMessage('Password must contain at least one digit'),
    body('password').escape(),
  ],
  async (req: Request, res: Response) =>  {
     const errors = validationResult(req);
    
    if (!errors.isEmpty()) {
      res.sendStatus(422).json({});
      return;
    }

    if (/.+@[A-Z]/g.test(req.body.email)) {
       res.sendStatus(422);
       return;
    }

    if (/[><'(\/)]/g.test(req.body.password)) {
    res.sendStatus(422);
    return;
    };

    const { email, password } = req.body;

    try {
      // Check for existing user
      const existingUser = await User.findOne({ email });
      if (existingUser) {
           res.sendStatus(422).json({ 
          error: 'Email already in use' 
        });
      }

    const newUser =  await User.create({ email, password });  
    
    res.status(201).send({  email: newUser.email });
  }catch (error) {
    console.error('Signup error:', error);
       res.status(500).json({ 
      error: 'Internal server error' 
    });
  }
}
);

export default signUpRouter;

import bcrypt from "bcryptjs";

import { connectDB } from "@/lib/mongodb";
import User from "@/server/models/User";
import mongoose from "mongoose";

export default async function handler(request, response) {
  try {
    const body = await request.body;

    const username = body.username?.trim().toLowerCase();
    const password = body.password;
    const referenceId = body.referenceId;
    const referencePassword = body.referencePassword;


    if (!username || !password ) {
      return response.json(
        { message: "All fields are required" },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return response.json(
        {
          message:
            "Password must contain at least 8 characters",
        },
        { status: 400 }
      );
    }

    await connectDB();

    
    // check refernce id is valid through password matching
    const hasUsers = await User.exists({});

    
    
    if(hasUsers){

      if (!referenceId || !referencePassword) {
        return response.json(
          {
            message:
              "Reference ID and reference password are required",
          },
          { status: 400 }
        );
      }

      if (!mongoose.Types.ObjectId.isValid(referenceId)) {
        console.log(referenceId);
        return response.json(
          {
            message: "Invalid reference ID",
          },
          { status: 400 }
        );
      }
      const referencerUser = await User.findOne({_id : referenceId})


      
      if(!referencerUser){
        return response.json(
          {
            message:
            "Refernce User does not exists",
          },
          { status: 400 }
        );
      }

      const passwordMatch = await bcrypt.compare(
        referencePassword,
        referencerUser.password
      );
      
      if(!passwordMatch){
        return response.json(
          {
            message:
            "Refernce User Password not matched",
          },
          { status: 400 }
        );
      }
    }
    

    
    

    const existingUser = await User.findOne({ username });

    if (existingUser) {
      return response.json(
        {
          message: "An account with this username already exists",
        },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    await User.create({
      username,
      password: hashedPassword,
    });

    return response.json(
      {
        message: "Account created successfully",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(error);

    return response.json(
      {
        message: "Something went wrong",
      },
      { status: 500 }
    );
  }
}
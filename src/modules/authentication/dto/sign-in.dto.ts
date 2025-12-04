import { IsEmail, IsNotEmpty, IsString, Matches, MinLength } from "class-validator";

export class SignInDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8, { message: "Password must be at least 8 characters long" })
  @Matches(
    /^(?=.*\d)(?=.*[A-Z])(?=.*[!@#$%^&*(),.?":{}|<>])[A-Za-z\d!@#$%^&*(),.?":{}|<>]{8,}$/,
    {
      message:
        "Password must be at least 8 characters long, contain at least one uppercase letter, one number, and one special character",
    })
    password: string;
}

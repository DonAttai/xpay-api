import { Request } from "express";
import { User } from "src/users/entities/user.entity";

interface RequestObject extends Request {
  user: User;
}

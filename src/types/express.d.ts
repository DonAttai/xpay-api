import { Request } from "express";

interface RequestObject extends Request {
  user: {
    id: number;
  };
}

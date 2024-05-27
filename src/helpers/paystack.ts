import axios from "axios";

export type InitializeTransactionType = {
  email: string;
  amount: number;
  reference?: string;
  callback_url: string;
};
export class Paystack {
  API_URL = "https://api.paystack.co";

  headers = {
    headers: {
      Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
      "Content-Type": "application/json",
    },
  };

  async initializeTransaction(data: InitializeTransactionType) {
    const res = await axios.post(
      `${this.API_URL}/transaction/initialize`,
      data,
      this.headers,
    );
    return res.data;
  }

  async verifyTransaction(reference: string) {
    const res = await axios.get(
      `${this.API_URL}/transaction/verify/${reference}`,
      this.headers,
    );
    return res.data;
  }
}

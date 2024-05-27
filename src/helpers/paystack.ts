import axios from "axios";

export type InitializeTransactionType = {
  email: string;
  amount: number;
  reference?: string;
  callback_url: string;
};
export class Paystack {
  initializePaymentURL = "https://api.paystack.co/transaction/initialize";
  verifyPaymentURL = "https://api.paystack.co/transaction/verify";

  headers = {
    headers: {
      Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
      "Content-Type": "application/json",
    },
  };

  async initializeTransaction(data: InitializeTransactionType) {
    const res = await axios.post(this.initializePaymentURL, data, this.headers);
    return res.data;
  }

  async verifyPayment(paymentReference: string) {
    const res = await axios.get(
      `this.verifyPaymentURL/:${paymentReference}`,
      this.headers,
    );
    return res.data;
  }
}

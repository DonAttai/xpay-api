import axios from 'axios';

export type InitializeTransactionType = {
  email: string;
  amount: number;
  reference?: string;
};
export class Paystack {
  paystackURL = 'https://api.paystack.co/transaction/initialize';

  async initializeTransaction(data: InitializeTransactionType) {
    const res = await axios.post(this.paystackURL, data, {
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
    });
    return res.data;
  }
}

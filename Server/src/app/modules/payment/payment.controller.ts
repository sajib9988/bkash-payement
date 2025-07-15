import { Request, Response } from 'express';
import { createBkashPayment, handleBkashCallback } from './payment.service';

export const initiatePayment = async (req: Request, res: Response) => {
  try {
    const { amount } = req.body;
    const data = await createBkashPayment(amount);
    res.json({ url: data.bkashURL });
  } catch (error) {
    console.error('[INITIATE_PAYMENT]', error);
    res.status(500).json({ error: 'Payment initiation failed' });
  }
};

export const bkashCallback = async (req: Request, res: Response) => {
  try {
    const result = await handleBkashCallback(req.body);
    res.status(200).json(result);
  } catch (error) {
    console.error('[CALLBACK_ERROR]', error);
    res.status(500).json({ error: 'Callback error' });
  }
};

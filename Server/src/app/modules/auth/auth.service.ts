import config from "../../config";
import { jwtHelpers } from "../../helper/jwt.helper";
import { prisma } from "../../middleware/prisma"
import bcrypt from 'bcrypt';
import { Request } from "express";

const logInUser = async (
  payload: { email: string; password: string },
  req: Request
) => {
  const userData = await prisma.user.findUniqueOrThrow({
    where: {
      email: payload.email
    }
  });

  const isCorrectPassword: boolean = await bcrypt.compare(payload.password, userData.password);
  if (!isCorrectPassword) {
    throw new Error("Password is incorrect");
  }

  // ✅ CHECK DEVICE COUNT FOR USER
  const userDevices = await prisma.device.findMany({
    where: { userId: userData.id },
    orderBy: { createdAt: 'asc' } // oldest first
  });

  if (userDevices.length >= 2) {
    // পুরাতন ডিভাইস delete
    await prisma.device.delete({
      where: { id: userDevices[0].id }
    });
  }

  // ✅ SAVE NEW DEVICE INFO
  await prisma.device.create({
    data: {
      userId: userData.id,
      userAgent: req.headers['user-agent'] || 'unknown',
      ipAddress: req.ip || 'unknown',
    }
  });

  // ✅ Token Generate
  const accessToken = jwtHelpers.createToken(
    { userId: userData.id,
      email: userData.email,
      name:userData.name,
      role: userData.role,
    },
    config.jwt.secret as string,
    config.jwt.expiresIn as string
  );

  const newRefreshToken = jwtHelpers.createToken(
    { userId: userData.id,
      email: userData.email,
      name:userData.name,
      role: userData.role,
    },
    config.jwt.refresh_token_secret as string,
    config.jwt.refresh_token_expires_in as string
  )
console.log("accesstoken", accessToken);
  return {
    accessToken,
    refreshToken: newRefreshToken
  };
};

const refreshToken = async (token: string) => {
  let decodedData;
  try {
    decodedData = jwtHelpers.verifyToken(token, config.jwt.refresh_token_secret as string);
  } catch (err) {
    throw new Error("Invalid refresh token");
  }

  const userData = await prisma.user.findUniqueOrThrow({
    where: { email: decodedData.email }
  });

  const accessToken = jwtHelpers.createToken(
    { userId: userData.id,
      email: userData.email,
      name:userData.name,
      role: userData.role,
    },
    config.jwt.secret as string,
    config.jwt.expiresIn as string
  );

  return {
    accessToken
  };
};

export const authService = {
  logInUser,
  refreshToken
}

'use server';

import { cookies } from 'next/headers';
import { SignJWT } from 'jose';
import bcrypt from 'bcryptjs';

export async function login(prevState: any, formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    return { error: 'Por favor, preencha todos os campos.' };
  }

  if (!adminEmail || !adminPassword) {
    console.error('ADMIN_EMAIL ou ADMIN_PASSWORD não configurados no .env');
    return { error: 'Erro de configuração do servidor.' };
  }

  if (email !== adminEmail) {
    return { error: 'Credenciais inválidas.' };
  }

  // Compara usando bcryptjs ou diretamente se o .env não tiver hash
  // Vamos assumir que se o adminPassword começar com $2, é hash do bcrypt
  let isPasswordValid = false;
  if (adminPassword.startsWith('$2')) {
    isPasswordValid = await bcrypt.compare(password, adminPassword);
  } else {
    isPasswordValid = password === adminPassword;
  }

  if (!isPasswordValid) {
    return { error: 'Credenciais inválidas.' };
  }

  const secret = new TextEncoder().encode(
    process.env.JWT_SECRET || 'fallback_secret_key_for_development'
  );
  
  // 8 horas a partir de agora
  const expiresIn = 8 * 60 * 60;

  const token = await new SignJWT({ email, role: 'admin' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('8h')
    .sign(secret);

  const cookieStore = await cookies();
  
  cookieStore.set('auth_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: expiresIn,
    path: '/',
  });

  return { success: true };
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete('auth_token');
  return { success: true };
}

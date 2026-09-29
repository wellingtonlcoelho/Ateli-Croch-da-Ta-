export async function hashPassword(password) {
  const msgUint8 = new TextEncoder().encode(password + "salt-secreto-croche-da-ta"); 
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export function generateToken() {
  return crypto.randomUUID();
}

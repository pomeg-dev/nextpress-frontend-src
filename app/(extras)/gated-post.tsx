import { getServerSession } from 'next-auth';
import { authOptions } from '../api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';

export async function GatedPost({
  settings,
  path,
}: {
  settings: any;
  path: string;
}) {
  const session = await getServerSession(authOptions);
  let loginPage = settings?.login_page?.path ?? 'login';
  loginPage = loginPage.replace(/^\/|\/$/g, '');
  let registerPage = settings?.register_page?.path ?? 'register';
  registerPage = registerPage.replace(/^\/|\/$/g, '');
  const isOnAuthPage = path === loginPage || path === registerPage;

  if (!session && !isOnAuthPage) {
    const referrer = `${process.env.NEXTAUTH_URL}/${path}`;
    const redirectUrl = `/${loginPage}?referrer=${encodeURIComponent(referrer)}`;
    redirect(redirectUrl);
  }

  return (
    <></>
  );
}
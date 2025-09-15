export { default } from 'next-auth/middleware';

export const config = {
  matcher: ['/dashboard/:path*', '/projects/:path*', '/learning/:path*', '/community/:path*'],
};

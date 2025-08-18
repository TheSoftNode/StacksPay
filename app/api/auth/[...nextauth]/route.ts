import NextAuth from 'next-auth';

const handler = NextAuth({
  // NextAuth configuration will go here
  providers: [],
  pages: {
    signIn: '/login',
  },
});

export { handler as GET, handler as POST };

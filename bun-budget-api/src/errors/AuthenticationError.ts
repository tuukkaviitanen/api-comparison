class AuthenticationError extends Error {
  constructor(public message: string) {
    super(message);
  }
}

export default AuthenticationError;

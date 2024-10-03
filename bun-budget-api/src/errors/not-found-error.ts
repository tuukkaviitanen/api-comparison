class NotFoundError extends Error {
  constructor(public message: string) {
    super(message);
  }
}

export default NotFoundError;
